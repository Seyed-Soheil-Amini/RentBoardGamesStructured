from django.urls import path
from .views import (
    BookRentalView,
    HandoverRentalView,
    CancelRentalView,
    ReturnRentalView,
    MyRentalsListView,
    CafeRentalsListView
)

urlpatterns = [
    path('book/', BookRentalView.as_view(), name='book_rental'),
    path('my-rentals/', MyRentalsListView.as_view(), name='my_rentals'),
    path('cafe-rentals/', CafeRentalsListView.as_view(), name='cafe_rentals'),
    path('<int:pk>/cancel/', CancelRentalView.as_view(), name='cancel_rental'),
    path('<int:pk>/handover/', HandoverRentalView.as_view(), name='handover_rental'),
    path('<int:pk>/return/', ReturnRentalView.as_view(), name='return_rental'),
]
