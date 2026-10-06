from django.db import models


class SparePart(models.Model):

    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'

    id = models.BigAutoField(primary_key=True)

    part_name = models.CharField(
        max_length=150
    )

    part_code = models.CharField(
        max_length=50,
        unique=True
    )

    quantity = models.PositiveIntegerField(
        default=0
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    reorder_level = models.PositiveIntegerField(
        default=5
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.part_code} - {self.part_name}"


class JobPart(models.Model):

    id = models.BigAutoField(primary_key=True)

    job_card = models.ForeignKey(
        'repairs.JobCard',
        on_delete=models.CASCADE,
        related_name='job_parts'
    )

    spare_part = models.ForeignKey(
        SparePart,
        on_delete=models.PROTECT,
        related_name='job_parts'
    )

    quantity = models.PositiveIntegerField()

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    total_price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.job_card.job_card_number} - {self.spare_part.part_name}"