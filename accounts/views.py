from django.shortcuts import render

# Create your views here.
import secrets
import datetime
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from .models import User, OTP
from .serializers import RegisterSerializer, VerifyOTPSerializer, LoginSerializer, UserSerializer

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.views import APIView



OTP_TTL_MINUTES = 10


def generate_otp():
    # secure 6-digit OTP
    return f"{secrets.randbelow(900000) + 100000}"


class SignupView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']


        # If user exists and is verified -> error. If exists but not verified -> update password/name/role
        existing = User.objects.filter(email=email).first()
        if existing:
            if existing.is_verified:
                return Response({'error': 'User with this email already exists and verified.'}, status=status.HTTP_400_BAD_REQUEST)
            user = existing
            # update fields
            user.name = serializer.validated_data.get('name', user.name)
            user.role = serializer.validated_data.get('role', user.role)
            if 'password' in serializer.validated_data:
                user.set_password(serializer.validated_data['password'])
            user.save()
        else:
            user = serializer.save()


        # Invalidate old unused OTPs
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)


        otp_code = generate_otp()
        expires_at = timezone.now() + datetime.timedelta(minutes=OTP_TTL_MINUTES)
        OTP.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)


        # send email synchronously (ok for dev); move to Celery for production
        subject = 'Your verification OTP'
        message = f'Hi {user.name},\nYour verification OTP is: {otp_code}\nIt expires in {OTP_TTL_MINUTES} minutes.'
        from_email = settings.EMAIL_HOST_USER
        send_mail(subject, message, from_email, [user.email], fail_silently=False)

        return Response({'message': 'Signup successful. OTP sent to email.'}, status=status.HTTP_201_CREATED)


class VerifyOTPView(generics.GenericAPIView):
    serializer_class = VerifyOTPSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        otp = OTP.objects.filter(user=user, otp_code=otp_code, is_used=False).order_by('-created_at').first()
        if not otp or otp.is_expired():
            return Response({'error': 'Invalid or expired OTP'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark OTP as used and verify user
        otp.is_used = True
        otp.save()
        user.is_verified = True
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]


    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']


        # authenticate using email as username (our USERNAME_FIELD)
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.is_verified:
            return Response({'error': 'Email not verified'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
            }
        }, status=status.HTTP_200_OK)

from rest_framework import serializers, generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
User = get_user_model()

# Serializer for Resend OTP
class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

class ResendOTPView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ResendOTPSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        if user.is_verified:
            return Response({'message': 'User already verified.'}, status=status.HTTP_400_BAD_REQUEST)

        # Optional: simple rate-limiting - prevent resend within X seconds (e.g., 60s)
        last_otp = OTP.objects.filter(user=user).order_by('-created_at').first()
        if last_otp:
            cooldown_seconds = 60
            if (timezone.now() - last_otp.created_at).total_seconds() < cooldown_seconds and not last_otp.is_used:
                return Response({'error': 'Please wait before requesting a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Invalidate old unused OTPs
        OTP.objects.filter(user=user, is_used=False).update(is_used=True)

        # Create new OTP
        otp_code = generate_otp()
        expires_at = timezone.now() + datetime.timedelta(minutes=OTP_TTL_MINUTES)
        OTP.objects.create(user=user, otp_code=otp_code, expires_at=expires_at)

        # Send email (sync for dev)
        subject = 'Your verification OTP'
        message = f'Hi {user.name},\nYour verification OTP is: {otp_code}\nIt expires in {OTP_TTL_MINUTES} minutes.'
        from_email = settings.EMAIL_HOST_USER
        try:
            send_mail(subject, message, from_email, [user.email], fail_silently=False)
        except Exception as exc:
            # Add error logging
            return Response({'error': 'Failed to send OTP, try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'OTP sent successfully.'}, status=status.HTTP_200_OK)


# Logout API
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # blacklist the refresh token
            return Response({"message": "Logged out successfully"}, status=200)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=400)


from rest_framework import viewsets, mixins
from rest_framework.decorators import action

class AccountViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['post'])
    def signup(self, request):
        view = SignupView.as_view()
        return view(request._request)

    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        view = VerifyOTPView.as_view()
        return view(request._request)

    @action(detail=False, methods=['post'])
    def login(self, request):
        view = LoginView.as_view()
        return view(request._request)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        view = LogoutView.as_view()
        return view(request._request)

    @action(detail=False, methods=['post'])
    def resend_otp(self, request):
        view = ResendOTPView.as_view()
        return view(request._request)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
