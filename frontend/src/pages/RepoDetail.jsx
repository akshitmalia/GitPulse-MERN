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
import { marked } from "marked";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

  const isFavourited = favourites.some(function (f) {
    return f.repoName === repoName && f.ownerLogin === username;
  });

  useEffect(function () {
    if (!username || !repoName) return;

    async function fetchAll() {
      setLoading(true);
      try {
        const repoRes = await axios.get(
          `https://api.github.com/repos/${username}/${repoName}`
        );
        setRepoData(repoRes.data);

        // README
        try {
          const readmeRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/readme`,
            { headers: { Accept: "application/vnd.github.v3+json" } }
          );
          const base64 = readmeRes.data.content.replace(/\n/g, "");
          const bytes = Uint8Array.from(atob(base64), function (c) {
            return c.charCodeAt(0);
          });
          const content = new TextDecoder("utf-8").decode(bytes);
          const htmlContent = marked(content);
          setReadme(htmlContent);
        } catch {
          setReadme("");
        }

        // Commits
        try {
          const commitsRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/commits`,
            { params: { per_page: 100 } }
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
              const month = new Date(c.commit.author.date).toLocaleString(
                "default",
                { month: "short" }
              );
              commitCounts[month] = (commitCounts[month] || 0) + 1;
            }
          });
          setCommitChartData({
            labels: Object.keys(commitCounts),
            datasets: [
              {
                label: "Commits",
                data: Object.values(commitCounts),
                backgroundColor: "rgba(54, 162, 235, 0.6)",
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
            { params: { per_page: 5 } }
          );
          setIssues(issuesRes.data);
        } catch {
          setIssues([]);
        }

        // Contributors
        try {
          const contribRes = await axios.get(
            `https://api.github.com/repos/${username}/${repoName}/contributors`
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

  if (loading) return <p className="text-center mt-5"><i>Loading...</i></p>;

  return (
    <div className="container my-4">
      <div className="border border-dark p-3 rounded-3 bg-dark d-flex flex-wrap justify-content-between align-items-center gap-2">
        <h2 className="text-light fw-bold mb-0" style={{ wordBreak: "break-word" }}>
          {username}/{repoName}
        </h2>
        {user && (
          <button
            onClick={handleFavourite}
            className={`btn btn-sm ${isFavourited ? "btn-warning" : "btn-outline-warning"}`}
          >
            {isFavourited ? "⭐ Added to Favourites" : "☆ Add to Favourites"}
          </button>
        )}
      </div>

      {/* README */}
      <div className="card mb-4 mt-4">
        <div className="card-header bg-info text-white fw-bold text-center">
          README
        </div>
        <div
          className="card-body"
          style={{ overflowX: "auto" }}
          dangerouslySetInnerHTML={{
            __html: readme || "<p class='text-danger'>No README found</p>",
          }}
        />
      </div>

      {/* Recent Commits */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white fw-bold text-center">
          Recent Commits
        </div>
        <div className="card-body">
          <ul className="list-unstyled">
            {commits.length > 0 ? (
              commits.map(function (c, i) {
                return <li key={i} className="mb-1">{c.commit.message}</li>;
              })
            ) : (
              <li className="text-danger">No commits found</li>
            )}
          </ul>
        </div>
      </div>

      {/* Personal Commits */}
      <div className="card mb-4">
        <div className="card-header bg-secondary text-white fw-bold text-center">
          Your Commits
        </div>
        <div className="card-body">
          <ul className="list-unstyled">
            {personalCommits.length > 0 ? (
              personalCommits.map(function (c, i) {
                return (
                  <li key={i} className="mb-1">
                    {c.commit.message}
                    <small className="text-muted">
                      {" "}({c.commit.author.name} on{" "}
                      {new Date(c.commit.author.date).toLocaleDateString()})
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
      <div className="card mb-4">
        <div className="card-header bg-danger text-white fw-bold text-center">
          Open Issues
        </div>
        <div className="card-body">
          <ul className="list-unstyled">
            {issues.length > 0 ? (
              issues.map(function (issue) {
                return <li key={issue.id} className="mb-1">{issue.title}</li>;
              })
            ) : (
              <li className="text-muted">No open issues</li>
            )}
          </ul>
        </div>
      </div>

      {/* Contributors */}
      <div className="card mb-4">
        <div className="card-header bg-warning text-dark fw-bold text-center">
          Contributors
        </div>
        <div className="card-body">
          <ul className="list-unstyled">
            {contributors.length > 0 ? (
              contributors.map(function (c) {
                return (
                  <li
                    key={c.id}
                    className="d-flex justify-content-between align-items-center mb-1"
                  >
                    {c.login}
                    <span className="badge bg-primary rounded-pill">
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
        <div className="card mb-4">
          <div className="card-header bg-primary text-white fw-bold text-center">
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
        <a href="/" className="btn btn-dark w-100">
          Back to Search
        </a>
      </div>
    </div>
  );
}

export default RepoDetail;