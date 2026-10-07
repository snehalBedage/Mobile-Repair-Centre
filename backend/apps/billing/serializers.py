from decimal import Decimal

from rest_framework import serializers

from .models import Payment
from apps.repairs.models import JobCard


class BillingSummarySerializer(serializers.Serializer):
    job_card_id = serializers.IntegerField()
    job_card_number = serializers.CharField()
    customer = serializers.CharField()
    device = serializers.CharField()

    total_bill = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    paid_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    remaining_amount = serializers.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    billing_status = serializers.CharField()


class PaymentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Payment

        fields = [
            'id',
            'job_card',
            'payment_reference',
            'amount',
            'payment_method',
            'payment_status',
            'payment_date',
            'created_at',
        ]

        read_only_fields = [
            'id',
            'payment_status',
            'created_at',
        ]

    def validate_amount(self, value):

        if value <= Decimal('0.00'):
            raise serializers.ValidationError(
                "Payment amount must be greater than 0."
            )

        return value

    def validate_payment_reference(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Payment reference cannot be empty."
            )

        return value

    def validate_job_card(self, value):

        if value.status == JobCard.Status.CANCELLED:
            raise serializers.ValidationError(
                "Payment cannot be added to a cancelled Job Card."
            )

        return value

    def validate(self, attrs):

        job_card = attrs.get('job_card')

        if self.instance:
            job_card = self.instance.job_card

        amount = attrs.get(
            'amount',
            self.instance.amount if self.instance else None
        )

        if job_card and amount:

            total_bill = self._get_total_bill(job_card)

            paid_amount = self._get_paid_amount(
                job_card,
                exclude_payment=self.instance
            )

            remaining_amount = total_bill - paid_amount

            if amount > remaining_amount:
                raise serializers.ValidationError({
                    'amount': (
                        f"Payment amount cannot be greater than "
                        f"remaining amount of {remaining_amount}."
                    )
                })

        return attrs

    def _get_total_bill(self, job_card):

        estimate = job_card.estimates.filter(
            approval_status='APPROVED'
        ).order_by('-id').first()

        if not estimate:
            raise serializers.ValidationError(
                "Approved estimate is required before payment."
            )

        return estimate.total_amount

    def _get_paid_amount(
        self,
        job_card,
        exclude_payment=None
    ):

        payments = job_card.payments.filter(
            payment_status=Payment.PaymentStatus.PAID
        )

        if exclude_payment:
            payments = payments.exclude(
                id=exclude_payment.id
            )

        total = sum(
            (payment.amount for payment in payments),
            Decimal('0.00')
        )

        return total