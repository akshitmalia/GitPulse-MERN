import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreSession } from "./features/auth/authSlice.js";
import { fetchFavourites } from "./features/favourites/favouritesSlice.js";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Repos from "./pages/Repos.jsx";
import RepoDetail from "./pages/RepoDetail.jsx";
import Favourites from "./pages/Favourites.jsx";

function App() {
  const dispatch = useDispatch();

  useEffect(function () {
    dispatch(restoreSession()).then(function (action) {
      if (action.meta.requestStatus === "fulfilled") {
        dispatch(fetchFavourites());
      }
    });
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/repos" element={<Repos />} />
        <Route path="/repo" element={<RepoDetail />} />
        <Route path="/favourites" element={<Favourites />} />
      </Routes>
    </>
  );
}

export default App;