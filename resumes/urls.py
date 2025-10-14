from django.contrib import admin
from django.urls import path, include
from .views import JobDescriptionAPI
from rest_framework.routers import DefaultRouter
from .views import ResumeViewSet


# ---- ViewSet router for resumes ----
router = DefaultRouter()
router.register(r"resumes", ResumeViewSet, basename="resume")


api_urlpatterns = [
    path('api/jobs/', JobDescriptionAPI.as_view()),
    # path('api/resume/', AnalyzeResumeAPI.as_view()),
]


# Combine router URLs + APIView URLs
urlpatterns = [
    path('', include(router.urls)),   # resumes/ + custom actions
] + api_urlpatterns