import React, { useState, } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import styled from "styled-components";
import axios from "axios";

import { config } from "../../Constants";

function ResentEmailConfirmation() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [errMessage, setErrMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const onSubmit = ({ email }, e) => {
    setErrMessage(null);
    setSuccessMessage(null)

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    axios.post(
      config.url.API_URL + "/User/ResentMailConfirmation?email=" + email,
      null,
      headers
    )
      .then(response => {
        if (response.data.code !== 200) {
          setErrMessage(response.data.message)
        } else {
          e.target.reset()
          setSuccessMessage("Email konfirmasi berhasil dikirim ulang. Periksa kotak masuk atau spam lalu ikuti petunjuk yang dikirimkan di email: " + email)
        }
      })
      .catch(error => {
        error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengirim email konfirmasi. Silahkan coba beberapa saat lagi.")
      })
  };

  return (
    <div>
      <Main>

        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "0.95", padding: "0.85rem 4.28rem 0", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column", padding: "40px 0" }}>
              <div style={{ fontSize: "2.45rem", fontWeight: "bold", color: "#07406b", paddingBottom: "1.75rem" }}>
                Kirim Ulang Email Konfirmasi
            </div>
              {errMessage && (
                <div className="alert alert-warning my-2" role="alert">
                  {errMessage}
                </div>
              )}
              {successMessage && (
                <div className="alert alert-success my-2" role="alert">
                  {successMessage}
                </div>
              )}
              <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label htmlFor="email">Alamat Email</label>
                  <input id="email" type="email" className="form-control" placeholder="Alamat email" aria-label="Alamat email" name="email" ref={register({ required: "Alamat email harus diisi", pattern: { value: /^\S+@\S+$/i, message: "Format alamat email salah" } })} autoFocus />
                  {errors.email && (
                    <small id="emailHelp" className="form-text text-danger">
                      {errors.email.message}
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <button className="btn btn-success" type="submit">Kirim Email</button>
                </div>
              </form>
              <div className="font-weight-light mt-4">
                Sudah terkonfirmasi? <Link to="/login">Masuk Sekarang</Link>
              </div>
            </div>
          </div>
          <ImageDiv></ImageDiv>
        </div>
      </Main>
    </div>
  );
}

export default ResentEmailConfirmation;

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