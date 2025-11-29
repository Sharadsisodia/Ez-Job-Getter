// =======================================
// src/pages/Resume.js
// =======================================
import React, { useState } from "react";
import api from "../utils/api";
import "../index.css";
import "../components/ResumePage.css";

export default function ResumePage() {
  const [resumeId, setResumeId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [grammarResult, setGrammarResult] = useState(null);
  const [atsResult, setAtsResult] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [jobAnalysisResult, setJobAnalysisResult] = useState(null);

  const [jobDescription, setJobDescription] = useState("");

  // ----------------------------
  // 1. Upload Resume
  // ----------------------------
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await api.post("/api/resumes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResumeId(res.data.id);
      alert("Resume uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // Grammar Check
  const handleGrammarCheck = async () => {
    if (!resumeId) return alert("Upload resume first!");
    try {
      const res = await api.get(`/api/resumes/${resumeId}/grammar-check/`);
      setGrammarResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Grammar check failed!");
    }
  };

  // ATS Check
  const handleATSCheck = async () => {
    if (!resumeId) return alert("Upload resume first!");
    try {
      const res = await api.get(`/api/resumes/${resumeId}/ats-check/`);
      setAtsResult(res.data);
    } catch (err) {
      console.error(err);
      alert("ATS check failed!");
    }
  };

  // General AI Analysis
  const handleGeneralAnalysis = async () => {
    try {
      const res = await api.post("/api/resume/", {
        resume_id: resumeId,
      });
      setAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Analysis failed!");
    }
  };

  // With Job Description
  const handleJobAnalysis = async () => {
    if (!jobDescription.trim()) return alert("Enter job description!");
    try {
      const res = await api.post(
        `/api/resumes/${resumeId}/analyze-with-job/`,
        { job_description: jobDescription }
      );
      setJobAnalysisResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Job analysis failed!");
    }
  };

  return (
    <div className="resume-root fade-in">
      <div className="blob blob--1"></div>
      <div className="blob blob--2"></div>

      <div className="resume-card">
        <h1 className="resume-title">My Resume</h1>
        <p className="resume-sub muted">A quick overview of my skills</p>

        {/* Upload Section */}
        <div className="file-upload-wrapper">
        <label className="file-upload-button">
            Upload Resume
            <input
            type="file"
            className="file-upload-input"
            accept=".pdf,.docx"
            onChange={handleUpload}
            />
        </label>
        </div>

        {uploading && <p>Uploading...</p>}
        {resumeId && <p className="muted">Resume ID: {resumeId}</p>}
        {/* <section className="resume-section" style={{ marginTop: 30 }}>
          <h2 className="section-title">Upload Resume</h2>
          <input type="file" accept=".pdf,.docx" onChange={handleUpload} />
          {uploading && <p>Uploading...</p>}
          {resumeId && <p className="muted">Resume ID: {resumeId}</p>}
        </section> */}

        {/* Action Buttons */}
        {resumeId && (
            <div className="resume-section" style={{ marginTop: 20 }}>
                <button className="button" onClick={handleGrammarCheck}>
                🔍 Grammar Check
                </button>

                <button className="button" onClick={handleATSCheck}>
                📄 ATS Check
                </button>

                <button className="button" onClick={handleGeneralAnalysis}>
                🤖 General AI Analysis
                </button>

                <textarea
                rows="5"
                placeholder="Paste job description…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                style={{ width: "100%", marginTop: 15 }}
                />

                <button className="button" onClick={handleJobAnalysis}>
                🧠 Analyze With Job
                </button>
            </div>
        )}

        {/* Results */}
        {grammarResult && (
            <div className="card-result">
                <h3>📝 Grammar Improvements</h3>
                {grammarResult.suggestions?.map((item, index) => (
                <div key={index} className="list-item">
                    <strong>Message:</strong> {item.message} <br />
                    <strong>Replacement:</strong> {item.replacement}
                </div>
                ))}
            </div>
        )}


        {atsResult && (
            <div className="card-result">
                <h3>📄 ATS Score</h3>

                <p><strong>Score:</strong> {atsResult.ats_score}/100</p>
                <h4>Parsed Data</h4>
                <pre>{JSON.stringify(atsResult.parsed_data, null, 2)}</pre>
                <h4>Missing Keywords</h4>
                {atsResult.missing_keywords?.map((word, i) => (
                <div key={i} className="list-item">{word}</div>
                ))}

                <h4>Suggestions</h4>
                {atsResult.suggestions?.map((s, i) => (
                <div key={i} className="list-item">{s}</div>
                ))}
            </div>
        )}


        {analysisResult && (
            <div className="card-result">
                <h3>🤖 General Summary</h3>

                <p>{analysisResult.summary}</p>

                <h4>Strengths</h4>
                {analysisResult.strengths?.map((s, i) => (
                <div key={i} className="list-item">{s}</div>
                ))}

                <h4>Weaknesses</h4>
                {analysisResult.weaknesses?.map((s, i) => (
                <div key={i} className="list-item">{s}</div>
                ))}
            </div>
        )}


        {jobAnalysisResult && (
            <div className="card-result">
                <h3>🧠 Resume + Job Match</h3>

                <p><strong>Match Score:</strong> {jobAnalysisResult.data?.match_score}%</p>

                <h4>Your Strengths for This Job</h4>
                {jobAnalysisResult.data?.matching_points?.map((p, i) => (
                <div key={i} className="list-item">{p}</div>
                ))}

                <h4>Recommended Improvements</h4>
                {jobAnalysisResult.data?.improvements?.map((p, i) => (
                <div key={i} className="list-item">{p}</div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
