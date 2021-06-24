import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";

import { config } from "../../Constants";
import bgImage from "./Image 9.png"

function ConfirmByCode() {
  let history = useHistory();

  const [errMessage, setErrMessage] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  var code = useLocation().search?.split("?code=")[1]?.trim()

  const handleLogin = () => {
    history.push("/login");
  };
  const handleResentMailConfirmation = () => {
    history.push("/resentmailconfirmation");
  };

  useEffect(() => {
    if (sessionStorage.token) {
      history.push("/dashboard");
    } else {
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
      };
      axios.post(
        config.url.API_URL + '/User/ConfirmAccountByCode',
        null,
        {
          headers: headers,
          params: {
            code
          }
        }
      )
        .then(response => {
          if (response.data.code !== 200) {
            setErrMessage(response.data.description)
          } else {
            setIsSuccess(true)
          }
        })
        .catch(error => {
          error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengkonfirmasi akun. Silahkan coba beberapa saat lagi.")
        })
    }
  }, [code, history])

  return (
    <div>
      <Main>
        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "1.4", padding: "0.85rem 4.28rem 0", display: "flex", flexDirection: "column" }}>
            <div style={{ justifyContent: "space-between", display: "flex", alignItems: "center" }}>
              <img src="./images/logo-atrbpn.svg" style={{}} alt="ATR BPN" />
            </div>
            <div style={{ flex: "1", justifyContent: "center", display: "flex", flexDirection: "column", padding: "40px 0" }}>
              {!errMessage && !isSuccess && <div style={{ fontSize: "4.25rem", fontWeight: "bold", color: "#07406b" }}>
                <div className="spinner-grow text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-secondary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-success" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-danger" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-warning" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <div className="spinner-grow text-info" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              </div>}
              {errMessage && <div style={{ fontSize: "4.25rem", fontWeight: "bold", color: "#07406b" }}>
                Gagal
            </div>}
              {isSuccess && !errMessage && <div style={{ fontSize: "4.25rem", fontWeight: "bold", color: "#45ab75" }}>
                Berhasil
            </div>}
              {errMessage && (<div><div style={{ padding: "3rem 0", fontSize: "16px" }}>
                {errMessage}
              </div>
                {(errMessage.toLowerCase().indexOf("expired") !== -1 || errMessage.toLowerCase().indexOf("hangus") !== -1) && <button type="submit" className="btn btn-block" onClick={() => handleResentMailConfirmation()} style={{ backgroundColor: "#07406b", color: "white", borderColor: "#07406b" }}>
                  Kirim ulang email konfirmasi
                    </button>}
              </div>)}
              {isSuccess && !errMessage && (<div>
                <div style={{ padding: "3rem 0", fontSize: "16px" }}>
                  Akun berhasil dikonfirmasi. Anda sekarang dapat menggunakan RDTR Realtime. Sistem ini menyediakan informasi lengkap mengenai rencana detail tata ruang meliputi hampir seluruh provinsi di Indonesia
            </div>
                <button type="submit" className="btn btn-success btn-block" onClick={() => handleLogin()}>
                  Lanjutkan ke Masuk
                    </button>
              </div>)}
            </div>
          </div>
          <ImageDiv></ImageDiv>
        </div>
      </Main>
    </div>
  );
}

export default ConfirmByCode;

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
