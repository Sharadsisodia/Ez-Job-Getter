import os
import fitz   # PyMuPDF
import docx
import re

def extract_text_from_file(file_path: str) -> str:
    if file_path.lower().endswith(".pdf"):
        doc = fitz.open(file_path)
        return " ".join([p.get_text() for p in doc])
    elif file_path.lower().endswith(".docx"):
        d = docx.Document(file_path)
        return " ".join([p.text for p in d.paragraphs])
    return ""

def parse_basic(text: str) -> dict:
    emails = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}", text)
    phones = re.findall(r"\+?\d[\d \-()]{7,}\d", text)
    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "skills": [s for s in ["Python", "Django", "SQL", "Java"] if s.lower() in text.lower()]
    }

import requests

def grammar_check_text(text: str):
    if not text:
        return {"grammar_score": 0, "suggestions": []}

    # Prefer a local/managed LanguageTool HTTP server. Set LANGUAGETOOL_SERVER to override.
    url = os.environ.get("LANGUAGETOOL_SERVER", "http://localhost:8081/v2/check")

    payload = {
        "text": text,
        "language": "en-US"
    }

    try:
        res = requests.post(url, data=payload, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception:
        # Fallback to public LanguageTool API if local server is unavailable.
        try:
            res = requests.post("https://api.languagetool.org/v2/check", data=payload, timeout=10)
            res.raise_for_status()
            data = res.json()
        except Exception:
            return {"grammar_score": 0, "suggestions": []}

    suggestions = []
    penalties = 0

    for match in data.get("matches", []):
        suggestions.append({
            "message": match.get("message"),
            "offset": match.get("offset"),
            "length": match.get("length"),
            "replacement": match.get("replacements", [])[0].get("value") if match.get("replacements") else ""
        })
        penalties += 2

    score = max(0, 100 - penalties)

    return {
        "grammar_score": score,
        "suggestions": suggestions
    }





def extract_skills_from_jd(jd_text):
    """
    Extract possible skills from job description.
    Customize this list with common skills you expect in JD.
    """
    possible_skills = [
        "Python", "Django", "MySQL", "SQLite", "Java", "REST API", "AWS",
        "JavaScript", "HTML", "CSS", "React", "Docker", "Kubernetes"
    ]
    return [skill for skill in possible_skills if skill.lower() in jd_text.lower()]


def calculate_match_score(resume_skills, jd_skills):
    """
    Rule-based numeric match score.
    """
    if not jd_skills:
        return 0
    matched = sum(1 for skill in jd_skills if skill.lower() in [s.lower() for s in resume_skills])
    score = int((matched / len(jd_skills)) * 100)
    return score