import React, { useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";

import Img from '../../components/Img'

function Login() {
  let history = useHistory();
  const handleDashboard = () => {
    history.push("/dashboard");
  };
  const goToHome = () => {
    history.push("/home");
  };

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
      <Main>

        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "1", padding: "0 100px", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
              <a href="#" onClick={() => goToHome()}>
                &lt; Kembali ke Homepage
              </a>
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", margin: "20px 0" }}>
                <img style={{ float: "left", display: "inline", width: "50px" }} src="./images/Image 7.svg" alt="Login Image"></img>
                <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#07406b" }}>
                    RDTR
                </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#45ab75" }}>
                    INTERAKTIF
                 </div>
                </div>
              </div>
              <div>
                <form class="forms-sample">
                  <div class="form-group">
                    <label for="exampleInputEmail1">Email address</label>
                    <input type="email" class="form-control p-input" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" autoFocus/>
                  </div>
                  <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control p-input" id="exampleInputPassword1" placeholder="Password" />
                  </div>
                  <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-block" onClick={() => handleDashboard()}>Login</button>
                  </div>
                  <div class="my-2 d-flex justify-content-between align-items-center" >
                    <div class="form-check">
                      <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" />
                      Keep me signed in
                    </label>
                    </div>
                    <a href="#">Forget Password?</a>
                  </div>
                  <div class="text-center font-weight-light">
                    Don't have account? <a href="#">Create</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div style={{ flex: "1", backgroundImage: "url('./images/Image 8.png')", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%"}}>
            <img style={{ maxHeight: "100vh", width: "100%" }} src="" alt="Login Background"></img>
          </div>
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
