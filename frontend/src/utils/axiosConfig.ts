import axios from "axios";

// Configure axios defaults
axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";
// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

export default axios;
