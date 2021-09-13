import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "../../axiosConfig";
import CreatableSelect from "react-select/creatable";

import { Header, Menu, Footer, ProgressCircle } from "../../components";

import { config } from "../../Constants";

function DataManagementInputCongestion() {
  const { state } = useLocation();
  let history = useHistory();
  const { register, handleSubmit, control, errors } = useForm();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errMessage, setErrMessage] = useState(null);
  const [progress, setProgress] = useState({ loaded: null, total: null });

  useEffect(() => {
    if (!state?.id) {
      localStorage.removeItem("state");
      history.push("/datamanagement");
    }
  }, [history, state?.id]);

  const onSubmit = (
    {
      jaringan_jalan,
      jaringan_jalan_year,
      jaringan_jalan_desc,
      jaringan_jalan_tag,
    },
    e
  ) => {
    setErrMessage(null);
    setIsProcessing(true);

    if (jaringan_jalan_tag)
      jaringan_jalan_tag = jaringan_jalan_tag.map((tag) => tag.value);

    var fd = new FormData();
    fd.set("jaringan_jalan", jaringan_jalan[0]);
    fd.set("tahun_jaringan_jalan", jaringan_jalan_year);
    fd.set("deskripsi_jaringan_jalan", jaringan_jalan_desc);
    fd.set("tag_jaringan_jalan", jaringan_jalan_tag);
    fd.set("project_id", state?.id);

    axios
      .post(config.url.API_URL + "/FileUploader/Kemacetan", fd, {
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
          setErrMessage(data?.status?.description ?? data?.status?.message);
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
                  <h1>Modul Kemacetan</h1>
                  <p className="text-muted">Unggah kebutuhan data</p>
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
                      <div className="card-header" id="headingThree">
                        <h2 className="mb-0">
                          <button
                            className="btn text-left btn-sm collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#jaringanjalan"
                            aria-expanded="false"
                            aria-controls="jaringanjalan"
                          >
                            <i className="ti-arrow-circle-down"> </i>
                            Jaringan Jalan
                          </button>
                          <a
                            className="btn btn-rounded btn-outline-primary float-right"
                            href="https://rdtr.onemap.id/backend/Template/jalan.zip"
                          >
                            Unduh Contoh
                          </a>
                        </h2>
                      </div>
                      <div
                        id="jaringanjalan"
                        className="collapse show"
                        aria-labelledby="headingThree"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            <label>Lampiran</label>
                            <div className="custom-file">
                              <label
                                id="jaringan_jalan"
                                htmlFor="jaringan_jalan"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register({
                                  required: "Berkas jaringan jalan harus ada",
                                })}
                                type="file"
                                name="jaringan_jalan"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "jaringan_jalan"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "jaringan_jalan"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                            {errors.jaringan_jalan && (
                              <small
                                id="nameHelp"
                                className="form-text text-danger"
                              >
                                {errors.jaringan_jalan.message}
                              </small>
                            )}
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="jaringan_jalan_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="jaringan_jalan_year"
                                className="form-control"
                                name="jaringan_jalan_year"
                                placeholder="Tahun jaringan jalan"
                                ref={register({
                                  pattern: {
                                    value: /^\d{4}$/,
                                    message: "Format tahun salah",
                                  },
                                })}
                              />
                              {errors.jaringan_jalan_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.jaringan_jalan_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="jaringan_jalan_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="jaringan_jalan_desc"
                                className="form-control"
                                name="jaringan_jalan_desc"
                                placeholder="Deskripsi jaringan jalan"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="jaringan_jalan_tag">
                              Tag (opsional)
                            </label>
                            <Controller
                              id="jaringan_jalan_tag"
                              as={CreatableSelect}
                              name="jaringan_jalan_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag jaringan jalan"
                              className=""
                            />
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

export default DataManagementInputCongestion;
