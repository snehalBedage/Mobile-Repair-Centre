from django.contrib import admin

from .models import (
    Technician,
    JobCard,
    Estimate,
    StatusHistory,
    Warranty,
)


@admin.register(Technician)
class TechnicianAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'name',
        'mobile',
        'email',
        'specialization',
        'status',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'name',
        'mobile',
        'email',
        'specialization',
    )


@admin.register(JobCard)
class JobCardAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card_number',
        'customer',
        'device',
        'technician',
        'status',
        'priority',
        'intake_date',
        'completed_date',
        'created_at',
    )

    list_filter = (
        'status',
        'priority',
    )

    search_fields = (
        'job_card_number',
        'tracking_token',
        'customer__name',
        'customer__customer_code',
        'device__imei',
    )


@admin.register(Estimate)
class EstimateAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card',
        'service_cost',
        'parts_cost',
        'total_amount',
        'approval_status',
        'approved_by',
        'approved_at',
        'created_at',
    )

    list_filter = (
        'approval_status',
    )

    search_fields = (
        'job_card__job_card_number',
    )


@admin.register(StatusHistory)
class StatusHistoryAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card',
        'status',
        'changed_by',
        'changed_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'job_card__job_card_number',
        'changed_by__name',
    )


@admin.register(Warranty)
class WarrantyAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card',
        'warranty_number',
        'start_date',
        'end_date',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'warranty_number',
        'job_card__job_card_number',
    )