import React, { useState, useEffect, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import axios from "../../axiosConfig";

import { config } from "../../Constants";
import bgImage from "./Image 9.png";
import Cookies from "js-cookie";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  let history = useHistory();

  const [errMessage, setErrMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [listRole, setListRole] = useState([]);

  const password = useRef({});
  password.current = watch("password", "");

  useEffect(() => {
    if (Cookies.get("token")) {
      history.push("/dashboard");
    }
    if (listRole.length === 0) {
      axios
        .get(config.url.API_URL + "/Role/GetAll")
        .then(({ data }) => {
          if (data.status.code === 200 && data.obj.length > 0) {
            setListRole(data.obj);
          }
        })
        .catch((error) => {
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendapatkan peran. Silahkan coba beberapa saat lagi."
              );
        });
    }
  }, [history, listRole]);

  const onSubmit = ({ username, password, rolename, email }, e) => {
    setErrMessage(null);
    setSuccessMessage(null);
    setIsProcessing(true);

    const params = new URLSearchParams()
    params.append("roleNames", [rolename])
    params.append("email", email)
    params.append("userName", username)
    params.append("password", password)

    axios
      .post(
        config.url.API_URL + "/User/Create",
        params,
      )
      .then(({data}) => {
        if (data.code === 200){
          setSuccessMessage(
            "Pendaftaran berhasil, akun Anda akan ditinjau oleh admin selama 1x24 jam. Silahkan lakukan aktivasi akun Anda setelah mendapat email konfirmasi dari admin pada alamat email " +
              email
          );
          e.target.reset();
          document.body.scrollTop = 0;
        } else {
          data?.description
          ? setErrMessage(data?.description)
          : setErrMessage(
            "Gagal mendaftarkan akun. Silahkan coba beberapa saat lagi."
            );
          }
          setIsProcessing(false);
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendaftarkan akun. Silahkan coba beberapa saat lagi."
            );
        setIsProcessing(false);
      });
  };

  return (
    <div>
      <Main>
        <div style={{ flex: "4", display: "flex" }}>
          <div
            style={{ flex: "1.2", display: "flex", flexDirection: "column" }}
          >
            <div
              style={{
                justifyContent: "space-between",
                display: "flex",
                alignItems: "center",
                padding: "0.85rem 0.7rem 0.85rem 0.7rem",
              }}
            >
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
              <Link to="login" style={{}}>
                &lt; Kembali ke Masuk
              </Link>
            </div>
            <RegisterDiv>
              {<div style={{ display: "flex", margin: "20px 0" }}>
                <img style={{ float: "left", display: "inline", width: "50px" }} src="./images/Image 7.svg" alt="Login"></img>
                <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#07406b" }}>
                    RDTR
                  </div>
                  <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "24px", fontWeight: "bold", marginTop: "0px", color: "#45ab75" }}>
                    REALTIME
                  </div>
                </div>
              </div>}
              <h3>Daftar</h3>
              {errMessage && (
                <div className="alert alert-warning" role="alert">
                  {errMessage}
                </div>
              )}
              {successMessage && (
                <div className="alert alert-success" role="alert">
                  <p>{successMessage}</p>
                  <p>
                    Tidak menerima email?{" "}
                    <Link to="/resentmailconfirmation">
                      Kirim ulang email konfirmasi
                    </Link>
                  </p>
                </div>
              )}
              <div>
                <form
                  className="forms-sample"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="form-group">
                    <label htmlFor="email">Alamat Email</label>
                    <input
                      type="email"
                      className={`form-control p-input ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      id="email"
                      aria-describedby="emailHelp"
                      placeholder="Alamat email"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      ref={register({
                        required: "Alamat email harus diisi",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Format alamat email salah",
                        },
                      })}
                    />
                    {errors.email && (
                      <small id="emailHelp" className="form-text text-danger">
                        {errors.email.message}
                      </small>
                    )}
                  </div>
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
                      ref={register({
                        required: "Username harus diisi",
                        pattern: {
                          value: /^[\w]*$/,
                          message: "Hanya alfabet dan nomor yang diizinkan",
                        },
                      })}
                    />
                    {errors.username && (
                      <small
                        id="usernameHelp"
                        className="form-text text-danger"
                      >
                        {errors.username.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="exampleInputRole">Peranan</label>
                    <select
                      name="rolename"
                      className={`form-control ${
                        errors.rolename ? "is-invalid" : ""
                      }`}
                      id="exampleInputRole"
                      ref={register({ required: "Peran harus diisi" })}
                    >
                      {listRole.map((role) => (
                        <option key={role.id} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    {errors.rolename && (
                      <small
                        id="rolenameHelp"
                        className="form-text text-danger"
                      >
                        {errors.rolename.message}
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
                      placeholder="Kata sandi"
                      name="password"
                      autoComplete="current-password"
                      ref={register({
                        required: "Kata sandi harus diisi",
                        minLength: {
                          value: 6,
                          message:
                            "Kata sandi sekurangnya memiliki 6 karaketer",
                        },
                      })}
                    />
                    {!errors.password && (
                      <small className="form-text text-muted">
                        Kata sandi sekurangnya memiliki 6 karakter
                      </small>
                    )}
                    {errors.password && (
                      <small
                        id="passwordHelp"
                        className="form-text text-danger"
                      >
                        {errors.password.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="konfirmasiPassword">
                      Konfirmasi Kata Sandi
                    </label>
                    <input
                      type="password"
                      className={`form-control p-input ${
                        errors.konfirmasiPassword ? "is-invalid" : ""
                      }`}
                      id="konfirmasiPassword"
                      placeholder="Konfirmasi kata sandi"
                      name="konfirmasiPassword"
                      autoComplete="confirm-password"
                      ref={register({
                        validate: (value) =>
                          value === password.current || "Kata sandi tidak sama",
                      })}
                    />
                    {errors.konfirmasiPassword && (
                      <small
                        id="konfirmasiPasswordHelp"
                        className="form-text text-danger"
                      >
                        {errors.konfirmasiPassword.message}
                      </small>
                    )}
                  </div>
                  <div
                    className="form-group"
                    style={{
                      backgroundColor: "#e0e0e0",
                      height: "10rem",
                      overflow: "hidden auto",
                      padding: "20px",
                    }}
                  >
                    <h5>Disclaimer</h5>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Nunc sed eros at metus laoreet dapibus sed ac erat. Sed id
                      eros pretium, accumsan quam et, commodo velit. Nulla
                      facilisi. Nunc eget nisl lorem. Etiam a eleifend tortor,
                      posuere efficitur dolor. Aliquam ligula risus, commodo nec
                      sapien nec, fermentum viverra tellus. Quisque eu nisl et
                      lorem euismod interdum id at velit. Ut et tellus
                      hendrerit, rhoncus ipsum vel, mattis eros. Mauris
                      elementum nibh at congue porttitor. Aliquam eget mollis
                      libero. Pellentesque habitant morbi tristique senectus et
                      netus et malesuada fames ac turpis egestas. Maecenas
                      tortor nisi, fringilla at hendrerit sed, maximus eu nisl.
                      Integer id ipsum sodales, accumsan augue ac, dapibus dui.
                      Duis neque nulla, dignissim nec blandit quis, maximus ut
                      felis. In quis aliquet lorem, eget dictum felis.
                    </p>
                    <p>
                      Maecenas bibendum sapien dapibus, imperdiet ipsum id,
                      scelerisque quam. Aenean mi quam, lacinia eget justo at,
                      congue dignissim lacus. Vivamus ac purus tempus arcu porta
                      hendrerit. Sed ut est ante. Fusce massa neque,
                      sollicitudin vitae bibendum id, laoreet condimentum eros.
                      Nulla accumsan justo diam, at imperdiet justo pretium
                      quis. Proin vulputate sapien hendrerit lorem venenatis,
                      vitae gravida turpis ornare. Vestibulum diam felis,
                      ultrices ut porta a, porttitor sit amet augue. Aenean
                      egestas porttitor odio sed fringilla. In ultrices, sapien
                      a vulputate volutpat, magna massa convallis quam, in
                      maximus dui ex vel leo. Morbi et condimentum mi.
                      Pellentesque quis quam magna. Vestibulum ante ipsum primis
                      in faucibus orci luctus et ultrices posuere cubilia curae;
                      Vestibulum tempus, ligula non elementum sodales, sapien
                      diam feugiat turpis, quis vulputate sapien nunc a justo.
                      Cras eget enim mi. Pellentesque mi ante, luctus id
                      sagittis eu, aliquet sit amet nibh.{" "}
                    </p>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="agreement"
                      name="agreement"
                      ref={register({
                        required: "Anda harus menyetujui untuk melanjutkan",
                      })}
                      style={{ marginLeft: 0 }}
                    />
                    <label htmlFor="agreement" className="form-check-label">
                      Saya telah membaca dan menyetujui syarat dan ketentuan
                      yang berlaku
                    </label>
                    {errors.agreement && (
                      <small
                        id="konfirmasiPasswordHelp"
                        className="form-text text-danger"
                      >
                        {errors.agreement.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <button
                      type="submit"
                      className="btn btn-primary btn-block"
                      disabled={isProcessing || listRole.length === 0}
                    >
                      {isProcessing && (
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      )}
                      Daftar
                    </button>
                  </div>
                </form>
                <div className="text-center font-weight-light">
                  Sudah punya akun? <Link to="/login">Masuk</Link>
                </div>
              </div>
            </RegisterDiv>
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
  background-image: url("${bgImage}");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: bottom;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
const RegisterDiv = styled.div`
  flex: 1;
  justify-content: center;
  display: flex;
  flex-direction: column;
  padding: 1rem 8rem 3rem;
  @media only screen and (max-width: 768px) {
    padding: 0.5rem 3rem 1rem;
  }
`;
