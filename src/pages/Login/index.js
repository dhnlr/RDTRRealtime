import React, { useState } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import querystring from "querystring";

import { config } from "../../Constants";

function Login() {
  const [errMessage, setErrMessage] = useState(null);

  let history = useHistory();
  const handleDashboard = () => {
    history.push("/dashboard");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = async ({ username, password }) => {
    setErrMessage(null);
    try {
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      var resp = await axios.post(
        config.url.API_URL + "/Token",
        querystring.stringify({
          grant_type: "password",
          username,
          password,
        }),
        headers
      );
      sessionStorage.setItem("token", resp.data.obj.accessToken);
      handleDashboard();
    } catch (error) {
      console.log(error.response.data);
      setErrMessage(error.response?.data?.status?.message);
    }
  };

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
      <Main>
        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "1.4", padding: "0 3rem", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
              <Link to="home">&lt; Kembali ke Homepage</Link>
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", margin: "20px 0" }}>
                <img style={{ float: "left", display: "inline", width: "50px" }} src="./images/Image 7.svg" alt="Login"></img>
                <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#07406b" }}>
                    RDTR
                  </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#45ab75" }}>
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
                <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      className="form-control p-input"
                      id="username"
                      aria-describedby="usernameHelp"
                      placeholder="Username"
                      name="username"
                      autoFocus
                      ref={register({ required: true })}
                    />
                    {errors.username && (
                      <small id="usernameHelp" className="form-text text-danger">
                        Username is required
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control p-input"
                      id="password"
                      placeholder="Password"
                      name="password"
                      ref={register({ required: true, minLength: 6 })}
                    />
                    {errors.password && (
                      <small id="passwordHelp" className="form-text text-danger">
                        Password is required and must be at least 6 characters.
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block" /* onClick={() => handleDashboard()} */>
                      Login
                    </button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center flex-wrap">
                    <div className="form-check">
                      <label className="form-check-label">
                        <input type="checkbox" className="form-check-input" />
                        Keep me signed in
                      </label>
                    </div>
                    <Link to="/login">Forget Password?</Link>
                  </div>
                  <div className="text-center font-weight-light">
                    Don't have account? <Link to="/register">Create</Link>
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
  background-image: url("./images/Image 8.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
