from django.urls import path
from .views import FinancialReportView, ActivityReportView

urlpatterns = [
    path('reports/financial/', FinancialReportView.as_view()),
    path('reports/activity/', ActivityReportView.as_view()),
]