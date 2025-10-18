from django.core.management.base import BaseCommand
from jobs.scraper import scrape_internshala

class Command(BaseCommand):
    help = 'Scrape Internshala for jobs'

    def add_arguments(self, parser):
        parser.add_argument('--role', required=True)
        parser.add_argument('--location', type=str, default='')
        parser.add_argument('--pages', type=int, default=1)

    def handle(self, *args, **options):
        total = 0
        for job, created in scrape_internshala(options['role'], options['location'], options['pages']):
            msg = "Added" if created else "Updated"
            self.stdout.write(f"{msg}: {job.title} ({job.company}) [{job.external_id[:6]}...](Expires: {job.expires_at.date()})")
            total += 1
        self.stdout.write(f"\nTotal jobs processed: {total}")
