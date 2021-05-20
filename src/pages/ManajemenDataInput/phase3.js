import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
// import Select from "react-select";

import { Header, Menu, Footer } from "../../components";

import { config } from "../../Constants";

function ManajemenDataInputPhase3() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  let history = useHistory();

  const [isProcessing, setIsProcessing] = useState(false);
  /* const options = [
    { value: "chocolate", label: "Banjir" },
    { value: "strawberry", label: "Macet" },
    { value: "vanilla", label: "Sampah" },
  ];

  const customStyles = {
    multiValueLabel: (styles) => ({
      ...styles,
      backgroundColor: "#4b49ac",
      color: "white",
    }),
  }; */

  const onSubmit = ({ building, persil, ruang }, e) => {
    setIsProcessing(true);

    var fd = new FormData();
    fd.set("bangunan", building[0]);
    fd.set("persil_tanah", persil[0]);
    fd.set("pola_ruang", ruang[0]);
    fd.set("project_id", 6)

    axios
      .post(config.url.API_URL + "/FileUploader/Kdbklb", fd, {
        headers: { Authorization: "Bearer " + sessionStorage.token },
        onUploadProgress: progressEvent => console.log(progressEvent.loaded),
      })
      .then((response) => {
        if (response.data.code === 200) {
          Swal.fire({
            title: "Berhasil",
            text: "Laporan berhasil dikirim",
            icon: "success",
            confirmButtonText: "Selesai",
            allowOutsideClick: false,
          }).then((result) => {
            if (result.value) {
              e.target.reset();
              setIsProcessing(false);
            }
          });
        } else {
          Swal.fire("Maaf", response.data.description, "error");
          setIsProcessing(false);
        }
      })
      .catch((error) => {
        Swal.fire(
          "Maaf",
          error.response?.data?.status?.message
            ? error.response?.data?.status?.message
            : "Gagal mengirim laporan. Silahkan coba beberapa saat lagi",
          "error"
        );
        setIsProcessing(false);
      });
  };

  function goSimulasi() {
    history.push("/manajemendatainput/kebutuhandata");
  }

  function goManajemenData() {
    history.push("/manajemendatainput/kebutuhandata");
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
                  <h1>Upload Data</h1>
                  <p className="text-muted">Masukkan kebutuhan data</p>
                </div>
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
                            data-target="#rdtr"
                            aria-expanded="false"
                            aria-controls="rdtr"
                          >
                            RDTR Kabupaten/Kota
                          </button>
                        </h2>
                      </div>

                      <div
                        id="rdtr"
                        className="collapse show"
                        aria-labelledby="headingOne"
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
                            Building Footprint
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
                                accept=".zip"
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
                                id="ruang"
                                htmlFor="ruang"
                                className="custom-file-label"
                              >
                                Cari berkas...
                              </label>
                              <input
                                className="form-control custom-file-input"
                                ref={register}
                                type="file"
                                name="ruang"
                                onChange={(e) => {
                                  e.target.files[0].name
                                    ? (document.getElementById(
                                        "ruang"
                                      ).innerHTML = e.target.files[0].name)
                                    : (document.getElementById(
                                        "ruang"
                                      ).innerHTML = "Cari berkas...");
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="template-demo float-right">
                    <button
                      className="btn btn-light"
                      type="button"
                      onClick={() => goSimulasi()}
                    >
                      Kembali
                    </button>
                    <button
                      className="btn btn-primary"
                      type="submit"
                      //   onClick={() => goManajemenData()}
                    >
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
