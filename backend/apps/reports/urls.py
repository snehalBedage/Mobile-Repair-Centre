from django.urls import path
from .views import (
    AuditLogListView,
    DashboardSummaryView,
    JobCardStatusReportView,
    RevenuePaymentReportView,
    InventoryReportView,
    RepairPerformanceReportView,
)
urlpatterns = [
    path('audit-logs/', AuditLogListView.as_view(), name='audit-log-list'),

    path('reports/dashboard-summary/', DashboardSummaryView.as_view(), name='dashboard-summary'),

    path(
    'reports/job-card-status/',
    JobCardStatusReportView.as_view(),
    name='job-card-status-report'
),

path(
    'reports/revenue/',
    RevenuePaymentReportView.as_view(),
    name='revenue-payment-report'
),

path(
    'reports/inventory/',
    InventoryReportView.as_view(),
    name='inventory-report'
),

path(
    'reports/repair-performance/',
    RepairPerformanceReportView.as_view(),
    name='repair-performance-report'
),

path(
    'reports/job-card-status/',
    JobCardStatusReportView.as_view(),
    name='job-card-status-report'
),

path(
    'reports/revenue/',
    RevenuePaymentReportView.as_view(),
    name='revenue-payment-report'
),

path(
    'reports/inventory/',
    InventoryReportView.as_view(),
    name='inventory-report'
),

path(
    'reports/repair-performance/',
    RepairPerformanceReportView.as_view(),
    name='repair-performance-report'
),

]