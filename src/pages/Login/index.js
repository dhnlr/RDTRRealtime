import React from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";

function Login() {
  let history = useHistory();
  const handleDashboard = () => {
    history.push("/dashboard");
  };

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
      <Main>

        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "1", padding: "0 100px", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
              <Link to="home">
                &lt; Kembali ke Homepage
              </Link>
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", margin: "20px 0" }}>
                <img style={{ float: "left", display: "inline", width: "50px" }} src="./images/Image 7.svg" alt="Login"></img>
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
                <form className="forms-sample">
                  <div className="form-group">
                    <label htmlFor="exampleInputEmail1">Email address</label>
                    <input type="email" className="form-control p-input" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" autoFocus/>
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputPassword1">Password</label>
                    <input type="password" className="form-control p-input" id="exampleInputPassword1" placeholder="Password" />
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block" onClick={() => handleDashboard()}>Login</button>
                  </div>
                  <div className="my-2 d-flex justify-content-between align-items-center" >
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
