import React, { useEffect } from "react";
import { useHistory, Link } from "react-router-dom";
import styled from "styled-components";

function Home() {
  let history = useHistory();
  const handleDashboard = () => {
    history.push("/login");
  };

  return (
    <div>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
      <Main>
        <div style={{ flex: "1" }}>
          <img src="./images/logo-atrbpn.svg" style={{ margin: "5px 5px 5px 100px" }} alt="ATR BPN" />
        </div>
        <div style={{ flex: "4", display: "flex" }}>
          <div style={{ flex: "1", paddingLeft: "100px" }}>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "22px", letterSpacing: "3px" }}>RENCANA DETAIL TATA RUANG</div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "62px", fontWeight: "bold", marginTop: "30px", color: "#07406b" }}>
              RDTR
            </div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "62px", fontWeight: "bold", marginTop: "-20px", color: "#45ab75" }}>
              INTERAKTIF
            </div>
            <div style={{ paddingTop: "15px", width: "60%" }}>
              RDTR Interaktif menyediakan informasi lengkap mengenai rencana detail tata ruang meliputi hampir seluruh provinsi di Indonesia
            </div>
            <div style={{ width: "60%", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "60px" }}>
              <u style={{ fontSize: "14px", cursor: "pointer" }}>Pelajari lebih lanjut</u>
              <button type="button" class="btn btn-primary" onClick={() => handleDashboard()}>
                Mulai Sekarang
              </button>
            </div>
          </div>
          <div style={{ flex: "1" }}></div>
        </div>
        <div
          style={{ background: "#0d2946", flex: "1", display: "flex", alignItems: "center", paddingLeft: "100px", fontSize: "12px", color: "#fff" }}
        >
          <div style={{ flex: "1" }}>
            <div>&copy; Copyright - Kementerian Agraria dan Tata Ruang/ Badan Pertanahan Nasional</div>
            <div>Jl. Raden Patah 1 No. 1 Kebayoran Baru, Jakarta Selatan</div>
          </div>
          <div style={{ flex: "1" }}>
            <div>Powered by Pusdatin</div>
          </div>
        </div>
      </Main>

      <img
        src="./images/group-3291.png"
        style={{ margin: "5px", zIndex: "3", position: "absolute", right: "8%", top: "155px", width: "45%", height: "30%" }}
        alt="RDTR INTERACTIVE"
      />
    </div>
  );
}

export default Home;

const Main = styled.div`
  height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
`;
