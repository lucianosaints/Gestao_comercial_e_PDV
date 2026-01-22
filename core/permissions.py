from rest_framework import permissions
from .models import Gestor

class IsGestor(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o usuário é um Gestor.
    """
    def has_permission(self, request, view):
        return hasattr(request.user, 'gestor') and request.user.gestor.is_active # Assumindo que Gestor tem um campo is_active ou similar

class IsGestorWithCadastrarPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar
        except Gestor.DoesNotExist:
            return False

class IsGestorWithDarBaixaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de dar baixa.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_dar_baixa
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarUnidadePermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar unidade.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_unidade
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarCategoriaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar categoria.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_categoria
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarCategoriaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar categoria.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar_categoria
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarSalaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar sala.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_sala
        except Gestor.DoesNotExist:
            return False

class IsGestorWithEditarSalaPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de editar sala.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_editar_sala
        except Gestor.DoesNotExist:
            return False

class IsGestorWithCadastrarGestorPermission(permissions.BasePermission):
    """
    Permissão personalizada para verificar se o Gestor tem permissão de cadastrar gestor.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        try:
            gestor = request.user.gestor
            return gestor.pode_cadastrar_gestor
        except Gestor.DoesNotExist:
            return False

class OrPermission(permissions.BasePermission):
    """
    Combina permissões com lógica OR.
    """
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        for permission_class in self.permissions:
            if permission_class().has_permission(request, view):
                return True
        return False

    def has_object_permission(self, request, view, obj):
        for permission_class in self.permissions:
            if hasattr(permission_class(), 'has_object_permission') and permission_class().has_object_permission(request, view, obj):
                return True
        return False

class AndPermission(permissions.BasePermission):
    """
    Combina permissões com lógica AND.
    """
    def __init__(self, *permissions):
        self.permissions = permissions

    def has_permission(self, request, view):
        for permission_class in self.permissions:
            if not permission_class().has_permission(request, view):
                return False
        return True

    def has_object_permission(self, request, view, obj):
        for permission_class in self.permissions:
            if hasattr(permission_class(), 'has_object_permission') and not permission_class().has_object_permission(request, view, obj):
                return False
        return True