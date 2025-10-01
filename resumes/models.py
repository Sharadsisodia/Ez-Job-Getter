from django.db import models

#create your model here.

class Resume(models.Model):
    resume = models.FileField(upload_to="resume1", null=True, blank=True)
    raw_text = models.TextField(null=True, blank=True)  # extracted resume text
    parsed_data = models.JSONField(null=True, blank=True)     # skills, email, etc.
    ats_score = models.IntegerField(default=0)
    grammar_score = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    def __str__(self):
        return self.resume.name if self.resume else f"Resume {self.pk}"

class JobDescription(models.Model):
    job_title = models.CharField(max_length=100)
    job_description = models.TextField()


    def __str__(self):
        return self.job_title

