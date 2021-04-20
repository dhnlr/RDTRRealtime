import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import axios from "axios";

import { config } from "../../Constants";
import bgImage from "./Mask Group 142.svg"

function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm();
  let history = useHistory();

  const [errMessage, setErrMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false)
  
  var code = useLocation().search?.split("?code=")[1]?.trim()
  const password = useRef({});
  password.current = watch("password", "");

  useEffect(() => {
    if (sessionStorage.token) {
      history.push("/dashboard");
    }
  }, [history])

  const onSubmit = ({ password, konfirmasiPassword }, e) => {
    setErrMessage(null);
    setSuccessMessage(null)
    setIsProcessing(true);

    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    axios.put(
      config.url.API_URL + "/User/ResetPassword",
      {
        "code": code,
        "newPassword": password,
        "confirmationPassword": konfirmasiPassword
      },
      headers
    )
      .then(response => {
        if (response.data.code !== 200) {
          setErrMessage(response.data.message)
        } else {
          e.target.reset()
          setSuccessMessage("Kata sandi berhasil diganti")
        }
        setIsProcessing(false)
      })
      .catch(error => {
        error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengirim email konfirmasi. Silahkan coba beberapa saat lagi.")
        setIsProcessing(false)
      })
  };

  return (
    <div>
      <Main>

        <div style={{ flex: "4", display: "flex" }}>
          <ImageDiv></ImageDiv>
          <div style={{ flex: "0.95", padding: "0.85rem 4.28rem 0", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./../images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column", padding: "40px 0" }}>
              <div style={{ fontSize: "2.45rem", fontWeight: "bold", color: "#07406b", paddingBottom:"1.75rem" }}>
                Buat Kata Sandi Baru
            </div>
              {errMessage && (
                <div className="alert alert-warning my-2" role="alert">
                  {errMessage}
                </div>
              )}
              {successMessage && (
                <div className="alert alert-success my-2" role="alert">
                  <p>{successMessage}</p>
                  <p><Link to="/login">Masuk sekarang</Link></p>
                </div>
              )}
              <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
              <div className="form-group">
                    <label htmlFor="password">Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="form-control p-input"
                      id="password"
                      placeholder="Kata sandi baru"
                      name="password"
                      autoComplete="new-password"
                      ref={register({
                        required: "Kata sandi harus diisi",
                        minLength: {
                          value: 6,
                          message: "Kata sandi sekurangnya memiliki 6 karaketer"
                        }
                      })}
                    />
                    {!errors.password &&<small className="form-text text-muted">Kata sandi sekurangnya memiliki 6 karakter</small>}
                    {errors.password && (
                      <small id="passwordHelp" className="form-text text-danger">
                        {errors.password.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="konfirmasiPassword">Konfirmasi Kata Sandi Baru</label>
                    <input
                      type="password"
                      className="form-control p-input"
                      id="konfirmasiPassword"
                      placeholder="Konfirmasi kata sandi baru"
                      name="konfirmasiPassword"
                      autoComplete="confirm-new-password"
                      ref={register({
                        validate: value =>
                          value === password.current || "Kata sandi tidak sama"
                      })}
                    />
                    {errors.konfirmasiPassword && (
                      <small id="konfirmasiPasswordHelp" className="form-text text-danger">
                        {errors.konfirmasiPassword.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <button className="btn btn-success" type="submit" disabled={isProcessing}>
                  {isProcessing && <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                      Ganti Kata Sandi
                      </button>
                  </div>
              </form>
              <div className="font-weight-light mt-4">
                  Sudah ingat? <Link to="/login">Masuk Sekarang</Link>
                </div>
            </div>
          </div>
        </div>
      </Main>
    </div>
  );
}

export default ForgotPassword;

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
  background-position: right bottom;
  background-size: 843px auto;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
