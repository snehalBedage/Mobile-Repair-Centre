from django.contrib import admin
from .models import Customer, Device


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer_code',
        'name',
        'mobile',
        'email',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'customer_code',
        'name',
        'mobile',
        'email',
    )


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'customer',
        'brand',
        'model',
        'imei',
        'device_condition',
        'created_at',
    )

    search_fields = (
        'brand',
        'model',
        'imei',
        'customer__name',
        'customer__customer_code',
    )