from rest_framework import generics

from .models import Technician
from .serializers import TechnicianSerializer
from .permissions import IsAdminOrStaff


class TechnicianListCreateView(generics.ListCreateAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
    permission_classes = [IsAdminOrStaff]


class TechnicianDetailView(generics.RetrieveUpdateAPIView):
    queryset = Technician.objects.all()
    serializer_class = TechnicianSerializer
    permission_classes = [IsAdminOrStaff]