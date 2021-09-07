import React, { useEffect, useState, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "../../axiosConfig";
import Swal from "sweetalert2";

import { Header, Menu, Footer } from "../../components";

import { config } from "../../Constants";

function Profile() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  let history = useHistory();

  const [data, setData] = useState(null);
  const [errMessage, setErrMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const password = useRef({});
  password.current = watch("password", "");

  useEffect(() => {
    setIsProcessing(true);
    setErrMessage(null);

    axios
      .get(config.url.API_URL + "/Profile/Get")
      .then((response) => {
        setIsProcessing(false);
        if (response.data.status.code === 200) {
          setData(response.data.obj);
        } else {
          setErrMessage(response.data.status.message);
        }
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendapatkan profil. Silahkan coba beberapa saat lagi."
            );
        setIsProcessing(false);
      });
  }, [history]);

  const onSubmit = ({ currentPassword, password, konfirmasiPassword }, e) => {
    axios
      .put(
        config.url.API_URL + "/Profile/ChangePassword",
        {
          currentPassword: currentPassword,
          newPassword: password,
          confirmPassword: konfirmasiPassword,
        },
      )
      .then((response) => {
        if (response.data.code === 200) {
          Swal.fire({
            title: "Berhasil",
            text: "Kata sandi berhasil diganti",
            icon: "success",
            confirmButtonText: "Selesai",
            allowOutsideClick: false,
          }).then((result) => {
            if (result.value) {
              e.target.reset();
            }
          });
        } else {
          Swal.fire("Maaf", response.data.description, "error");
        }
      });
  };

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="profile" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              {errMessage && (
                <div className="alert alert-warning" role="alert">
                  {errMessage}
                </div>
              )}
              <div className="col-md-12 stretch-card mt-4 mb-2">
                {/* <img className="mr-2" src={buildingIcon} alt="building icon" style={{ float: "left", width: "3rem" }} /> */}
                <p>
                  <span
                    className="font-weight-bold ml-1 mr-1 align-middle"
                    style={{ fontSize: 20 }}
                  >
                    Profil Pengguna
                  </span>
                  {data && (
                    <Link
                      to={{
                        pathname: "/profile/edit",
                        state: data,
                      }}
                    >
                      <button className="btn btn-success ml-2">
                        Ubah Profil
                      </button>
                    </Link>
                  )}
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 grid-margin stretch-card my-2">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Detil</p>
                    <div className="row">
                      <div className="col-12">
                        <div className="table-responsive">
                          <div>
                            {isProcessing && (
                              <>
                                <div
                                  className="spinner-grow text-primary"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div
                                  className="spinner-grow text-secondary"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div
                                  className="spinner-grow text-success"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div
                                  className="spinner-grow text-danger"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div
                                  className="spinner-grow text-warning"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                                <div
                                  className="spinner-grow text-info"
                                  role="status"
                                >
                                  <span className="sr-only">Loading...</span>
                                </div>
                              </>
                            )}
                            {data && !isProcessing && (
                              <address>
                                <p className="font-weight-bold">Email</p>
                                <p className="mb-2">{data.email}</p>
                                <p className="font-weight-bold">Username</p>
                                <p className="mb-2">{data.userName}</p>
                                <p className="font-weight-bold">Role</p>
                                <p className="mb-2">{data.roles[0].name}</p>
                              </address>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 grid-margin stretch-card my-2">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Kata Sandi</p>
                    <div className="row">
                      <div className="col-12">
                        <div className="table-responsive">
                          {isProcessing && (
                            <>
                              <div
                                className="spinner-grow text-primary"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                              <div
                                className="spinner-grow text-secondary"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                              <div
                                className="spinner-grow text-success"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                              <div
                                className="spinner-grow text-danger"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                              <div
                                className="spinner-grow text-warning"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                              <div
                                className="spinner-grow text-info"
                                role="status"
                              >
                                <span className="sr-only">Loading...</span>
                              </div>
                            </>
                          )}
                          {data && !isProcessing && (
                            <form
                              className="forms-sample"
                              onSubmit={handleSubmit(onSubmit)}
                            >
                              <div className="form-group">
                                <label htmlFor="currentPassword">
                                  Kata Sandi Saat Ini
                                </label>
                                <input
                                  type="password"
                                  className={`form-control p-input ${
                                    errors.currentPassword ? "is-invalid" : ""
                                  }`}
                                  id="currentPassword"
                                  placeholder="Kata sandi lama"
                                  name="currentPassword"
                                  ref={register({
                                    required: "Kata sandi saat ini harus diisi",
                                    minLength: {
                                      value: 6,
                                      message:
                                        "Kata sandi sekurangnya memiliki 6 karaketer",
                                    },
                                  })}
                                />
                                {!errors.currentPassword && (
                                  <small className="form-text text-muted">
                                    Kata sandi sekurangnya memiliki 6 karakter
                                  </small>
                                )}
                                {errors.currentPassword && (
                                  <small
                                    id="currentPasswordHelp"
                                    className="form-text text-danger"
                                  >
                                    {errors.currentPassword.message}
                                  </small>
                                )}
                              </div>
                              <div className="form-group">
                                <label htmlFor="password">
                                  Kata Sandi Baru
                                </label>
                                <input
                                  type="password"
                                  className={`form-control p-input ${
                                    errors.password ? "is-invalid" : ""
                                  }`}
                                  id="password"
                                  placeholder="Kata sandi baru"
                                  name="password"
                                  ref={register({
                                    required: "Kata sandi baru harus diisi",
                                    minLength: {
                                      value: 6,
                                      message:
                                        "Kata sandi sekurangnya memiliki 6 karaketer",
                                    },
                                  })}
                                />
                                {!errors.password && (
                                  <small className="form-text text-muted">
                                    Kata sandi sekurangnya memiliki 6 karakter
                                  </small>
                                )}
                                {errors.password && (
                                  <small
                                    id="passwordHelp"
                                    className="form-text text-danger"
                                  >
                                    {errors.password.message}
                                  </small>
                                )}
                              </div>
                              <div className="form-group">
                                <label htmlFor="konfirmasiPassword">
                                  Konfirmasi Kata Sandi Baru
                                </label>
                                <input
                                  type="password"
                                  className={`form-control p-input ${
                                    errors.konfirmasiPassword
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                  id="konfirmasiPassword"
                                  placeholder="Konfirmasi kata sandi baru"
                                  name="konfirmasiPassword"
                                  ref={register({
                                    validate: (value) =>
                                      value === password.current ||
                                      "Kata sandi tidak sama",
                                  })}
                                />
                                {errors.konfirmasiPassword && (
                                  <small
                                    id="konfirmasiPasswordHelp"
                                    className="form-text text-danger"
                                  >
                                    {errors.konfirmasiPassword.message}
                                  </small>
                                )}
                              </div>
                              <div className="form-group">
                                <button
                                  className="btn btn-success"
                                  type="submit"
                                  disabled={isProcessing}
                                >
                                  {isProcessing && (
                                    <span
                                      className="spinner-border spinner-border-sm mr-2"
                                      role="status"
                                      aria-hidden="true"
                                    ></span>
                                  )}
                                  Ganti Kata Sandi
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
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

export default Profile;
