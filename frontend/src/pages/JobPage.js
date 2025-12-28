import React, { useEffect, useState } from "react";
import {
  jobsAPI,
  searchJobsAPI,
  employerJobsAPI,
  employerJobDetailAPI,
} from "../utils/api";
import "../components/JobPage.css";
import './SignupPage.css';


export default function JobPage() {
  const [jobs, setJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [searchRole, setSearchRole] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    location: "",
    salary: "",
    description: "",
  });

  // Fetch employer jobs
  const loadMyJobs = async () => {
    try {
      const res = await employerJobsAPI.list();
      setMyJobs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch public jobs
  const loadJobs = async () => {
    setLoading(true);
    try {
      const res = await jobsAPI.list();
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Search jobs (scraper + DB)
  const handleSearch = async () => {
    if (!searchRole && !searchLocation)
      return alert("Enter role or location to search jobs");

    setLoading(true);
    try {
      const res = await searchJobsAPI({
        role: searchRole,
        location: searchLocation,
        pages: 1,
        sources: "naukri,linkedin,indeed",
      });
      setJobs(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // Create employer job
  const handleCreateJob = async () => {
    if (!newJob.title || !newJob.company)
      return alert("Title & company are required");

    try {
      await employerJobsAPI.create(newJob);
      alert("Job Created Successfully!");
      loadMyJobs();
      setNewJob({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create job!");
    }
  };

  // Delete job
  const deleteJob = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await employerJobDetailAPI.delete(id);
      loadMyJobs();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobs();
    loadMyJobs();
  }, []);

  return (
    <div className="job-page-container">
      <h1 className="page-title">Job Portal</h1>

      {/* Search Section */}
      <div className="search-box">
        <input
          type="text"
          placeholder="Role (e.g., Python Developer)"
          value={searchRole}
          onChange={(e) => setSearchRole(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Delhi)"
          value={searchLocation}
          onChange={(e) => setSearchLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search Jobs</button>
      </div>

      {loading && <p>Loading…</p>}

      {/* Jobs List */}
      <h2>Available Jobs</h2>
      <div className="job-list">
        {jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          jobs.map((job, i) => {
            const applyUrl = job.apply_link || job.url || job.applyUrl;

            return (
              <div key={i} className="job-card" style={{ color: "black" }}>
  <h3>{job.title}</h3>

  {/* Row 1: Company (left) + Salary (right) */}
  <div 
    style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginBottom: "8px"
    }}
  >
    <p style={{ margin: 0 }}>
      <strong>Company:</strong> {job.company}
    </p>

    <p style={{ margin: 0 }}>
      <strong>Salary:</strong> {job.salary || "N/A"}
    </p>
  </div>

  {/* Row 2: Location (left) + Experience (right) */}
  <div 
    style={{ 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "center",
      marginBottom: "8px"
    }}
  >
    <p style={{ margin: 0 }}>
      <strong>Location:</strong> {job.location}
    </p>

    <p style={{ margin: 0 }}>
      <strong>Experience Required:</strong> {job.experience_required || "N/A"}
    </p>
  </div>

  {/* Skills below normally */}
  <p>
    <strong>Skills Required:</strong> {job.skills_required || "N/A"}
  </p>

  <p className="job-desc">{job.description}</p>

  {/* Apply Button */}
  <a
    href={job.external_url}
    target="_blank"
    rel="noopener noreferrer"
  >
    <button
      className={`apply-btn ${!job.external_url ? "disabled" : ""} btn primary`}
      disabled={!job.external_url}
    >
      {job.external_url ? "Apply Now" : "No Apply Link"}
    </button>
  </a>
</div>

            );
          })
        )}
      </div>

      {/* Employer Jobs Section */}
      <h2>My Job Posts (Employer)</h2>

      <div className="create-job-box">
        <h3>Create a Job</h3>

        <input
          type="text"
          placeholder="Job Title"
          value={newJob.title}
          onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Company"
          value={newJob.company}
          onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
        />
        <input
          type="text"
          placeholder="Location"
          value={newJob.location}
          onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
        />
        <input
          type="text"
          placeholder="Salary"
          value={newJob.salary}
          onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
        />

        <textarea
          placeholder="Job Description"
          value={newJob.description}
          onChange={(e) =>
            setNewJob({ ...newJob, description: e.target.value })
          }
          rows={4}
        />

        <button onClick={handleCreateJob}>Create Job</button>
      </div>

      <div className="job-list">
        {myJobs.length === 0 ? (
          <p>You haven't posted any jobs yet.</p>
        ) : (
          myJobs.map((job) => (
            <div key={job.id} className="job-card">
              <h3>{job.title}</h3>
              <p>
                <strong>Company:</strong> {job.company}
              </p>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
              <button className="delete-btn btn" onClick={() => deleteJob(job.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
