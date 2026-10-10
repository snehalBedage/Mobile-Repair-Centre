from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from apps.customers.models import Customer


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['name'] = user.name
        token['email'] = user.email

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data['role'] = self.user.role
        data['name'] = self.user.name
        data['email'] = self.user.email

        return data


class CustomerRegistrationSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True,
        required=True
    )

    mobile = serializers.CharField(
        write_only=True,
        required=True
    )

    address = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )

    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'password',
            'confirm_password',
            'mobile',
            'address',
        ]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'required': True
            },
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value.lower()

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        return data

    def create(self, validated_data):

        validated_data.pop('confirm_password')

        mobile = validated_data.pop('mobile')
        address = validated_data.pop('address', '')

        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='CUSTOMER'
        )

        Customer.objects.create(
            user=user,
            customer_code=f"CUST{user.id:05d}",
            name=user.name,
            mobile=mobile,
            email=user.email,
            address=address,
            status='ACTIVE'
        )

        return user
class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        return value.lower()


class ResetPasswordSerializer(serializers.Serializer):

    new_password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8
    )

    confirm_password = serializers.CharField(
        write_only=True,
        required=True
    )

    def validate(self, data):

        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        return data


class UserManagementSerializer(serializers.ModelSerializer):
    """Safe user details for Admin user management."""

    class Meta:
        model = User
        fields = [
            'id',
            'name',
            'email',
            'role',
            'is_active',
            'created_at',
        ]
        read_only_fields = fields


class StaffCreateSerializer(serializers.ModelSerializer):
    """Allow Admin to create Staff accounts safely."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        required=True,
    )

    class Meta:
        model = User
        fields = [
            'name',
            'email',
            'password',
        ]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )

        return value

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Name cannot be empty.'
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            role='STAFF',
        )
