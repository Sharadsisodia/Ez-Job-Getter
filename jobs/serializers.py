from rest_framework import serializers
from .models import Job

class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = '__all__'


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = ["title", "company", "location", "description", "experience_required", "skills_required", "job_type"]
