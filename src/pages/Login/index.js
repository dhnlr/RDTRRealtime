import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import querystring from "querystring";

import { config } from "../../Constants";
import bgImage from "./Image 8.png";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  let history = useHistory();

  const [errMessage, setErrMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (sessionStorage.token && sessionStorage.userId) {
      handleDashboard();
    }
  });

  const handleDashboard = () => {
    history.push("/dashboard");
  };

  const onSubmit = ({ username, password }) => {
    setErrMessage(null);
    setIsProcessing(true);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Access-Control-Max-Age": 3600,
    };

    axios
      .post(
        config.url.API_URL + "/Token",
        querystring.stringify({
          grant_type: "password",
          username,
          password,
        }),
        headers
      )
      .then((resp) => {
        sessionStorage.setItem("token", resp.data.obj.accessToken);
        return axios
        .get(config.url.API_URL + "/Profile/Get", {
          headers: { Authorization: "Bearer " + sessionStorage.token },
        })
      })
      .then((response) => {
        setIsProcessing(false);
        if (response.data.status.code === 200) {
          sessionStorage.setItem("userId", response.data.obj.id);
          handleDashboard();
        } else {
          setErrMessage(response.data.status.message);
        }
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage("Gagal masuk. Silahkan coba beberapa saat lagi.");
        setIsProcessing(false);
      });
  };

  return (
    <div>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap"
        rel="stylesheet"
      />
      <Main>
        <div style={{ flex: "4", display: "flex" }}>
          <div
            style={{
              flex: "1.2",
              padding: "0.85rem 4.28rem 0",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                justifyContent: "space-between",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
              <Link to="home">&lt; Kembali ke Halaman Utama</Link>
            </div>
            <div
              style={{
                flex: "1",
                justifyContent: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ display: "flex", margin: "20px 0" }}>
                <img
                  style={{ float: "left", display: "inline", width: "50px" }}
                  src="./images/Image 7.svg"
                  alt="Login"
                ></img>
                <div
                  style={{
                    flex: "1",
                    justifyContent: "center",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginTop: "0px",
                      color: "#07406b",
                    }}
                  >
                    RDTR
                  </div>
                  <div
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: "24px",
                      fontWeight: "bold",
                      marginTop: "0px",
                      color: "#45ab75",
                    }}
                  >
                    REALTIME
                  </div>
                </div>
              </div>
              {errMessage && (
                <div className="alert alert-warning" role="alert">
                  {errMessage}
                </div>
              )}
              <div>
                <form
                  className="forms-sample"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      className={`form-control p-input ${
                        errors.username ? "is-invalid" : ""
                      }`}
                      id="username"
                      aria-describedby="usernameHelp"
                      placeholder="Username"
                      name="username"
                      autoComplete="username"
                      autoFocus
                      ref={register({ required: true })}
                    />
                    {errors.username && (
                      <small
                        id="usernameHelp"
                        className="form-text text-danger"
                      >
                        Username harus diisi
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Kata Sandi</label>
                    <input
                      type="password"
                      className={`form-control p-input ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      id="password"
                      placeholder="Kata Sandi"
                      name="password"
                      autoComplete="current-password"
                      ref={register({ required: true, minLength: 6 })}
                    />
                    {errors.password && (
                      <small
                        id="passwordHelp"
                        className="form-text text-danger"
                      >
                        Password harus diisi dan sekurangnya 6 karakter
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={
                        isProcessing
                      } /* onClick={() => handleDashboard()} */
                    >
                      {isProcessing && (
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      )}
                      Masuk
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="stay"
                        style={{ marginLeft: 0 }}
                      />
                      <label className="form-check-label" htmlFor="stay">
                        Tetap masuk
                      </label>
                    </div>
                    <Link to="/forgotpassword">Lupa kata sandi?</Link>
                  </div>
                  <div className="text-center font-weight-light">
                    Tidak punya akun? <Link to="/register">Daftar</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <div style={{ flex: "1", backgroundImage: "url('./images/Image 8.png')", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%" }}>
          </div> */}
          <ImageDiv></ImageDiv>
        </div>
      </Main>
    </div>
  );
}

export default Login;

const Main = styled.div`
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;
const ImageDiv = styled.div`
  flex: 1;
  background-image: url("${bgImage}");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
