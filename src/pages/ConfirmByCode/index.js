import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import querystring from "querystring";

import { config } from "../../Constants";

function ConfirmByCode() {
  let history = useHistory();

  const [errMessage, setErrMessage] = useState(null);

  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  let query = useQuery();

  const handleDashboard = () => {
    history.push("/dashboard");
  };
  const handleLogin = () => {
    history.push("/login");
  };
  const handleResentMailConfirmation = () => {
    history.push("/resentmailconfirmation");
  };

  useEffect(() => {
    if (sessionStorage.token) {
      handleDashboard()
    } else {
      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': 3600
      };
      axios.post(
        config.url.API_URL + '/User/ConfirmAccountByCode?code='+query.get("code"),
        null,
        headers
      )
        .then(response => {
          // handleLogin()
          if(response.data.code !== 200) {
            setErrMessage(response.data.description)
          }
        })
        .catch(error => {
          error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengkonfirmasi akun. Silahkan coba beberapa saat lagi.")
        })
    }
  }, [])

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
              {errMessage && <div style={{ fontSize: "4.25rem", fontWeight: "bold", color: "#07406b" }}>
                Gagal
            </div>}
              {!errMessage && <div style={{ fontSize: "4.25rem", fontWeight: "bold", color: "#45ab75" }}>
                Berhasil
            </div>}
              {errMessage && (<div><div style={{ padding: "3rem 0", fontSize: "16px" }}>
                {errMessage}
              </div>
              {(errMessage.toLowerCase().indexOf("expired") !== -1 || errMessage.toLowerCase().indexOf("hangus") !== -1) && <button type="submit" className="btn btn-block" onClick={() => handleResentMailConfirmation()} style={{backgroundColor: "#07406b", color: "white", borderColor: "#07406b"}}>
                  Kirim ulang email konfirmasi
                    </button>}
              </div>)}
              {!errMessage && (<div>
                <div style={{ padding: "3rem 0", fontSize: "16px" }}>
                  Akun terlah dikonfirmasi. Anda sekarang dapat menggunakan RDTR Realtime. Sistem ini menyediakan informasi lengkap mengenai rencana detail tata ruang meliputi hampir seluruh provinsi di Indonesia
            </div>
                <button type="submit" className="btn btn-success btn-block" onClick={() => handleLogin()}>
                  Lanjutkan ke Halaman Login
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
  background-image: url("./images/Image 9.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;
