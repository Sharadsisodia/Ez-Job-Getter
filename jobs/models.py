from django.db import models
from django.utils import timezone
import hashlib
from django.conf import settings   # ✅ Import settings to use AUTH_USER_MODEL

class Job(models.Model):
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('internship', 'Internship'),
        ('remote', 'Remote')
    ]

    # ✅ Use settings.AUTH_USER_MODEL instead of auth.User
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="jobs",
        help_text="Employer who posted the job (null if scraped)"
    )

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    source = models.CharField(max_length=32)  # e.g., 'naukri' or 'employer'
    job_type = models.CharField(max_length=32, choices=JOB_TYPE_CHOICES)
    experience_required = models.CharField(max_length=128, blank=True)
    skills_required = models.CharField(max_length=256, blank=True)
    external_url = models.URLField(blank=True, null=True)  # ✅ Allow empty if created by employer
    external_id = models.CharField(max_length=128, unique=True, blank=True, null=True)
    dedupe_hash = models.CharField(max_length=64, db_index=True)
    expires_at = models.DateTimeField()
    posted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        # ✅ Only generate external_id if URL is present (scraped jobs)
        if not self.external_id and self.external_url:
            self.external_id = hashlib.md5(self.external_url.encode('utf-8')).hexdigest()

        # ✅ Deduplication always applied
        self.dedupe_hash = hashlib.md5(
            f'{self.title}|{self.company}|{self.location}'.encode('utf-8')
        ).hexdigest()

        # ✅ Default expiry (7 days) if not set
        if not self.expires_at:
            self.expires_at = (self.created_at or timezone.now()) + timezone.timedelta(days=7)

        super().save(*args, **kwargs)
