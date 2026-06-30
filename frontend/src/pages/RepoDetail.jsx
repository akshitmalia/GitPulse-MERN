import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addFavourite, removeFavourite } from "../features/favourites/favouritesSlice.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import axios from "axios";
import axiosInstance from "../api/axios.js";
import { marked } from "marked";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const githubHeaders = import.meta.env.VITE_GITHUB_TOKEN
  ? { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` }
  : {};

function RepoDetail() {
  const [searchParams] = useSearchParams();
  const username = searchParams.get("user");
  const repoName = searchParams.get("repo");

  const dispatch = useDispatch();
  const { user } = useSelector(function (state) {
    return state.auth;
  });
  const { items: favourites } = useSelector(function (state) {
    return state.favourites;
  });

  const [readme, setReadme] = useState("");
  const [commits, setCommits] = useState([]);
  const [personalCommits, setPersonalCommits] = useState([]);
  const [issues, setIssues] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [commitChartData, setCommitChartData] = useState(null);
  const [repoData, setRepoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(true);

  const isFavourited = favourites.some(function (f) {
    return f.repoName === repoName && f.ownerLogin === username;
  });

  useEffect(function () {
    if (!username || !repoName) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const repoRes = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}`,
          { headers: githubHeaders }
        );
        setRepoData(repoRes.data);

        // README
        try {
          const readmeRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/readme`,
            {
              headers: {
                Accept: "application/vnd.github.v3+json",
                ...githubHeaders,
              },
            }
          );
          const base64 = readmeRes.data.content.replace(/\n/g, "");
          const bytes = Uint8Array.from(atob(base64), function (c) {
            return c.charCodeAt(0);
          });
          const content = new TextDecoder("utf-8").decode(bytes);
          setReadme(marked(content));
        } catch {
          setReadme("");
        }

        // Commits
        try {
          const commitsRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/commits`,
            {
              params: { per_page: 100 },
              headers: githubHeaders,
            }
          );
          const allCommits = commitsRes.data;
          setCommits(allCommits.slice(0, 10));

          const personal = allCommits.filter(function (c) {
            return c.author && c.author.login === username;
          });
          setPersonalCommits(personal.slice(0, 10));

          const commitCounts = {};
          allCommits.forEach(function (c) {
            if (c.commit?.author?.date) {
              const date = new Date(c.commit.author.date);
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
              commitCounts[key] = (commitCounts[key] || 0) + 1;
            }
          });

          const sortedKeys = Object.keys(commitCounts).sort();
          const sortedLabels = sortedKeys.map(function (key) {
            const [year, month] = key.split("-");
            return new Date(year, month - 1).toLocaleString("default", { month: "short" });
          });
          const sortedData = sortedKeys.map(function (key) {
            return commitCounts[key];
          });

          setCommitChartData({
            labels: sortedLabels,
            datasets: [
              {
                label: "Commits",
                data: sortedData,
                backgroundColor: "rgba(48, 43, 99, 0.7)",
                borderRadius: 6,
                barThickness: 40,
                maxBarThickness: 50,
              },
            ],
          });
        } catch {
          setCommits([]);
        }

        // Issues
        try {
          const issuesRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/issues`,
            {
              params: { per_page: 5 },
              headers: githubHeaders,
            }
          );
          setIssues(issuesRes.data);
        } catch {
          setIssues([]);
        }

        // Contributors
        try {
          const contribRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/contributors`,
            { headers: githubHeaders }
          );
          setContributors(contribRes.data);
        } catch {
          setContributors([]);
        }
      } catch (err) {
        console.error("Error fetching repo details:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [username, repoName]);

  function handleFavourite() {
    if (isFavourited) {
      const fav = favourites.find(function (f) {
        return f.repoName === repoName && f.ownerLogin === username;
      });
      dispatch(removeFavourite(fav.repoId));
    } else {
      dispatch(
        addFavourite({
          repoId: repoData.id,
          repoName: repoData.name,
          ownerLogin: repoData.owner.login,
          description: repoData.description || "",
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
        })
      );
    }
  }

  async function handleAiSummary() {
    if (!repoData) return;
    setAiLoading(true);
    setAiSummary("");
    try {
      let topics = [];
      try {
        const topicsRes = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}/topics`,
          { headers: { Accept: "application/vnd.github.mercy-preview+json", ...githubHeaders } }
        );
        topics = topicsRes.data.names || [];
      } catch {
        topics = [];
      }

      const res = await axiosInstance.post("/gitpulse/ai/summarize", {
        repoName: repoData.name,
        ownerLogin: repoData.owner.login,
        description: repoData.description || "",
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language || "",
        readmeText: readme ? readme.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 3000) : "",
        topics: topics,
      });
      setAiSummary(res.data.summary);
    } catch (err) {
      console.error("AI summary error:", err);
      setAiAvailable(false);
    } finally {
      setAiLoading(false);
    }
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted">Loading repository...</p>
    </div>
  );

  return (
    <div className="container my-4">

      {/* Header */}
      <div
        className="p-4 rounded-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2"
        style={{ background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)" }}
      >
        <h2
          className="fw-bold mb-0"
          style={{ wordBreak: "break-word", color: "#f6c90e" }}
        >
          {username}/{repoName}
        </h2>
        {user && (
          <button
            onClick={handleFavourite}
            className="btn btn-sm"
            style={{
              backgroundColor: isFavourited ? "#f6c90e" : "transparent",
              color: isFavourited ? "#1a1a1a" : "#f6c90e",
              border: "1.5px solid #f6c90e",
              borderRadius: "20px",
              padding: "6px 16px",
              fontWeight: "600",
              fontSize: "13px",
            }}
          >
            {isFavourited ? "Added to Favourites" : "Add to Favourites"}
          </button>
        )}
      </div>

      {/* AI Summary */}
      {aiAvailable && (
        <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
          <div
            className="card-header fw-bold text-white d-flex justify-content-between align-items-center"
            style={{ background: "linear-gradient(135deg, #0f0c29, #302b63)", borderRadius: "12px 12px 0 0" }}
          >
            <span>AI Repository Summary</span>
            <span style={{ fontSize: "11px", fontWeight: "400", opacity: 0.7 }}>Powered by GPT-OSS 120B</span>
          </div>
          <div className="card-body">
            {aiSummary ? (
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#333", margin: 0 }}>
                {aiSummary}
              </p>
            ) : (
              <div className="text-center py-2">
                <p className="text-muted small mb-3">
                  Get an AI-powered insight about this repository — what it does, who it is for and why it matters.
                </p>
                <button
                  onClick={handleAiSummary}
                  disabled={aiLoading}
                  className="btn btn-sm"
                  style={{
                    background: "linear-gradient(135deg, #0f0c29, #302b63)",
                    color: "#f6c90e",
                    border: "none",
                    borderRadius: "20px",
                    padding: "8px 24px",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  {aiLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Generating Summary...
                    </>
                  ) : (
                    "Generate AI Summary"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* README */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
        <div
          className="card-header fw-bold text-center text-white"
          style={{ background: "#0dcaf0", borderRadius: "12px 12px 0 0" }}
        >
          README
        </div>
        <div
          className="card-body readme-body"
          style={{ overflowX: "auto", padding: "1.5rem" }}
          dangerouslySetInnerHTML={{
            __html: readme || "<p class='text-danger'>No README found</p>",
          }}
        />
      </div>

      {/* Recent Commits */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
        <div
          className="card-header fw-bold text-center text-white"
          style={{ background: "#198754", borderRadius: "12px 12px 0 0" }}
        >
          Recent Commits
        </div>
        <div className="card-body">
          <ul className="list-unstyled mb-0">
            {commits.length > 0 ? (
              commits.map(function (c, i) {
                return (
                  <li
                    key={i}
                    className="mb-2 pb-2"
                    style={{ borderBottom: i < commits.length - 1 ? "1px solid #f1f1f1" : "none", fontSize: "13px" }}
                  >
                    {c.commit.message}
                  </li>
                );
              })
            ) : (
              <li className="text-danger">No commits found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Personal Commits */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
        <div
          className="card-header fw-bold text-center text-white"
          style={{ background: "#6c757d", borderRadius: "12px 12px 0 0" }}
        >
          Your Commits
        </div>
        <div className="card-body">
          <ul className="list-unstyled mb-0">
            {personalCommits.length > 0 ? (
              personalCommits.map(function (c, i) {
                return (
                  <li
                    key={i}
                    className="mb-2 pb-2"
                    style={{ borderBottom: i < personalCommits.length - 1 ? "1px solid #f1f1f1" : "none" }}
                  >
                    <span style={{ fontSize: "13px" }}>{c.commit.message}</span>
                    <small className="text-muted d-block">
                      {c.commit.author.name} · {new Date(c.commit.author.date).toLocaleDateString()}
                    </small>
                  </li>
                );
              })
            ) : (
              <li className="text-muted">No personal commits found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Issues */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
        <div
          className="card-header fw-bold text-center text-white"
          style={{ background: "#dc3545", borderRadius: "12px 12px 0 0" }}
        >
          Open Issues
        </div>
        <div className="card-body">
          <ul className="list-unstyled mb-0">
            {issues.length > 0 ? (
              issues.map(function (issue) {
                return (
                  <li
                    key={issue.id}
                    className="mb-2 pb-2"
                    style={{ fontSize: "13px", borderBottom: "1px solid #f1f1f1" }}
                  >
                    {issue.title}
                  </li>
                );
              })
            ) : (
              <li className="text-muted">No open issues</li>
            )}
          </ul>
        </div>
      </div>

      {/* Contributors */}
      <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
        <div
          className="card-header fw-bold text-center"
          style={{ background: "#ffc107", borderRadius: "12px 12px 0 0", color: "#1a1a1a" }}
        >
          Contributors
        </div>
        <div className="card-body">
          <ul className="list-unstyled mb-0">
            {contributors.length > 0 ? (
              contributors.map(function (c) {
                return (
                  <li
                    key={c.id}
                    className="d-flex justify-content-between align-items-center mb-2 pb-2"
                    style={{ borderBottom: "1px solid #f1f1f1", fontSize: "13px" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={c.avatar_url}
                        alt={c.login}
                        width={28}
                        height={28}
                        className="rounded-circle"
                      />
                      {c.login}
                    </div>
                    <span
                      className="badge rounded-pill"
                      style={{ background: "#302b63", color: "#fff" }}
                    >
                      {c.contributions}
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="text-muted">No contributors found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Commit Chart */}
      {commitChartData && (
        <div className="card mb-4" style={{ borderRadius: "12px", border: "1px solid #e9ecef" }}>
          <div
            className="card-header fw-bold text-center text-white"
            style={{ background: "#302b63", borderRadius: "12px 12px 0 0" }}
          >
            Commit History (Last Year)
          </div>
          <div className="card-body">
            <Bar
              key={JSON.stringify(commitChartData.labels)}
              data={commitChartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                  x: { categoryPercentage: 0.6, barPercentage: 0.6 },
                  y: { beginAtZero: true },
                },
              }}
            />
          </div>
        </div>
      )}

      <div className="text-center mt-3">
        <button
          onClick={function () { window.history.back(); }}
          className="btn w-100"
          style={{
            background: "linear-gradient(135deg, #0f0c29, #302b63)",
            color: "#fff",
            borderRadius: "8px",
            border: "none",
            padding: "10px",
            fontWeight: "600",
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default RepoDetail;