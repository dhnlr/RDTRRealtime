import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "../../axiosConfig";
import CreatableSelect from "react-select/creatable";

import { Header, Menu, Footer, ProgressCircle } from "../../components";

import { config } from "../../Constants";

function DataManagementInputFlood() {
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
      kelerengan,
      kelerengan_year,
      kelerengan_desc,
      kelerengan_tag,
      drainase,
      drainase_year,
      drainase_desc,
      drainase_tag,
      slope_denmas,
      slope_denmas_year,
      slope_denmas_desc,
      slope_denmas_tag,
    },
    e
  ) => {
    setErrMessage(null);
    setIsProcessing(true);

    if(kelerengan_tag) kelerengan_tag = kelerengan_tag.map((tag) => tag.value);
    if(drainase_tag) drainase_tag = drainase_tag.map((tag) => tag.value);
    if(slope_denmas_tag) slope_denmas_tag = slope_denmas_tag.map((tag) => tag.value);

    var fd = new FormData();
    fd.set("kelerengan", kelerengan[0]);
    fd.set("tahun_kelerengan", kelerengan_year);
    fd.set("deskripsi_kelerengan", kelerengan_desc);
    fd.set("tag_kelerengan", kelerengan_tag);
    fd.set("drainase", drainase[0]);
    fd.set("tahun_drainase", drainase_year);
    fd.set("deskripsi_drainase", drainase_desc);
    fd.set("tag_drainase", drainase_tag);
    fd.set("slope_demnas", slope_denmas[0]);
    fd.set("tahun_slope_demnas", slope_denmas_year);
    fd.set("deskripsi_slope_demnas", slope_denmas_desc);
    fd.set("tag_slope_demnas", slope_denmas_tag);
    fd.set("project_id", state?.id.id);

    axios
      .post(config.url.API_URL + "/FileUploader/Banjir", fd, {
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
          goSimulasi(data.obj.project);
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

  function goSimulasi(data = state.id) {
    history.push("/datamanagementinput/kebutuhandata", {
      id: data,
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
                  <h1>Modul Banjir</h1>
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
                      <div className="card-header" id="headingOne">
                        <h2 className="mb-0">
                          <button
                            className="btn text-left btn-sm collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#slope"
                            aria-expanded="false"
                            aria-controls="slope"
                          >
                            <i className="ti-arrow-circle-down"> </i>
                            Kelerengan
                          </button>
                          <a
                            className="btn btn-rounded btn-outline-primary float-right"
                            href={config.url.API_URL + "/Template/kelerengan.zip"}
                          >
                            Unduh Contoh
                          </a>
                        </h2>
                      </div>

                      <div
                        id="slope"
                        className="collapse show"
                        aria-labelledby="headingOne"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            <label>Lampiran</label>
                            <div className="custom-file">
                              <label
                                id="kelerengan"
                                htmlFor="kelerengan"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register({
                                  required: "Berkas kelerengan harus diisi",
                                })}
                                type="file"
                                name="kelerengan"
                                accept=".zip"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "kelerengan"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "kelerengan"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                              {errors.kelerengan && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.kelerengan.message}
                                </small>
                              )}
                            </div>
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="kelerengan_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="kelerengan_year"
                                className="form-control"
                                name="kelerengan_year"
                                placeholder="Tahun kelerengan"
                                ref={register({
                                  pattern: {
                                    value: /^\d{4}$/,
                                    message: "Format tahun salah",
                                  },
                                })}
                              />
                              {errors.kelerengan_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.kelerengan_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="kelerengan_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="kelerengan_desc"
                                className="form-control"
                                name="kelerengan_desc"
                                placeholder="Deskripsi kelerengan"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="kelerengan_tag">
                              Tag (opsional)
                            </label>
                            <Controller
                              id="kelerengan_tag"
                              as={CreatableSelect}
                              name="kelerengan_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag kelerengan"
                              className=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header" id="headingTwo">
                      <h2 className="mb-0">
                          <button
                            className="btn text-left btn-sm collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#slope"
                            aria-expanded="false"
                            aria-controls="slope"
                          >
                            <i className="ti-arrow-circle-down"> </i>
                            Drainase
                          </button>
                          <a
                            className="btn btn-rounded btn-outline-primary float-right"
                            href={config.url.API_URL + "/Template/drainase.zip"}
                          >
                            Unduh Contoh
                          </a>
                        </h2>
                      </div>
                      <div
                        id="drainase_div"
                        className="collapse show"
                        aria-labelledby="headingTwo"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            <label>Lampiran</label>
                            <div className="custom-file">
                              <label
                                id="drainase"
                                htmlFor="drainase"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register({
                                  required: "Berkas drainase harus ada",
                                })}
                                type="file"
                                name="drainase"
                                accept=".zip"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "drainase"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "drainase"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                            {errors.drainase && (
                              <small
                                id="nameHelp"
                                className="form-text text-danger"
                              >
                                {errors.drainase.message}
                              </small>
                            )}
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="drainase_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="drainase_year"
                                className="form-control"
                                name="drainase_year"
                                placeholder="Tahun drainase yang sudah ada"
                                ref={register({
                                  pattern: {
                                    value: /^\d{4}$/,
                                    message: "Format tahun salah",
                                  },
                                })}
                              />
                              {errors.drainase_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.drainase_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="drainase_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="drainase_desc"
                                className="form-control"
                                name="drainase_desc"
                                placeholder="Deskripsi drainase yang sudah ada"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="drainase_tag">Tag (opsional)</label>
                            <Controller
                              id="drainase_tag"
                              as={CreatableSelect}
                              name="drainase_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag drainase"
                              className=""
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="card-header" id="headingThree">
                      <h2 className="mb-0">
                          <button
                            className="btn text-left btn-sm collapsed"
                            type="button"
                            data-toggle="collapse"
                            data-target="#slope"
                            aria-expanded="false"
                            aria-controls="slope"
                          >
                            <i className="ti-arrow-circle-down"> </i>
                            Slope Demnas
                          </button>
                          <a
                            className="btn btn-rounded btn-outline-primary float-right"
                            href={config.url.API_URL + "/Template/slope_denmas.zip"}
                          >
                            Unduh Contoh
                          </a>
                        </h2>
                      </div>
                      <div
                        id="demnas"
                        className="collapse show"
                        aria-labelledby="headingThree"
                        data-parent="#accordionExample"
                      >
                        <div className="card-body">
                          <div className="form-group">
                            <label>Lampiran</label>
                            <div className="custom-file">
                              <label
                                id="slope_denmas"
                                htmlFor="slope_denmas"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register({
                                  required: "Berkas slope denmas harus ada",
                                })}
                                type="file"
                                name="slope_denmas"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "slope_denmas"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "slope_denmas"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                            {errors.slope_denmas && (
                              <small
                                id="nameHelp"
                                className="form-text text-danger"
                              >
                                {errors.slope_denmas.message}
                              </small>
                            )}
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="slope_denmas_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="slope_denmas_year"
                                className="form-control"
                                name="slope_denmas_year"
                                placeholder="Tahun slope demnas"
                                ref={register({
                                  pattern: {
                                    value: /^\d{4}$/,
                                    message: "Format tahun salah",
                                  },
                                })}
                              />
                              {errors.slope_denmas_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.slope_denmas_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="slope_denmas_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="slope_denmas_desc"
                                className="form-control"
                                name="slope_denmas_desc"
                                placeholder="Deskripsi slope demnas"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="slope_denmas_tag">Tag (opsional)</label>
                            <Controller
                              id="slope_denmas_tag"
                              as={CreatableSelect}
                              name="slope_denmas_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag slope demnas"
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

export default DataManagementInputFlood;
