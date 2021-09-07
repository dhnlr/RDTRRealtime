import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "../../axiosConfig";
import CreatableSelect from "react-select/creatable";

import { Header, Menu, Footer, ProgressCircle } from "../../components";

import { config } from "../../Constants";

function DataManagementInputTrash() {
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

  const onSubmit = ({ building, building_year, building_desc, building_tag, persil, persil_year, persil_desc, persil_tag, pola_ruang, pola_ruang_year, pola_ruang_desc, pola_ruang_tag, }, e) => {
    setErrMessage(null);
    setIsProcessing(true);

    building_tag = building_tag.map(tag => tag.value)
    persil_tag = persil_tag.map(tag => tag.value)
    pola_ruang_tag = pola_ruang_tag.map(tag => tag.value)

    var fd = new FormData();
    fd.set("bangunan", building[0]);
    fd.set("tahun_bangunan", building_year)
    fd.set("deskripsi_bangunan", building_desc)
    fd.set("tag_bangunan", building_tag)
    fd.set("persil_tanah", persil[0]);
    fd.set("tahun_persil_tanah", persil_year)
    fd.set("deskripsi_persil_tanah", persil_desc)
    fd.set("tag_persil_tanah", persil_tag)
    fd.set("pola_ruang", pola_ruang[0]);
    fd.set("tahun_pola_ruang", pola_ruang_year)
    fd.set("deskripsi_pola_ruang", pola_ruang_desc)
    fd.set("tag_pola_ruang", pola_ruang_tag)
    fd.set("project_id", state?.id);

    axios
      .post(config.url.API_URL + "/FileUploader/Kdbklb", fd, {
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
                  <h1>Modul Persampahan</h1>
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
                            <label>Lampiran</label>
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
                                ref={register({
                                  required: "Berkas pola ruang harus diisi",
                                })}
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
                              {errors.pola_ruang && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.pola_ruang.message}
                                </small>
                              )}
                            </div>
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="pola_ruang_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="pola_ruang_year"
                                className="form-control"
                                name="pola_ruang_year"
                                placeholder="Tahun pola ruang"
                                ref={register({pattern: { value: /^\d{4}$/, message: "Format tahun salah" }})}
                              />
                              {errors.pola_ruang_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.pola_ruang_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="pola_ruang_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="pola_ruang_desc"
                                className="form-control"
                                name="pola_ruang_desc"
                                placeholder="Deskripsi pola ruang"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="pola_ruang_tag">
                              Tag (opsional)
                            </label>
                            <Controller
                              id="pola_ruang_tag"
                              as={CreatableSelect}
                              name="pola_ruang_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag pola ruang"
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
                            <label>Lampiran</label>
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
                                ref={register({
                                  required: "Berkas bangunan harus ada",
                                })}
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
                            {errors.building && (
                              <small
                                id="nameHelp"
                                className="form-text text-danger"
                              >
                                {errors.building.message}
                              </small>
                            )}
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="building_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="building_year"
                                className="form-control"
                                name="building_year"
                                placeholder="Tahun bangunan yang sudah ada"
                                ref={register({pattern: { value: /^\d{4}$/, message: "Format tahun salah" }})}
                              />
                              {errors.building_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.building_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="building_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="building_desc"
                                className="form-control"
                                name="building_desc"
                                placeholder="Deskripsi bangunan yang sudah ada"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="building_tag">Tag (opsional)</label>
                            <Controller
                              id="building_tag"
                              as={CreatableSelect}
                              name="building_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag bangunan"
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
                            <label>Lampiran</label>
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
                                ref={register({
                                  required: "Berkas persil tanah harus ada",
                                })}
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
                            {errors.persil && (
                              <small
                                id="nameHelp"
                                className="form-text text-danger"
                              >
                                {errors.persil.message}
                              </small>
                            )}
                          </div>
                          <h4>Rincian Data</h4>
                          <div className="form-row">
                            <div className="form-group col-md-6">
                              <label htmlFor="persil_year">
                                Tahun (opsional)
                              </label>
                              <input
                                id="persil_year"
                                className="form-control"
                                name="persil_year"
                                placeholder="Tahun persil tanah"
                                ref={register({pattern: { value: /^\d{4}$/, message: "Format tahun salah" }})}
                              />
                              {errors.persil_year && (
                                <small
                                  id="nameHelp"
                                  className="form-text text-danger"
                                >
                                  {errors.persil_year.message}
                                </small>
                              )}
                            </div>
                            <div className="form-group col-md-6">
                              <label htmlFor="persil_desc">
                                Deskripsi (opsional)
                              </label>
                              <input
                                id="persil_desc"
                                className="form-control"
                                name="persil_desc"
                                placeholder="Deskripsi persil tanah"
                                ref={register}
                              />
                            </div>
                          </div>
                          <div className="form-group">
                            <label htmlFor="persil_tag">Tag (opsional)</label>
                            <Controller
                              id="persil_tag"
                              as={CreatableSelect}
                              name="persil_tag"
                              components={{
                                DropdownIndicator: null,
                              }}
                              control={control}
                              defaultValue={null}
                              isMulti
                              isClearable
                              placeholder="Tag persil tanah"
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

export default DataManagementInputTrash;
