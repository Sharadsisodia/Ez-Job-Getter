from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .models import Job
from .serializers import JobSerializer
from .scraper import scrape_jobs

class JobSearchApi(APIView):
    def get(self, request):
        role = request.GET.get('role')
        location = request.GET.get('location', '')
        pages = int(request.GET.get('pages', 1))
        force_refresh = request.GET.get('force_refresh', '0') == '1'
        sources = request.GET.get('sources', 'naukri,linkedin,internshala').split(',')

        # 1. Try DB first
        jobs_qs = Job.objects.filter(
            title__icontains=role,
            location__icontains=location,
            expires_at__gte=timezone.now(),
        )
        if jobs_qs.exists() and not force_refresh:
            return Response(JobSerializer(jobs_qs, many=True).data)

        # 2. Else scrape, upsert, return fresh jobs
        jobs = scrape_jobs(sources, role, location, pages)
        return Response(JobSerializer(jobs, many=True).data)




#-------------------CRUD OPERATIONS--------------------------
# jobs/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils import timezone
from .models import Job
from .serializers import JobSerializer, JobCreateSerializer

class EmployerJobListCreateApi(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List jobs posted by this employer"""
        if not hasattr(request.user, "userprofile") or not request.user.userprofile.is_employer:
            return Response({"detail": "Only employers can view jobs"}, status=status.HTTP_403_FORBIDDEN)
        jobs = Job.objects.filter(employer=request.user, source="employer")
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new job"""
        if not hasattr(request.user, "userprofile") or not request.user.userprofile.is_employer:
            return Response({"detail": "Only employers can post jobs"}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobCreateSerializer(data=request.data)
        if serializer.is_valid():
            job = serializer.save(
                employer=request.user,
                source="employer",
                posted_at=timezone.now(),
                expires_at=timezone.now() + timezone.timedelta(days=30)
            )
            return Response(JobSerializer(job).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployerJobDetailApi(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            job = Job.objects.get(pk=pk, employer=user, source="employer")
            return job
        except Job.DoesNotExist:
            return None

    def put(self, request, pk):
        """Update employer job"""
        if not hasattr(request.user, "userprofile") or not request.user.userprofile.is_employer:
            return Response({"detail": "Only employers can update jobs"}, status=status.HTTP_403_FORBIDDEN)

        job = self.get_object(pk, request.user)
        if not job:
            return Response({"detail": "Job not found or not owned by you"}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobCreateSerializer(job, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(JobSerializer(job).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        """Delete employer job"""
        if not hasattr(request.user, "userprofile") or not request.user.userprofile.is_employer:
            return Response({"detail": "Only employers can delete jobs"}, status=status.HTTP_403_FORBIDDEN)

        job = self.get_object(pk, request.user)
        if not job:
            return Response({"detail": "Job not found or not owned by you"}, status=status.HTTP_404_NOT_FOUND)

        job.delete()
        return Response({"detail": "Job deleted successfully"}, status=status.HTTP_204_NO_CONTENT)



from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny

class JobViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Job search"""
        view = JobSearchApi.as_view()
        return view(request._request)

    @action(detail=False, methods=['get', 'post'], permission_classes=[IsAuthenticated])
    def employer_jobs(self, request):
        """List or create employer jobs"""
        view = EmployerJobListCreateApi.as_view()
        return view(request._request)

    @action(detail=True, methods=['get', 'put', 'delete'], permission_classes=[IsAuthenticated])
    def employer_job_detail(self, request, pk=None):
        """Detail, update, delete employer job"""
        view = EmployerJobDetailApi.as_view()
        return view(request._request, pk=pk)
