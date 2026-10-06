from django.contrib import admin
from .models import SparePart, JobPart


@admin.register(SparePart)
class SparePartAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'part_code',
        'part_name',
        'quantity',
        'unit_price',
        'reorder_level',
        'status',
        'created_at',
    )

    list_filter = (
        'status',
    )

    search_fields = (
        'part_code',
        'part_name',
    )


@admin.register(JobPart)
class JobPartAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'job_card',
        'spare_part',
        'quantity',
        'unit_price',
        'total_price',
        'created_at',
    )

    search_fields = (
        'job_card__job_card_number',
        'spare_part__part_name',
        'spare_part__part_code',
    )