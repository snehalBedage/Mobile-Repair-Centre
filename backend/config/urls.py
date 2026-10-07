from django.contrib import admin
from django.urls import path, include

from apps.accounts.views import (
    CustomTokenObtainPairView,
    AdminTestView,
    CustomerRegistrationView,
        ForgotPasswordView,
        ResetPasswordView

)

from rest_framework_simplejwt.views import TokenRefreshView


urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Authentication
    path(
        'api/auth/login/',
        CustomTokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'api/auth/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    # Customer Registration
    path(
        'api/auth/register/',
        CustomerRegistrationView.as_view(),
        name='customer_register'
    ),

    # Admin Test API
    path(
        'api/auth/admin-test/',
        AdminTestView.as_view(),
        name='admin_test'
    ),
        # Forgot Password
    path(
        'api/auth/forgot-password/',
        ForgotPasswordView.as_view(),
        name='forgot_password'
    ),
    # Reset Password
    path(
        'api/auth/reset-password/',
        ResetPasswordView.as_view(),
        name='reset_password'
    ),
    path('api/customers/', include('apps.customers.urls')),
]