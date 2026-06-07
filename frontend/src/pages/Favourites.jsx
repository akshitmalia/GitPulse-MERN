import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeFavourite, updateFavourite } from "../features/favourites/favouritesSlice.js";
import { useState } from "react";

function Favourites() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector(function (state) {
    return state.auth;
  });
  const { items: favourites } = useSelector(function (state) {
    return state.favourites;
  });

  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState("");

  if (!user) {
    return (
      <div className="text-center mt-5">
        <h4 className="text-muted">Please login to view your favourites</h4>
      </div>
    );
  }

  return (
    <div className="container my-4">
      <div
        className="p-4 rounded-3 mb-4 d-flex align-items-center gap-4"
        style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)" }}
      >
        <img
          src={user.avatar}
          alt={user.username}
          width={60}
          height={60}
          className="rounded-circle"
          style={{ border: "3px solid #f6c90e" }}
        />
        <div>
          <h2 className="fw-bold mb-0" style={{ color: "#f6c90e" }}>
            My Favourites
          </h2>
          <p className="mb-0" style={{ color: "#adb5bd", fontSize: "14px" }}>
            @{user.username} · {favourites.length} saved {favourites.length === 1 ? "repo" : "repos"}
          </p>
        </div>
      </div>

      {favourites.length === 0 ? (
        <div className="text-center mt-5">
          <p className="text-muted fs-5">No favourites yet. Go explore some repos!</p>
          <button
            onClick={function () { navigate("/"); }}
            className="btn btn-primary mt-2"
          >
            Back to Search
          </button>
        </div>
      ) : (
        <div className="row">
          {favourites.map(function (fav) {
            return (
              <div key={fav.repoId} className="col-sm-12 col-md-6 col-lg-4 mb-4">
                <div
                  className="card h-100"
                  style={{
                    border: "1px solid #e9ecef",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                  }}
                >
                  <div className="card-body d-flex flex-column gap-2 p-3">
                    <h6 className="card-title fw-bold text-primary mb-0">
                      {fav.ownerLogin}/{fav.repoName}
                    </h6>

                    {editingId === fav.repoId ? (
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={editDesc}
                        onChange={function (e) { setEditDesc(e.target.value); }}
                      />
                    ) : (
                      <p className="card-text text-muted small mb-0">
                        {fav.description || "No description"}
                      </p>
                    )}

                    <div className="d-flex gap-3 small mt-1" style={{ color: "#6c757d" }}>
                      <span>⭐ {fav.stars}</span>
                      <span>🍴 {fav.forks}</span>
                    </div>

                    <div className="d-flex gap-2 mt-auto flex-wrap pt-2">
                      <button
                        onClick={function () {
                          navigate(`/repo?user=${fav.ownerLogin}&repo=${fav.repoName}`);
                        }}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "#212529",
                          color: "#fff",
                          borderRadius: "6px",
                          border: "none",
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        View
                      </button>

                      {editingId === fav.repoId ? (
                        <button
                          onClick={function () {
                            dispatch(updateFavourite({ repoId: fav.repoId, description: editDesc }));
                            setEditingId(null);
                          }}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: "#198754",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            padding: "5px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          onClick={function () {
                            setEditingId(fav.repoId);
                            setEditDesc(fav.description || "");
                          }}
                          className="btn btn-sm"
                          style={{
                            backgroundColor: "transparent",
                            color: "#6c757d",
                            borderRadius: "6px",
                            border: "1px solid #6c757d",
                            padding: "5px 12px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        onClick={function () { dispatch(removeFavourite(fav.repoId)); }}
                        className="btn btn-sm"
                        style={{
                          backgroundColor: "transparent",
                          color: "#dc3545",
                          borderRadius: "6px",
                          border: "1px solid #dc3545",
                          padding: "5px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Favourites;