import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { Header, Menu, Footer, ProgressCircle } from "../../components";

function DataManagementInputPhase2() {
  const { state } = useLocation();
  let history = useHistory();

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

  useEffect(() => {
    if (!state?.id) {
      localStorage.removeItem("state");
      history.push("/datamanagement");
    }
  }, [history, state?.id]);

  function goSimulasi() {
    history.push("/datamanagementinput");
  }

  function goManajemenData(url) {
    history.push("/datamanagementinput/"+url, {
      id: state?.id,
    });
  }

  function handleDone() {
    localStorage.removeItem("state");
    history.push("/simulation");
  }

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="manajemendata" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  <div className="float-right">
                    <ProgressCircle className="text-muted"></ProgressCircle>
                    <ProgressCircle className="text-primary"></ProgressCircle>
                    <ProgressCircle className="text-muted"></ProgressCircle>
                  </div>
                  <h1>Kebutuhan Data</h1>
                  <p className="text-muted">
                    Pilih kebutuhan data di bawah ini
                  </p>
                </div>
                <div
                  style={{ flex: "4 1 50%", display: "flex", flexWrap: "wrap" }}
                >
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: "pointer",
                    }}
                    onClick={() => goManajemenData("congestion")}
                  >
                    <img
                      src="../images/manajemendata/kemacetan.png"
                      alt="banjir"
                      width="100%"
                    />
                    <div
                      className="text-block"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        padding: "20px",
                        color: "white",
                        background:
                          "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Kemacetan
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: "pointer",
                    }}
                    onClick={() => goManajemenData("water")}
                  >
                    <img
                      src="../images/manajemendata/air.png"
                      alt="banjir"
                      width="100%"
                    />
                    <div
                      className="text-block"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        padding: "20px",
                        color: "white",
                        background:
                          "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Kebutuhan Air
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: "pointer",
                    }}
                    onClick={() => goManajemenData("trash")}
                  >
                    <img
                      src="../images/manajemendata/sampah.png"
                      alt="banjir"
                      width="100%"
                    />
                    <div
                      className="text-block"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        padding: "20px",
                        color: "white",
                        background:
                          "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Persampahan
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: "pointer",
                    }}
                    onClick={() => goManajemenData("flood")}
                  >
                    <img
                      src="../images/manajemendata/banjir.png"
                      alt="banjir"
                      width="100%"
                    />
                    <div
                      className="text-block"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        padding: "20px",
                        color: "white",
                        background:
                          "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Banjir
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: "pointer",
                    }}
                    onClick={() => goManajemenData("kdbklb")}
                  >
                    <img
                      src="../images/manajemendata/kemacetan.png"
                      alt="kdb & kdlb"
                      width="100%"
                    />
                    <div
                      className="text-block"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        textAlign: "center",
                        width: "100%",
                        padding: "20px",
                        color: "white",
                        background:
                          "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Simulasi KDB & KDLB
                    </div>
                  </div>
                </div>
                <div className="template-demo float-sm-left float-md-right">
                  <button
                    className="btn btn-light"
                    type="button"
                    onClick={() => goSimulasi()}
                  >
                    Kembali
                  </button>
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => {
                      handleDone();
                    }}
                  >
                    Lanjutkan ke Simulasi
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default DataManagementInputPhase2;
