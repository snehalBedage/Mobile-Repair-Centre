from rest_framework import generics,status
from rest_framework.response import Response

from .models import SparePart
from .serializers import (
    SparePartSerializer,
    StockAddSerializer,
    )

from apps.repairs.permissions import IsAdminOrStaff


class SparePartListCreateView(generics.ListCreateAPIView):

    queryset = SparePart.objects.all().order_by('-id')
    serializer_class = SparePartSerializer
    permission_classes = [IsAdminOrStaff]


class SparePartDetailView(generics.RetrieveUpdateAPIView):

    queryset = SparePart.objects.all()
    serializer_class = SparePartSerializer
    permission_classes = [IsAdminOrStaff]


class SparePartAddStockView(generics.GenericAPIView):

    queryset = SparePart.objects.all()
    serializer_class = StockAddSerializer
    permission_classes = [IsAdminOrStaff]

    def post(self, request, *args, **kwargs):

        spare_part = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        added_quantity = serializer.validated_data['quantity']

        previous_quantity = spare_part.quantity

        spare_part.quantity += added_quantity
        spare_part.save()

        return Response(
            {
                'message': 'Stock added successfully.',
                'part_id': spare_part.id,
                'part_name': spare_part.part_name,
                'previous_quantity': previous_quantity,
                'added_quantity': added_quantity,
                'new_quantity': spare_part.quantity,
            },
            status=status.HTTP_200_OK
        )