# from django.contrib import admin
# from django.urls import path
# from . import views

from rest_framework.routers import DefaultRouter
from .views import AccountViewSet

router = DefaultRouter()
router.register(r'accounts', AccountViewSet, basename='accounts')

urlpatterns = router.urls

# urlpatterns = [
#     path('api/accounts/signup/', views.SignupView.as_view(), name='signup'),
#     path('api/accounts/verify-otp/', views.VerifyOTPView.as_view(), name='verify-otp'),
#     path('api/accounts/login/', views.LoginView.as_view(), name='login'),
#     path('api/accounts/logout/', views.LogoutView.as_view(), name='logout'),
#     path('api/accounts/resend-otp/', views.ResendOTPView.as_view(), name='resend-otp'),
# ]