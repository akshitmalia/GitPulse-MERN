import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const githubHeaders = import.meta.env.VITE_GITHUB_TOKEN
  ? { Authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}` }
  : {};

function Repos() {
  const [repos, setRepos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const username = searchParams.get("user");

  useEffect(function () {
    async function fetchRepos() {
      if (!username) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `https://api.github.com/users/${username}/repos`,
          {
            params: { per_page: 100 },
            headers: githubHeaders,
          }
        );
        setRepos(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError("Error fetching repositories");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [username]);

  useEffect(function () {
    let result = [...repos];

    if (filterQuery) {
      result = result.filter(function (r) {
        return r.name.toLowerCase().includes(filterQuery.toLowerCase());
      });
    }

    result.sort(function (a, b) {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      if (sortBy === "forks") return b.forks_count - a.forks_count;
      if (sortBy === "issues") return b.open_issues_count - a.open_issues_count;
    });

    setFiltered(result);
  }, [filterQuery, sortBy, repos]);

  function handleViewRepo(ownerLogin, repoName) {
    navigate(`/repo?user=${ownerLogin}&repo=${repoName}`);
  }

  if (loading) return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status"></div>
      <p className="mt-2 text-muted">Loading repositories...</p>
    </div>
  );
  if (error) return <p className="text-center text-danger mt-5">{error}</p>;

  return (
    <div className="container my-4 border border-dark rounded-3">
      <div className="p-3 border border-dark mt-4 bg-primary rounded-3">
        <h2 className="text-center display-1 text-warning fw-bold">
          Repositories
        </h2>
      </div>

      <div className="d-flex justify-content-between mb-3 mt-4 gap-3">
        <input
          type="text"
          className="form-control w-25"
          placeholder="Filter by repo name"
          value={filterQuery}
          onChange={function (e) {
            setFilterQuery(e.target.value);
          }}
        />
        <select
          className="form-select w-25"
          value={sortBy}
          onChange={function (e) {
            setSortBy(e.target.value);
          }}
        >
          <option value="name">Name</option>
          <option value="stars">Stars</option>
          <option value="forks">Forks</option>
          <option value="issues">Open Issues</option>
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped mt-3 rounded-3 overflow-hidden">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Stars</th>
              <th>Forks</th>
              <th>Open Issues</th>
              <th>View</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(function (repo) {
              return (
                <tr key={repo.id}>
                  <td className="fw-bold">{repo.name}</td>
                  <td>{repo.description || "No description"}</td>
                  <td>{repo.stargazers_count}</td>
                  <td>{repo.forks_count}</td>
                  <td>{repo.open_issues_count}</td>
                  <td>
                    <button
                      onClick={function () {
                        handleViewRepo(repo.owner.login, repo.name);
                      }}
                      className="btn btn-sm btn-danger"
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Repos;