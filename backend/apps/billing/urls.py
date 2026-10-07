from django.urls import path

from .views import (
    BillingSummaryView,
    PaymentListCreateView,
    PaymentDetailView,
    PaymentReceiptView,
)


urlpatterns = [
    path(
        'job-cards/<int:job_card_id>/',
        BillingSummaryView.as_view(),
        name='billing-summary'
    ),

    path(
        'payments/',
        PaymentListCreateView.as_view(),
        name='payment-list-create'
    ),

    path(
        'payments/<int:pk>/',
        PaymentDetailView.as_view(),
        name='payment-detail'
    ),

    path(
        'payments/<int:pk>/receipt/',
        PaymentReceiptView.as_view(),
        name='payment-receipt'
    ),
]