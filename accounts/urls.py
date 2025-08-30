from django.contrib import admin
from django.urls import path
from . import views
urlpatterns = [
    path('api/accounts/signup/', views.SignupView.as_view(), name='signup'),
    path('api/accounts/verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
    path('api/accounts/login/', views.LoginView.as_view(), name='login'),
    # path('api/accounts/logout/', views.LogoutView.as_view(), name='logout'),
    path('api/accounts/resend-otp/', views.ResendOTPView.as_view(), name='resend-otp'),
]