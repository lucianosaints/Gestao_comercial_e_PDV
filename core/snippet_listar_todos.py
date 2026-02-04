    @action(detail=False, methods=['get'])
    def listar_todos(self, request):
        """
        Endpoint sem paginação para o PDV carregar todos os produtos de uma vez.
        Útil para manter a performance do PDV local enquanto não migramos para busca server-side lá.
        """
        produtos = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(produtos, many=True)
        return Response(serializer.data)
