from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'location', 'source', 'job_type', 'expires_at', 'is_expired']
    search_fields = ['title', 'company', 'location']
    list_filter = ['source', 'job_type', 'expires_at']
    readonly_fields = ('created_at',)
