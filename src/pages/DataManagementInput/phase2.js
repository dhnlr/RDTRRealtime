import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { Header, Menu, Footer, ProgressCircle } from "../../components";
import axios from "../../axiosConfig";
import { config } from "../../Constants";

function DataManagementInputPhase2() {
  const [congestion, setCongestion] = useState(true);
  const [flood, setFlood] = useState(true);
  const [kdb, setKdb] = useState(true);
  const [trash, setTrash] = useState(true);
  const [water, setWater] = useState(true);
  const { state } = useLocation();
  let history = useHistory();

  useEffect(() => {
    if (!state?.id) {
      localStorage.removeItem("state");
      history.push("/datamanagement");
    } else {
      axios
        .get(config.url.API_URL + "/Simulasi/GetAll", {
          params: {
            ProjectId: state.id.id,
          },
        })
        .then(({ data }) => {
          if (data.obj.length > 0) {
            if (
              state.id.module.kemacetan.jaringanJalan.itemsCount ||
              state.id.module.kemacetan.jaringanJalan.detail
            ) {
              setCongestion(false);
            }
            if (
              state.id.module.airBersih.pdam.itemsCount ||
              state.id.module.airBersih.pdam.detail
            ) {
              setWater(false);
            }
            if (
              state.id.module.persampahan.sampah.itemsCount ||
              state.id.module.persampahan.sampah.detail
            ) {
              setTrash(false);
            }
            if (
              state.id.module.banjir.slopeDemnas.itemsCount ||
              state.id.module.banjir.slopeDemnas.detail ||
              state.id.module.banjir.drainase.itemsCount ||
              state.id.module.banjir.drainase.detail ||
              state.id.module.banjir.kelerengan.itemsCount ||
              state.id.module.banjir.kelerengan.detail
            ) {
              setFlood(false);
            }
            if (
              state.id.module.kdbKlb.bangunan.itemsCount ||
              state.id.module.kdbKlb.bangunan.detail ||
              state.id.module.kdbKlb.persilTanah.itemsCount ||
              state.id.module.kdbKlb.persilTanah.detail ||
              state.id.module.kdbKlb.polaRuang.itemsCount ||
              state.id.module.kdbKlb.polaRuang.detail
            ) {
              setKdb(false);
            }
          }
        });
    }
  }, [history, state?.id]);

  function goSimulasi() {
    history.push("/datamanagementinput");
  }

  function goManajemenData(url) {
    history.push("/datamanagementinput/" + url, {
      id: state?.id,
    });
  }

  function handleDone() {
    localStorage.removeItem("state");
    history.push("/schenario");
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
                      cursor: congestion ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (congestion) goManajemenData("congestion");
                    }}
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
                        background: congestion
                          ? "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)"
                          : "linear-gradient(0deg, rgb(25, 60, 10, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Kemacetan
                      {!congestion && (
                        <p>
                          <i className=" ti-check "></i> Sudah diunggah
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: water ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (water) goManajemenData("water");
                    }}
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
                        background: water
                          ? "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)"
                          : "linear-gradient(0deg, rgb(25, 60, 10, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Kebutuhan Air
                      {!water && (
                        <p>
                          <i className=" ti-check "></i> Sudah diunggah
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: trash ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (trash) goManajemenData("trash");
                    }}
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
                        background: trash
                          ? "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)"
                          : "linear-gradient(0deg, rgb(25, 60, 10, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Persampahan
                      {!trash && (
                        <p>
                          <i className=" ti-check "></i> Sudah diunggah
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: flood ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (flood) goManajemenData("flood");
                    }}
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
                        background: flood
                          ? "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)"
                          : "linear-gradient(0deg, rgb(25, 60, 10, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Banjir
                      {!flood && (
                        <p>
                          <i className=" ti-check "></i> Sudah diunggah
                        </p>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      margin: "25px",
                      cursor: kdb ? "pointer" : "not-allowed",
                    }}
                    onClick={() => {
                      if (kdb) goManajemenData("kdbklb");
                    }}
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
                        background: kdb
                          ? "linear-gradient(0deg, rgb(0, 0, 0, 1) 0%, rgba(181,181,181,0.01) 96%)"
                          : "linear-gradient(0deg, rgb(25, 60, 10, 1) 0%, rgba(181,181,181,0.01) 96%)",
                        borderBottomLeftRadius: "20px",
                        borderBottomRightRadius: "20px",
                      }}
                    >
                      Modul Simulasi KDB & KDLB
                      {!kdb && (
                        <p>
                          <i className=" ti-check "></i> Sudah diunggah
                        </p>
                      )}
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
                    Lanjutkan ke Skenario
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
