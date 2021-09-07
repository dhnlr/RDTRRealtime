import * as axios from "axios";
import Cookie from "js-cookie";
import Swal from "sweetalert2";
import { useHistory } from "react-router-dom";

const instance = axios.create({});

instance.interceptors.request.use(
  (config) => {
    const userToken = Cookie.get("token");
    if (!config.headers.Authorization) {
      const token = userToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  function (error) {
    const originalRequest = error.config;
    // console.log(originalRequest)
    if (!originalRequest) {
      Cookie.remove("token");
      localStorage.clear() 
      sessionStorage.clear() 
      window.location.reload("/rdtrrealtime/login");
      return Promise.reject(error);
    }
    if (error.response.status === 401 && !originalRequest._retry) {
      Swal.fire({
        title: "Tidak terautorisasi",
        text: error.response.data.error.message,
        type: "warning",
      })
      setTimeout(() => {
        Cookie.remove("token");
        // Cookie.remove("access");
        localStorage.clear() 
        sessionStorage.clear() 
      },1000)
      
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default instance;
