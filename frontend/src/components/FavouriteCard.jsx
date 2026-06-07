import { useDispatch } from "react-redux";
import { removeFavourite, updateFavourite } from "../features/favourites/favouritesSlice.js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function FavouriteCard({ favourite }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(favourite.description || "");

  function handleRemove() {
    dispatch(removeFavourite(favourite.repoId));
  }

  function handleUpdate() {
    dispatch(updateFavourite({ repoId: favourite.repoId, description }));
    setIsEditing(false);
  }

  function handleView() {
    navigate(`/repo?user=${favourite.ownerLogin}&repo=${favourite.repoName}`);
  }

  return (
    <div className="card shadow-sm h-100">
      <div className="card-body d-flex flex-column gap-2">
        <h6 className="card-title fw-bold text-primary mb-0">
          {favourite.ownerLogin}/{favourite.repoName}
        </h6>

        {isEditing ? (
          <input
            type="text"
            className="form-control form-control-sm"
            value={description}
            onChange={function (e) {
              setDescription(e.target.value);
            }}
          />
        ) : (
          <p className="card-text text-muted small mb-0">
            {description || "No description"}
          </p>
        )}

        <div className="d-flex gap-2 text-muted small">
          <span>⭐ {favourite.stars}</span>
          <span>🍴 {favourite.forks}</span>
        </div>

        <div className="d-flex gap-2 mt-auto flex-wrap">
          <button onClick={handleView} className="btn btn-sm btn-dark">
            View
          </button>
          {isEditing ? (
            <button onClick={handleUpdate} className="btn btn-sm btn-success">
              Save
            </button>
          ) : (
            <button
              onClick={function () {
                setIsEditing(true);
              }}
              className="btn btn-sm btn-outline-secondary"
            >
              Edit
            </button>
          )}
          <button onClick={handleRemove} className="btn btn-sm btn-outline-danger">
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

export default FavouriteCard;