# jobs/utils.py
from .models import Job
from django.utils import timezone
from datetime import timedelta

def upsert_external_job(
    source, external_id, title, company, description, skills, experience,
    location, job_type, external_url
):
    if not external_id:
        return None

    obj, created = Job.objects.update_or_create(
        external_id=external_id,
        defaults={
            "title": title or "Untitled Job",
            "company": company or "Unknown",
            "location": location or "Not specified",
            "description": description or "",
            "skills_required": skills or "",
            "experience_required": experience or "",
            "job_type": job_type or "fulltime",
            "source": source,
            "external_url": external_url,
            "expires_at": timezone.now() + timedelta(days=7)
        }
    )
    return obj
