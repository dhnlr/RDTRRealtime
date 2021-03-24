import React from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";

function Register() {
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
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column", padding: "40px 0" }}>
              {/* <div style={{ display: "flex", margin: "20px 0" }}>
                <img style={{ float: "left", display: "inline", width: "50px" }} src="./images/Image 7.svg" alt="Login"></img>
                <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#07406b" }}>
                    RDTR
                </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#45ab75" }}>
                    INTERAKTIF
                 </div>
                </div>
              </div> */}
              <h3>Register</h3>
              <div>
                <form class="forms-sample">
                  <div class="form-group">
                    <label for="exampleInputEmail1">Email address</label>
                    <input type="email" class="form-control p-input" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email" autoFocus/>
                  </div>
                  <div class="form-group">
                    <label for="exampleInputUsername">Username</label>
                    <input type="text" class="form-control p-input" id="exampleInputUsername" aria-describedby="usernameHelp" placeholder="Enter username"/>
                  </div>
                  <div class="form-group">
                    <label for="exampleInputRole">Role</label>
                    <input type="text" class="form-control p-input" id="exampleInputRole" aria-describedby="roleHelp" placeholder="Daftar Sebagai"/>
                  </div>
                  <div class="form-group">
                    <label for="exampleInputPassword1">Password</label>
                    <input type="password" class="form-control p-input" id="exampleInputPassword1" placeholder="Password" />
                  </div>
                  <div class="form-group" style={{backgroundColor:"#e0e0e0", height:"200px", overflow: "hidden auto", padding: "20px"}}>
                    <h5>Disclaimer</h5>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed eros at metus laoreet dapibus sed ac erat. Sed id eros pretium, accumsan quam et, commodo velit. Nulla facilisi. Nunc eget nisl lorem. Etiam a eleifend tortor, posuere efficitur dolor. Aliquam ligula risus, commodo nec sapien nec, fermentum viverra tellus. Quisque eu nisl et lorem euismod interdum id at velit. Ut et tellus hendrerit, rhoncus ipsum vel, mattis eros. Mauris elementum nibh at congue porttitor. Aliquam eget mollis libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas tortor nisi, fringilla at hendrerit sed, maximus eu nisl. Integer id ipsum sodales, accumsan augue ac, dapibus dui. Duis neque nulla, dignissim nec blandit quis, maximus ut felis. In quis aliquet lorem, eget dictum felis.</p>
                    <p>Maecenas bibendum sapien dapibus, imperdiet ipsum id, scelerisque quam. Aenean mi quam, lacinia eget justo at, congue dignissim lacus. Vivamus ac purus tempus arcu porta hendrerit. Sed ut est ante. Fusce massa neque, sollicitudin vitae bibendum id, laoreet condimentum eros. Nulla accumsan justo diam, at imperdiet justo pretium quis. Proin vulputate sapien hendrerit lorem venenatis, vitae gravida turpis ornare. Vestibulum diam felis, ultrices ut porta a, porttitor sit amet augue. Aenean egestas porttitor odio sed fringilla. In ultrices, sapien a vulputate volutpat, magna massa convallis quam, in maximus dui ex vel leo. Morbi et condimentum mi. Pellentesque quis quam magna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tempus, ligula non elementum sodales, sapien diam feugiat turpis, quis vulputate sapien nunc a justo. Cras eget enim mi. Pellentesque mi ante, luctus id sagittis eu, aliquet sit amet nibh. </p>
                  </div>
                  <div class="form-check">
                      <label class="form-check-label">
                        <input type="checkbox" class="form-check-input" />
                      I've read and agree with agreement
                    </label>
                    </div>
                  <div class="form-group">
                    <button type="submit" class="btn btn-primary btn-block" onClick={() => handleDashboard()}>Register</button>
                  </div>
                  <div class="text-center font-weight-light">
                    Already have an account? <Link to="/login">Login</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div style={{ flex: "1", backgroundImage: "url('./images/Image 9.png')", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%"}}>
            <img style={{ maxHeight: "100vh", width: "100%" }} src="" alt="Login Background"></img>
          </div>
        </div>
      </Main>
    </div>
  );
}

export default Register;

const Main = styled.div`
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;
