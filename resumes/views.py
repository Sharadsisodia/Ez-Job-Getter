from rest_framework.views import APIView
from rest_framework.response import Response
from .serializer import JobDescriptionSerializer, JobDescription, ResumeSerializer,Resume
from rest_framework import status
from .analyzer import extract_text_from_pdf, analyze_resume_with_llm
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .grammar_service import extract_text_from_file, parse_basic, grammar_check_text
from .grammar_service import extract_skills_from_jd, calculate_match_score


class JobDescriptionAPI(APIView):

    def get(self , request):
        queryset = JobDescription.objects.all()
        serializer = JobDescriptionSerializer(queryset, many = True)
        return Response({
            'status' : True,
            'data' : serializer.data


        })

        

class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all().order_by("-created_at")
    serializer_class = ResumeSerializer
    permission_classes = [AllowAny]  # no login needed for Postman testing

    def perform_create(self, serializer):
        resume_obj = serializer.save()
        text = extract_text_from_file(resume_obj.resume.path)
        resume_obj.raw_text = text
        resume_obj.parsed_data = parse_basic(text)
        resume_obj.save()

    @action(detail=True, methods=["get"], url_path="ats-check")
    def ats_check(self, request, pk=None):
        r = self.get_object()
        parsed = r.parsed_data or {}
        score = 0
        if parsed.get("skills"): score += 30
        if parsed.get("email"): score += 20
        if parsed.get("phone"): score += 20
        r.ats_score = score
        r.save()
        return Response({"ats_score": score, "parsed_data": parsed})

    @action(detail=True, methods=["get", "post"], url_path="grammar-check")
    def grammar_check(self, request, pk=None):
        r = self.get_object()

        # Limit text to avoid timeout
        text = (r.raw_text or "")[:2000]  

        try:
            result = grammar_check_text(text)
        except Exception as e:
            # If grammar service fails, return safe error message
            return Response(
               {"error": "Grammar check failed", "details": str(e)}, 
               status=500
            )

        r.grammar_score = result.get("grammar_score", 0)
        r.save()
        return Response(result)


    # @action(detail=True, methods=["post"], url_path="analyze-with-job")
    # def analyze_with_job(self, request, pk=None):
    #     """Compare resume with a given job description"""
    #     r = self.get_object()
    #     job_description = request.data.get("job_description")

    #     if not job_description:
    #         return Response({"error": "job_description is required"}, status=400)

    #     result = analyze_resume_with_llm(r.raw_text or "", job_description)
    #     return Response(result)


    @action(detail=True, methods=["post"], url_path="analyze-with-job")
    def analyze_with_job(self, request, pk=None):
        r = self.get_object()
        job_description = request.data.get("job_description")

        if not job_description:
            return Response({"error": "job_description is required"}, status=400)

        # Extract resume skills from parsed_data
        resume_skills = r.parsed_data.get("skills", [])

        # Extract JD skills
        jd_skills = extract_skills_from_jd(job_description)

        # Rule-based numeric match score
        numeric_score = calculate_match_score(resume_skills, jd_skills)

        # LLM insights
        llm_result = analyze_resume_with_llm(r.raw_text or "", job_description, resume_skills)

        # Add numeric match_score to LLM result
        llm_result["match_score"] = numeric_score

        return Response({
            "status": True,
            "message": "Resume analyzed",
            "data": llm_result
        })