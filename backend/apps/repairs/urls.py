from django.urls import path

from .views import (
    TechnicianListCreateView,
    TechnicianDetailView,
    TechnicianStatusUpdateView,
    JobCardListCreateView,
    JobCardDetailView,
    JobCardStatusUpdateView,
    JobCardStatusHistoryView,
    EstimateListCreateView,
    EstimateDetailView,
    EstimateApprovalView,
     WarrantyListCreateView,
    WarrantyDetailView,
    WarrantyStatusUpdateView,
)


urlpatterns = [

    # =====================================================
    # Technician APIs
    # =====================================================

    path(
        'technicians/',
        TechnicianListCreateView.as_view(),
        name='technician-list-create'
    ),

    path(
        'technicians/<int:pk>/',
        TechnicianDetailView.as_view(),
        name='technician-detail'
    ),

    path(
        'technicians/<int:pk>/status/',
        TechnicianStatusUpdateView.as_view(),
        name='technician-status-update'
    ),


    # =====================================================
    # Job Card APIs
    # =====================================================

    path(
        'job-cards/',
        JobCardListCreateView.as_view(),
        name='job-card-list-create'
    ),

    path(
        'job-cards/<int:pk>/',
        JobCardDetailView.as_view(),
        name='job-card-detail'
    ),

    path(
        'job-cards/<int:pk>/status/',
        JobCardStatusUpdateView.as_view(),
        name='job-card-status-update'
    ),

    path(
        'job-cards/<int:pk>/status-history/',
        JobCardStatusHistoryView.as_view(),
        name='job-card-status-history'
    ),

    path(
    'estimates/',
    EstimateListCreateView.as_view(),
    name='estimate-list-create'
),

path(
    'estimates/<int:pk>/',
    EstimateDetailView.as_view(),
    name='estimate-detail'
),

path(
    'estimates/<int:pk>/approval/',
    EstimateApprovalView.as_view(),
    name='estimate-approval'
),

path(
    'warranties/',
    WarrantyListCreateView.as_view(),
    name='warranty-list-create'
),

path(
    'warranties/<int:pk>/',
    WarrantyDetailView.as_view(),
    name='warranty-detail'
),

path(
    'warranties/<int:pk>/status/',
    WarrantyStatusUpdateView.as_view(),
    name='warranty-status-update'
),

]