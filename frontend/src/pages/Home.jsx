import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const navigate = useNavigate();

  async function searchUsers(username) {
    if (!username || username.length < 2) {
      setUsers([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `https://api.github.com/search/users?q=${username}`
      );
      setUsers(res.data.items);
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  function handleInput(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(function () {
      searchUsers(value.trim());
    }, 600);
  }

  function handleViewProfile(username) {
    navigate(`/repos?user=${username}`);
  }

  return (
    <div>
      <div
        className="p-5 m-3 text-center rounded-3"
        style={{
          background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <h1
          className="fw-bold mb-3"
          style={{ fontSize: "3.5rem", color: "#f6c90e", letterSpacing: "2px" }}
        >
          GitPulse
        </h1>
        <p
          style={{
            color: "#adb5bd",
            fontSize: "1.1rem",
            maxWidth: "600px",
            margin: "0 auto 1.5rem auto",
          }}
        >
          Explore GitHub users and repositories — from commits and issues to
          contributors and activity graphs, all in one dashboard.
        </p>
        <div style={{ maxWidth: "500px", margin: "0 auto" }}>
          <input
            type="text"
            className="form-control form-control-lg"
            placeholder="Search GitHub username..."
            value={query}
            onChange={handleInput}
            autoComplete="off"
            style={{
              borderRadius: "30px",
              border: "none",
              padding: "14px 24px",
              fontSize: "1rem",
              boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </div>

      <div className="px-4 mt-3">
        {loading && (
          <p className="text-center text-muted">
            <i>Searching...</i>
          </p>
        )}
        <div className="row mt-2">
          {users.map(function (user) {
            return (
              <div key={user.id} className="col-sm-12 col-md-6 col-lg-3 mb-3">
                <div
                  className="card h-100 text-center"
                  style={{
                    borderRadius: "12px",
                    border: "1px solid #e9ecef",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.transform = "translateY(-4px)";
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2 p-3">
                    <img
                      src={user.avatar_url}
                      alt={user.login}
                      width={60}
                      height={60}
                      className="rounded-circle"
                      style={{ border: "2px solid #302b63" }}
                    />
                    <h6 className="card-title fw-bold mb-0">{user.login}</h6>
                    <button
                      onClick={function () { handleViewProfile(user.login); }}
                      className="btn btn-sm mt-1"
                      style={{
                        backgroundColor: "#302b63",
                        color: "#fff",
                        borderRadius: "20px",
                        border: "none",
                        padding: "5px 18px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ); 
}

export default Home;