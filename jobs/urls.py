# from django.urls import path
# from .views import JobSearchApi, EmployerJobListCreateApi, EmployerJobDetailApi


from rest_framework.routers import DefaultRouter
from .views import JobViewSet

router = DefaultRouter()
router.register(r'jobs', JobViewSet, basename='jobs')

urlpatterns = router.urls


# urlpatterns = [
#     path('api/jobs/search/', JobSearchApi.as_view(), name='job-search'),
#     path("api/employer/jobs/", EmployerJobListCreateApi.as_view(), name="employer-job-list-create"),
#     path("api/employer/jobs/<int:pk>/", EmployerJobDetailApi.as_view(), name="employer-job-detail"),
# ]
