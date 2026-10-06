from django.contrib import admin
from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'action',
        'table_name',
        'record_id',
        'created_at',
    )

    list_filter = (
        'action',
        'table_name',
    )

    search_fields = (
        'user__name',
        'user__email',
        'action',
        'table_name',
        'record_id',
    )