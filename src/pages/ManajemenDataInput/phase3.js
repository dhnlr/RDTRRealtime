import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";

import { Header, Menu, Footer, ProgressCircle } from "../../components";

import { config } from "../../Constants";

function ManajemenDataInputPhase3() {
  const { state } = useLocation();
  let history = useHistory();
  const { register, handleSubmit } = useForm();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);
  const [progress, setProgress] = useState({ loaded: null, total: null });

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

  const onSubmit = ({ building, persil, pola_ruang }, e) => {
    setErrMessage(null);
    setIsProcessing(true);

    var fd = new FormData();
    fd.set("bangunan", building[0]);
    fd.set("persil_tanah", persil[0]);
    fd.set("pola_ruang", pola_ruang[0]);
    fd.set("project_id", state?.id);

    axios
      .post(config.url.API_URL + "/FileUploader/Kdbklb", fd, {
        headers: { Authorization: "Bearer " + sessionStorage.token },
        onUploadProgress: (progressEvent) => {
          setProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
          });
        },
      })
      .then(({ data }) => {
        setIsProcessing(false);
        setProgress({
          loaded: null,
          total: null,
        });
        if (data.status.code === 200) {
          goSimulasi();
        } else {
          setErrMessage(data?.status?.description);
        }
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendapatkan mengunggah data. Silahkan coba beberapa saat lagi."
            );
        setIsProcessing(false);
      });
  };

  function goSimulasi() {
    history.push("/datamanagementinput/kebutuhandata", {
      id: state?.id,
    });
  }

  return (
    <div className="container-scroller">
      <Header />
      {isProcessing && (
        <div
          className="swal2-container swal2-bottom-start"
          style={{ overflowY: "auto" }}
        >
          <div
            aria-labelledby="swal2-title"
            aria-describedby="swal2-content"
            className="swal2-popup swal2-toast swal2-icon-success swal2-show"
            tabIndex="-1"
            role="alert"
            aria-live="polite"
            style={{ width: "25vw", display: "flex" }}
          >
            <div className="swal2-header">
              {progress.loaded && progress.loaded === progress.total && (
                <span
                  className="spinner-border text-primary"
                  role="status"
                  aria-hidden="true"
                ></span>
              )}
              {progress.loaded !== progress.total &&
                (progress.loaded / progress.total) * 100 > 90 && (
                  <div
                    className="swal2-icon swal2-success swal2-icon-show"
                    // style={{ display: "flex" }}
                  >
                    <div
                      className="swal2-success-circular-line-left"
                      style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    ></div>
                    <span className="swal2-success-line-tip"></span>{" "}
                    <span className="swal2-success-line-long"></span>
                    <div className="swal2-success-ring"></div>{" "}
                    <div
                      className="swal2-success-fix"
                      style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    ></div>
                    <div
                      className="swal2-success-circular-line-right"
                      style={{ backgroundColor: "rgb(255, 255, 255)" }}
                    ></div>
                  </div>
                )}
              <div
                className="swal2-title"
                id="swal2-title"
                // style={{ display: "flex" }}
              >
                {(progress.loaded / progress.total) * 100 <= 90 && (
                  <div className="progress">
                    <div
                      className="progress-bar bg-success"
                      role="progressbar"
                      style={{
                        width: (progress.loaded / progress.total) * 100 + "%",
                      }}
                      aria-valuenow={progress.loaded}
                      aria-valuemin="0"
                      aria-valuemax={progress.total}
                    ></div>
                  </div>
                )}
                {progress.loaded === progress.total
                  ? "Proses data"
                  : "Unggah data"}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="container-fluid page-body-wrapper">
        <Menu active="manajemendata" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  <div className="float-right">
                    <ProgressCircle className="text-muted"></ProgressCircle>
                    <ProgressCircle className="text-muted"></ProgressCircle>
                    <ProgressCircle className="text-primary"></ProgressCircle>
                  </div>
                  <h1>Unggah Data</h1>
                  <p className="text-muted">Masukkan kebutuhan data</p>
                </div>
                {errMessage && (
                  <div className="alert alert-warning" role="alert">
                    {errMessage}
                  </div>
                )}
                <form
                  className="forms-sample"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <div className="accordion" id="accordionExample">
                    <div className="card">
                      <div className="card-header" id="headingOne">
                        <h2 className="mb-0">
                          <button
                            className="btn btn-link collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#polaruang"
                            aria-expanded="false"
                            aria-controls="polaruang"
                          >
                            Pola Ruang RDTR Kabupaten/Kota
                          </button>
                        </h2>
                      </div>

                      <div
                        id="polaruang"
                        className="collapse show"
                        aria-labelledby="headingOne"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            {/* <label>Lampiran (opsional)</label> */}
                            <div className="custom-file">
                              <label
                                id="pola_ruang"
                                htmlFor="pola_ruang"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register}
                                type="file"
                                name="pola_ruang"
                                accept=".zip"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "pola_ruang"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "pola_ruang"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                          </div>
                          {/* <h4>Rincian Data</h4> */}
                          {/* <div className="form-group" data-select2-id="7">
                          <label>Tag (opsional)</label>
                          <Select
                            defaultValue={[options[1], options[2]]}
                            isMulti
                            name="tag"
                            options={options}
                            className="basic-multi-select"
                            classNamePrefix="select"
                            styles={customStyles}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="tahun">Tahun (optional)</label>
                          <input
                            id="tahun"
                            type="number"
                            name="tahun"
                            className="form-control p-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="deskripsi">
                            Deskripsi (opsional)
                          </label>
                          <textarea
                            id="deskripsi"
                            name="deskripsi"
                            className="form-control"
                            rows="4"
                          />
                        </div> */}
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header" id="headingTwo">
                        <h2 className="mb-0">
                          <button
                            className="btn btn-link collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#buildingfootprint"
                            aria-expanded="false"
                            aria-controls="buildingfootprint"
                          >
                            Bangunan yang Sudah Ada
                          </button>
                        </h2>
                      </div>
                      <div
                        id="buildingfootprint"
                        className="collapse show"
                        aria-labelledby="headingTwo"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            {/* <label>Lampiran (opsional)</label> */}
                            <div className="custom-file">
                              <label
                                id="building"
                                htmlFor="building"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register}
                                type="file"
                                name="building"
                                accept=".zip"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "building"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "building"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header" id="headingThree">
                        <h2 className="mb-0">
                          <button
                            className="btn btn-link collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#persiltanah"
                            aria-expanded="false"
                            aria-controls="persiltanah"
                          >
                            Persil Tanah
                          </button>
                        </h2>
                      </div>
                      <div
                        id="persiltanah"
                        className="collapse show"
                        aria-labelledby="headingThree"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            {/* <label>Lampiran (opsional)</label> */}
                            <div className="custom-file">
                              <label
                                id="persil"
                                htmlFor="persil"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register}
                                type="file"
                                name="persil"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "persil"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "persil"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="template-demo float-sm-left float-md-right">
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => goSimulasi()}
                      disabled={isProcessing}
                    >
                      Kembali
                    </button>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      disabled={isProcessing}
                      //   onClick={() => goManajemenData()}
                    >
                      {isProcessing && (
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      )}
                      Simpan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default ManajemenDataInputPhase3;
