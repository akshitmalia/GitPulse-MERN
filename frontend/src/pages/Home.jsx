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
      <div className="card bg-primary rounded-3 p-3 m-3 text-center">
        <h1 className="display-1 text-light fw-bold">GitPulse</h1>
        <p className="fs-5 text-light">
          Explore GitHub users and repositories — from commits and issues to
          contributors and activity graphs, all in one dashboard.
        </p>
        <input
          type="text"
          className="form-control"
          placeholder="Enter GitHub username"
          value={query}
          onChange={handleInput}
          autoComplete="off"
        />
      </div>

      <div className="p-3 m-3">
        {loading && <p className="text-center"><i>Loading...</i></p>}
        <div className="row mt-2">
          {users.map(function (user) {
            return (
              <div key={user.id} className="col-sm-12 col-md-6 col-lg-4 mb-3">
                <div className="card p-2 shadow-sm">
                  <div className="card-body text-center">
                    <h6 className="card-title">{user.login}</h6>
                    <button
                      onClick={function () { handleViewProfile(user.login); }}
                      className="btn btn-sm btn-danger"
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