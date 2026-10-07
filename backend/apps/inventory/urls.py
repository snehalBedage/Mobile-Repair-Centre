from django.urls import path

from .views import (
    SparePartListCreateView,
    SparePartDetailView,
     SparePartAddStockView,
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

]