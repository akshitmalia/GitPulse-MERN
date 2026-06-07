import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  function (res) {
    const remaining = res.headers["x-ratelimit-remaining"];
    if (remaining !== undefined) {
      console.log("GitHub API rate limit remaining:", remaining);
      if (remaining == 0) {
        alert("GitHub API rate limit reached. Try again later.");
      }
    }
    return res;
  },
  function (err) {
    console.error("Axios error:", err);
    return Promise.reject(err);
  }
);

export default axiosInstance;