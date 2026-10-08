from rest_framework import generics

from .models import Customer, Device
from .serializers import CustomerSerializer, DeviceSerializer
from .permissions import (
    IsAdminOrStaff,
    IsAdminStaffOrOwnCustomer,
    IsAdminStaffOrOwnDevice,
)


# =====================================================
# CUSTOMER VIEWS
# =====================================================

class CustomerListCreateView(generics.ListCreateAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user

        # ADMIN / STAFF can see all customers
        if user.role in ['ADMIN', 'STAFF']:
            queryset = Customer.objects.all()
        else:
            # CUSTOMER can see only their own profile
            queryset = Customer.objects.filter(user=user)

        # Search
        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                customer_code__icontains=search
            ) | queryset.filter(
                mobile__icontains=search
            ) | queryset.filter(
                email__icontains=search
            )

        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnCustomer()]


class CustomerDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Customer.objects.all()

        return Customer.objects.filter(user=user)

    def get_permissions(self):
        return [IsAdminStaffOrOwnCustomer()]


# =====================================================
# DEVICE VIEWS
# =====================================================

class DeviceListCreateView(generics.ListCreateAPIView):
    serializer_class = DeviceSerializer

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            queryset = Device.objects.select_related(
                'customer',
                'customer__user'
            ).all()
        else:
            queryset = Device.objects.filter(
                customer__user=user
            ).select_related(
                'customer',
                'customer__user'
            )

        # Search
        search = self.request.query_params.get('search')

        if search:
            queryset = queryset.filter(
                brand__icontains=search
            ) | queryset.filter(
                model__icontains=search
            ) | queryset.filter(
                imei__icontains=search
            ) | queryset.filter(
                customer__name__icontains=search
            ) | queryset.filter(
                customer__customer_code__icontains=search
            )

        return queryset

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminOrStaff()]

        return [IsAdminStaffOrOwnDevice()]


class DeviceDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [IsAdminStaffOrOwnDevice]

    def get_queryset(self):
        user = self.request.user

        if user.role in ['ADMIN', 'STAFF']:
            return Device.objects.select_related(
                'customer',
                'customer__user'
            ).all()

        return Device.objects.filter(
            customer__user=user
        ).select_related(
            'customer',
            'customer__user'
        )