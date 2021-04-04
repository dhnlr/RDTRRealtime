import React from "react";
import { useHistory } from "react-router-dom";
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
          <img src="./images/logo-atrbpn.svg" style={{ margin: "2rem 3rem" }} alt="ATR BPN" />
        </div>
        <div style={{ flex: "4", display: "flex", padding: "1rem 0" }}>
          <div style={{ flex: "1", paddingLeft: "3rem" }}>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "1rem", letterSpacing: "3px" }}>RENCANA DETAIL TATA RUANG</div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "2.25rem", fontWeight: "bold", marginTop: "30px", color: "#07406b" }}>
              RDTR
            </div>
            <div style={{ fontFamily: "Montserrat, sans-serif", fontSize: "3.25rem", fontWeight: "bold", marginTop: "-1rem", color: "#45ab75" }}>
              REALTIME
            </div>
            <div style={{ paddingTop: "15px", width: "60%", fontSize: "16px" }}>
              RDTR Realtime menyediakan informasi lengkap mengenai rencana detail tata ruang meliputi hampir seluruh provinsi di Indonesia
            </div>
            <div style={{ width: "60%", display: "flex", /* alignItems: "center", */ justifyContent: "stretch", margin: "60px 5px 0 0", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-light" style={{margin:"5px"}}>Pelajari lebih lanjut</button>
              <button type="button" className="btn btn-primary" onClick={() => handleDashboard()} style={{margin:"5px"}}>
                Mulai Sekarang
              </button>
            </div>
          </div>
          <div style={{ flex: "1" }}></div>
        </div>
        <div
          style={{ background: "#0d2946", width: "100%", flex: "1", display: "flex", alignItems: "center", padding: "0.8rem 3rem", fontSize: "14px", color: "#fff", flexWrap: "wrap", justifyContent: "space-between" }}
        >
          <div /* style={{ flex: "1" }} */>
            <div>&copy; Copyright - Kementerian Agraria dan Tata Ruang/ Badan Pertanahan Nasional</div>
            <div>Jl. Sisingamangaraja No. 2 Kebayoran Baru, Jakarta Selatan</div>
          </div>
          <div /* style={{ flex: "1" }} */>
            <div>Powered by Pusdatin</div>
          </div>
        </div>
      </Main>
      <MapBackground src="./images/group-3291.png"></MapBackground>

      {/* <img
        src="./images/group-3291.png"
        style={{ margin: "5px", zIndex: "3", position: "absolute", right: "8%", top: "155px", width: "45%", height: "30%" }}
        alt="RDTR INTERACTIVE"
      /> */}
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
const MapBackground = styled.img`
 margin: 5px; 
 z-index: 3; 
 position: absolute; 
 right: 8%; 
 top: 155px; 
 width: 45%; 
 height: 30%;

 @media only screen and (max-width: 768px) {
//  z-index: -1; 
//  opacity: 0.3;
//  width: 100%;
//  height: auto;
//  position: absolute;
//  top: 50%;
//  left: 50%;
//  transform: translate(-50%,50%); 
 display: none;
 }
`;
