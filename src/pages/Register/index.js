import React, { useState, useEffect  } from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import axios from "axios";
import querystring from "querystring";

import { config } from "../../Constants";

function Register() {
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
      if (error.response) {
        setErrMessage(error.response?.data?.status?.message)
      } else {
        setErrMessage("Gagal masuk. Silahkan coba beberapa saat lagi.")
      }
    }
  };

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
      <Main>

        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "0.95", padding: "0.85rem 4.28rem 0", display: "flex", flexDirection: "column" }}>
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
                    REALTIME
                  </div>
                </div>
              </div> */}
              <h3>Daftar</h3>
              {errMessage && (
                <div className="alert alert-warning" role="alert">
                  {errMessage}
                </div>
              )}
              <div>
                <form className="forms-sample">
                  <div className="form-group">
                    <label htmlFor="email">Alamat Email</label>
                    <input type="email" className="form-control p-input" id="email" aria-describedby="emailHelp" placeholder="Alamat Email" name="email" autoFocus ref={register({ required: true })} />
                    {errors.email && (
                      <small id="emailHelp" className="form-text text-danger">
                        Email harus diisi
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      className="form-control p-input"
                      id="username"
                      aria-describedby="usernameHelp"
                      placeholder="Username"
                      name="username"
                      ref={register({ required: true })}
                    />
                    {errors.username && (
                      <small id="usernameHelp" className="form-text text-danger">
                        Username harus diisi
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputRole">Peranan</label>
                    <input type="text" className="form-control p-input" id="exampleInputRole" aria-describedby="roleHelp" placeholder="Daftar Sebagai" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="password">Kata Sandi</label>
                    <input
                      type="password"
                      className="form-control p-input"
                      id="password"
                      placeholder="Kata Sandi"
                      name="password"
                      ref={register({ required: true, minLength: 6 })}
                    />
                    {errors.password && (
                      <small id="passwordHelp" className="form-text text-danger">
                        Password harus diisi dan sekurangnya 6 karakter
                      </small>
                    )}
                  </div>
                  <div className="form-group" style={{ backgroundColor: "#e0e0e0", height: "10rem", overflow: "hidden auto", padding: "20px" }}>
                    <h5>Disclaimer</h5>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sed eros at metus laoreet dapibus sed ac erat. Sed id eros pretium, accumsan quam et, commodo velit. Nulla facilisi. Nunc eget nisl lorem. Etiam a eleifend tortor, posuere efficitur dolor. Aliquam ligula risus, commodo nec sapien nec, fermentum viverra tellus. Quisque eu nisl et lorem euismod interdum id at velit. Ut et tellus hendrerit, rhoncus ipsum vel, mattis eros. Mauris elementum nibh at congue porttitor. Aliquam eget mollis libero. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas tortor nisi, fringilla at hendrerit sed, maximus eu nisl. Integer id ipsum sodales, accumsan augue ac, dapibus dui. Duis neque nulla, dignissim nec blandit quis, maximus ut felis. In quis aliquet lorem, eget dictum felis.</p>
                    <p>Maecenas bibendum sapien dapibus, imperdiet ipsum id, scelerisque quam. Aenean mi quam, lacinia eget justo at, congue dignissim lacus. Vivamus ac purus tempus arcu porta hendrerit. Sed ut est ante. Fusce massa neque, sollicitudin vitae bibendum id, laoreet condimentum eros. Nulla accumsan justo diam, at imperdiet justo pretium quis. Proin vulputate sapien hendrerit lorem venenatis, vitae gravida turpis ornare. Vestibulum diam felis, ultrices ut porta a, porttitor sit amet augue. Aenean egestas porttitor odio sed fringilla. In ultrices, sapien a vulputate volutpat, magna massa convallis quam, in maximus dui ex vel leo. Morbi et condimentum mi. Pellentesque quis quam magna. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Vestibulum tempus, ligula non elementum sodales, sapien diam feugiat turpis, quis vulputate sapien nunc a justo. Cras eget enim mi. Pellentesque mi ante, luctus id sagittis eu, aliquet sit amet nibh. </p>
                  </div>
                  <div className="form-check">
                    <label className="form-check-label">
                      <input type="checkbox" className="form-check-input" />
                      Saya telah membaca dan menyetujui syarat dan ketentuan yang berlaku
                    </label>
                  </div>
                  <div className="form-group">
                    <button type="submit" className="btn btn-primary btn-block" onClick={() => handleDashboard()}>Daftar</button>
                  </div>
                  <div className="text-center font-weight-light">
                    Sudah punya akun? <Link to="/login">Masuk</Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* <div style={{ flex: "1", backgroundImage: "url('./images/Image 9.png')", backgroundRepeat: "no-repeat", backgroundSize: "100% 100%" }}>
            <img style={{ maxHeight: "100vh", width: "100%" }} src="" alt="Login Background"></img>
          </div> */}
          <ImageDiv></ImageDiv>
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
const ImageDiv = styled.div`
  flex: 1;
  background-image: url("./images/Image 9.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
