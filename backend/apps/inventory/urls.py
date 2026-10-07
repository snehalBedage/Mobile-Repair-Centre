from django.urls import path

from .views import (
    SparePartListCreateView,
    SparePartDetailView,
     SparePartAddStockView,
      JobPartListCreateView,
    JobPartDetailView,
)


urlpatterns = [

    path(
        'spare-parts/',
        SparePartListCreateView.as_view(),
        name='spare-part-list-create'
    ),

    path(
        'spare-parts/<int:pk>/',
        SparePartDetailView.as_view(),
        name='spare-part-detail'
    ),
    path(
    'spare-parts/<int:pk>/add-stock/',
    SparePartAddStockView.as_view(),
    name='spare-part-add-stock'
),

    path(
    'job-parts/',
    JobPartListCreateView.as_view(),
    name='job-part-list-create'
),

path(
    'job-parts/<int:pk>/',
    JobPartDetailView.as_view(),
    name='job-part-detail'
),

]