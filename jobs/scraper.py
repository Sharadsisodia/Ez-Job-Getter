import time
import hashlib
from django.utils import timezone
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
from .models import Job

# -------------------- Upsert Function --------------------
def upsert_job(data, source):
    external_url = data['external_url']
    if not external_url:
        print(f"[{source}] Skipping job: missing external_url")
        return None, False

    dedupe_hash = hashlib.md5(f"{data['title']}|{data['company']}|{data['location']}".encode('utf-8')).hexdigest()
    job_defaults = {
        "title": data['title'],
        "company": data['company'],
        "location": data['location'],
        "description": data.get('description', ''),
        "posted_at": data.get('posted_at'),
        "experience_required": data.get('experience_required', ''),
        "skills_required": ','.join(data.get('skills_required', [])),
        "job_type": data.get('job_type', 'full-time'),
        "source": source,
        "external_url": external_url,
        "expires_at": timezone.now() + timezone.timedelta(days=7),
    }

    obj, created = Job.objects.update_or_create(dedupe_hash=dedupe_hash, defaults=job_defaults)
    if created:
        print(f"[{source}] Added: {data['title']} at {data['company']}")
    else:
        print(f"[{source}] Updated: {data['title']} at {data['company']}")
    return obj, created

# -------------------- Chrome Driver --------------------
def init_driver(headless=True):
    chrome_options = Options()
    if headless:
        chrome_options.add_argument("--headless")
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(options=chrome_options)
    return driver

# -------------------- Naukri Scraper --------------------
def scrape_naukri(role, location, pages=1):
    driver = init_driver(headless=False)  # headless=True for production
    wait = WebDriverWait(driver, 30)
    try:
        for page in range(1, pages + 1):
            search_url = f"https://www.naukri.com/{role}-jobs-in-{location}?page={page}"
            print(f"[Naukri] Loading: {search_url}")
            driver.get(search_url)

            try:
                wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.srp-jobtuple-wrapper")))
            except:
                print(f"[Naukri] Page {page} may be empty or took too long")
                continue

            job_cards = driver.find_elements(By.CSS_SELECTOR, "div.srp-jobtuple-wrapper")
            print(f"[Naukri] Found {len(job_cards)} jobs on page {page}")

            for job_card in job_cards:
                try:
                    # Job Title
                    title_tag = job_card.find_element(By.CSS_SELECTOR, "a.title")
                    title = title_tag.text.strip() if title_tag else ''

                    # Company
                    try:
                        company_tag = job_card.find_element(By.CSS_SELECTOR, "a.comp-name")
                    except:
                        company_tag = job_card.find_element(By.CSS_SELECTOR, "span.comp-name")
                    company = company_tag.text.strip() if company_tag else ''

                    # Location
                    try:
                        loc_tag = job_card.find_element(By.CSS_SELECTOR, "span.locWdth")
                        location_name = loc_tag.text.strip()
                    except:
                        location_name = "Not specified"

                    # External URL
                    external_url = title_tag.get_attribute("href") if title_tag else ''

                    data = {
                        'title': title,
                        'company': company,
                        'location': location_name,
                        'description': '',
                        'experience_required': '',
                        'skills_required': [],
                        'job_type': 'full-time',
                        'external_url': external_url,
                        'posted_at': timezone.now(),
                    }

                    job, created = upsert_job(data, 'naukri')
                    if job:
                        yield job, created

                except Exception as e:
                    print(f"[Naukri] Skipped job: {e}")

    finally:
        driver.quit()


# -------------------- LinkedIn Scraper --------------------
def scrape_linkedin(role, location, pages=1):
    driver = init_driver(headless=True)
    try:
        for page in range(pages):
            offset = page * 25
            search_url = f"https://www.linkedin.com/jobs/search/?keywords={role}&location={location}&start={offset}"
            driver.get(search_url)
            time.sleep(5)

            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.select('li.result-card, ul.jobs-search__results-list li')

            for card in job_cards:
                try:
                    title_tag = card.select_one('h3.base-search-card__title')
                    company_tag = card.select_one('h4.base-search-card__subtitle')
                    location_tag = card.select_one('span.job-search-card__location')
                    link_tag = card.select_one('a.base-card__full-link')

                    title = title_tag.text.strip() if title_tag else ''
                    company = company_tag.text.strip() if company_tag else ''
                    location_name = location_tag.text.strip() if location_tag else ''
                    external_url = link_tag['href'] if link_tag and 'href' in link_tag.attrs else ''

                    data = {
                        'title': title,
                        'company': company,
                        'location': location_name,
                        'description': '',
                        'experience_required': '',
                        'skills_required': [],
                        'job_type': 'full-time',
                        'external_url': external_url,
                        'posted_at': timezone.now(),
                    }
                    job, created = upsert_job(data, 'linkedin')
                    if job:
                        yield job, created
                except Exception as e:
                    print(f"[LinkedIn] Skipped job: {e}")
    finally:
        driver.quit()

# -------------------- Internshala Scraper --------------------
def scrape_internshala(role, location, pages=1):
    driver = init_driver(headless=False)
    wait = WebDriverWait(driver, 20)
    try:
        for page in range(1, pages + 1):
            location_query = '' if not location else f'-in-{location}'
            search_url = f"https://internshala.com/internships/{role}{location_query}/page-{page}"
            driver.get(search_url)

            try:
                wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, '.individual_internship')))
            except:
                print(f"[Internshala] Page {page} has no internships")
                continue

            soup = BeautifulSoup(driver.page_source, 'html.parser')
            job_cards = soup.select('.individual_internship')
            print(f"[Internshala] Page {page} found {len(job_cards)} internships")

            for card in job_cards:
                try:
                    title_tag = card.select_one('.heading_4_5')
                    company_tag = card.select_one('.link_display_like_text')
                    location_tag = card.select_one('.location_link')
                    external_url_tag = card.select_one('a.view_detail_button')

                    title = title_tag.text.strip() if title_tag else ''
                    company = company_tag.text.strip() if company_tag else ''
                    location_name = location_tag.text.strip() if location_tag else ''

                    # If external_url is missing, assign default
                    external_url = ''
                    if external_url_tag and 'href' in external_url_tag.attrs:
                        external_url = external_url_tag['href']
                        if external_url and not external_url.startswith('http'):
                            external_url = 'https://internshala.com' + external_url
                    else:
                        # Default URL: internshala homepage + query-friendly job title
                        slug_title = title.lower().replace(' ', '-')
                        external_url = f"https://internshala.com/internships/{slug_title}"

                    data = {
                        'title': title,
                        'company': company,
                        'location': location_name,
                        'description': '',
                        'experience_required': '',
                        'skills_required': [],
                        'job_type': 'internship',
                        'external_url': external_url,
                        'posted_at': timezone.now(),
                    }

                    job, created = upsert_job(data, 'internshala')
                    if job:
                        yield job, created

                except Exception as e:
                    print(f"[Internshala] Skipped job: {e}")
    finally:
        driver.quit()

# -------------------- Master Scraper --------------------
def scrape_jobs(sources, role, location, pages=1):
    jobs = []
    for src in sources:
        scraper = {
            'naukri': scrape_naukri,
            'linkedin': scrape_linkedin,
            'internshala': scrape_internshala,
        }.get(src)
        if scraper:
            for job, created in scraper(role, location, pages):
                if job:
                    jobs.append(job)
    return jobs
