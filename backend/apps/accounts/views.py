import os
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework.permissions import IsAuthenticated


from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import (
    CustomTokenObtainPairSerializer,
    CustomerRegistrationSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer
)

from .permissions import IsAdmin
from .models import User


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class AdminTestView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            "message": "Admin access granted",
            "role": request.user.role
        })


class CustomerRegistrationView(APIView):
    permission_classes = []

    def post(self, request):

        serializer = CustomerRegistrationSerializer(
            data=request.data
        )

        if serializer.is_valid():
            user = serializer.save()

            return Response({
                "message": "Customer registration successful.",
                "customer": {
                    "name": user.name,
                    "email": user.email,
                    "role": user.role
                }
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ForgotPasswordView(APIView):
    permission_classes = []

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            email = serializer.validated_data['email']

            user = User.objects.filter(
                email=email,
                is_active=True
            ).first()

            # Security:
            # Do not reveal whether the email exists.
            if user:

                uid = urlsafe_base64_encode(
                    force_bytes(user.pk)
                )

                token = default_token_generator.make_token(user)

                reset_link = (
                    f"http://localhost:5173/reset-password/{uid}/{token}/"
                )

                send_mail(
                    subject="Password Reset - Mobile Repair Centre",

                    message=f"""
Hello {user.name},

We received a request to reset your password.

Click the link below to reset your password:

{reset_link}

If you did not request this password reset, please ignore this email.

Regards,
Mobile Repair Centre
""",

                    from_email=os.getenv('EMAIL_HOST_USER'),

                    recipient_list=[
                        user.email
                    ],

                    fail_silently=False,
                )

            return Response({
                "message": "If an account with this email exists, a password reset link has been sent."
            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ResetPasswordView(APIView):
    permission_classes = []

    def post(self, request):

        uid = request.data.get('uid')
        token = request.data.get('token')

        if not uid or not token:
            return Response({
                "message": "Invalid password reset request."
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            from django.utils.http import urlsafe_base64_decode

            user_id = urlsafe_base64_decode(uid).decode()

            user = User.objects.get(
                pk=user_id,
                is_active=True
            )

        except (
            TypeError,
            ValueError,
            OverflowError,
            User.DoesNotExist
        ):

            return Response({
                "message": "Invalid or expired reset link."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(
            user,
            token
        ):

            return Response({
                "message": "Invalid or expired reset link."
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(
            serializer.validated_data['new_password']
        )

        user.save()

        return Response({
            "message": "Password reset successful. You can now login with your new password."
        }, status=status.HTTP_200_OK)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "name": request.user.name,
            "email": request.user.email,
            "role": request.user.role,
            "is_active": request.user.is_active
        }, status=status.HTTP_200_OK)