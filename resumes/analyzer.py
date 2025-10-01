import pdfplumber
import json
from groq import Groq
from decouple import config  
from .grammar_service import extract_skills_from_jd

API_KEY = config('API_Analyzer_Key')

def extract_text_from_pdf(pdf_path):
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() + "\n"
    return text.strip()

# def analyze_resume_with_llm(resume_text: str, job_description: str) -> dict:
#     # Limit text to avoid timeout
#     resume_text = resume_text[:5000]

#     prompt = f"""
# You are an expert technical recruiter and career coach. 
# Your task is to carefully evaluate the candidate's resume against the given job description. 

# ⚠️ Important Instructions:
# - Always respond ONLY in valid JSON format.
# - Do not include any extra commentary or text outside JSON.
# - Be specific and detailed in the results.

# The JSON object must include these keys:
# 1. "match_score" : integer (0–100) → Overall percentage match between resume and JD.
# 2. "summary" : short text summary (2–3 sentences) of candidate fit.
# 3. "key_strengths" : list of top skills/experiences in resume that align with JD.
# 4. "missing_skills" : list of important skills/requirements from JD missing in resume.
# 5. "recommendations" : list of concrete steps the candidate can take to improve their resume for this JD.

# ---

# Resume:
# {resume_text}

# Job Description:
# {job_description}
# """
#     try:
#         client = Groq(api_key=API_KEY)
#         response = client.chat.completions.create(
#             model="llama-3.3-70b-versatile",
#             messages=[{'role': 'user', 'content': prompt}],
#             temperature=0.7,
#             response_format={'type': "json_object"}
#         )
#         result = response.choices[0].message.content
#         return json.loads(result)

#     except Exception as e:
#         return {"status": False, "error": str(e)}



def analyze_resume_with_llm(resume_text: str, job_description: str, resume_skills: list) -> dict:
    from groq import Groq
    import json
    from decouple import config

    API_KEY = config("API_Analyzer_Key")
    
    jd_skills = extract_skills_from_jd(job_description)
    
    prompt = f"""
You are an expert technical recruiter and career coach.
Compare the resume and job description.

⚠️ Important:
- Respond ONLY in valid JSON.
- JSON must have these keys:
  "summary": string (2–3 sentence evaluation)
  "key_strengths": list of top skills/experiences in resume that match JD
  "missing_skills": list of important JD skills not in resume
  "recommendations": list of actionable steps to improve resume

Resume Skills: {resume_skills}
Job Description Skills: {jd_skills}

Resume:
{resume_text}

Job Description:
{job_description}
"""
   
   
    try:
        client = Groq(api_key=API_KEY)
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.7,
            response_format={'type': "json_object"}
        )
        result = response.choices[0].message.content
        
        try:
            llm_result = json.loads(result)
        except Exception as e:
            print("LLM JSON parsing error:", e)
            llm_result = {
                "summary": "",
                "key_strengths": [],
                "missing_skills": [],
                "recommendations": []
            }        
        return llm_result
   
   
    except Exception as e:
        print("LLM Error:", e)
        return {
            "summary": "",
            "key_strengths": [],
            "missing_skills": [],
            "recommendations": []
        }
