
class RelatorioDespesasView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        despesas = Despesa.objects.all().order_by('-data_vencimento')
        excel_buffer = gerar_excel_despesas(despesas)
        
        response = HttpResponse(excel_buffer, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="relatorio_financeiro.xlsx"'
        return response
