import fitz   # PyMuPDF
import docx
import re
import language_tool_python

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

# Create tool only once (when server starts)
tool = language_tool_python.LanguageTool("en-US")

def grammar_check_text(text: str) -> dict:
    if not text:
        return {"grammar_score": 0, "suggestions": []}

    matches = tool.check(text)
    suggestions = []
    penalties = 0

    for m in matches:
        suggestions.append({
            "offset": m.offset,
            "length": m.errorLength,
            "message": m.message,
            "replacement": m.replacements[:1] if m.replacements else []
        })
        penalties += 2

    score = max(0, 100 - penalties)
    return {"grammar_score": score, "suggestions": suggestions}




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