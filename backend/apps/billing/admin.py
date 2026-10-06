from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card',
        'payment_reference',
        'amount',
        'payment_method',
        'payment_status',
        'payment_date',
        'created_at',
    )

    list_filter = (
        'payment_method',
        'payment_status',
    )

    search_fields = (
        'payment_reference',
        'job_card__job_card_number',
    )