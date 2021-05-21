import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

import { config } from "../../Constants";

import { Header, Menu, Footer } from "../../components";

function ManajemenDataInput() {
  let history = useHistory();
  let { state } = useLocation();

  const { register, errors, control, handleSubmit } = useForm({
    defaultValues: {
      projectName: state
        ? state?.projectName
        : localStorage.state
        ? JSON.parse(localStorage.state).projectName
        : "",
    },
  });

  const [listProvince, setListProvince] = useState([]);
  const [listCity, setListCity] = useState([]);
  const [{ province, city }, setData] = useState({
    province: state
      ? state?.kotaKabupaten?.provinsi?.id
      : localStorage.state
      ? JSON.parse(localStorage.state)?.kotaKabupaten?.provinsi?.id
      : 2,
    city: state
      ? state?.kotaKabupaten?.id
      : localStorage.state
      ? JSON.parse(localStorage.state)?.kotaKabupaten?.id
      : "",
  });
  const [errMessage, setErrMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmit = ({ projectName, province, city }) => {
    setErrMessage(null);
    setIsProcessing(true);

    const headers = {
      Authorization: "Bearer " + sessionStorage.token,
      "Content-Type": "application/json",
    };
    !state?.id && !localStorage.state
      ? createProject(projectName, province, city, headers)
      : updateProject(projectName, province, city, headers);
  };

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

  useEffect(() => {
    if (!state?.id && !localStorage.state) {
      /* if(!localStorage.getItem("state")){
        localStorage.removeItem("state")
        history.push("/datamanagement");
      }  */
    } else {
      if (state) {
        localStorage.setItem("state", JSON.stringify(state));
      }
    }
  }, [history, state]);

  useEffect(() => {
    if (listProvince.length === 0) {
      axios
        .get(config.url.API_URL + "/MasterData/Provinsi/GetAll", {
          headers: { Authorization: "Bearer " + sessionStorage.token },
        })
        .then(({ data }) => {
          if (data.status.code === 200 && data.obj.length > 0) {
            setListProvince(data.obj);
          }
        })
        .catch((error) => {
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendapatkan provinsi. Silahkan coba beberapa saat lagi."
              );
        });
    }
    if (listProvince.length !== 0 && province !== "") {
      axios
        .get(config.url.API_URL + "/MasterData/KotaKabupaten/GetAll", {
          headers: { Authorization: "Bearer " + sessionStorage.token },
          params: {
            provinsiId: province,
          },
        })
        .then(({ data }) => {
          if (data.status.code === 200 && data.obj.length > 0) {
            setListCity(data.obj);
          }
        })
        .catch((error) => {
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendapatkan provinsi. Silahkan coba beberapa saat lagi."
              );
        });
    }
  }, [listProvince, province]);

  const handleProvinceChange = (event) => {
    axios
      .get(config.url.API_URL + "/MasterData/KotaKabupaten/GetAll", {
        headers: { Authorization: "Bearer " + sessionStorage.token },
        params: {
          provinsiId: event.target.value,
        },
      })
      .then(({ data }) => {
        if (data.status.code === 200 && data.obj.length > 0) {
          setListCity(data.obj);
        }
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendapatkan kota/kabupaten. Silahkan coba beberapa saat lagi."
            );
      });
    setData(() => ({ city: "", province: event.target.value }));
  };

  function handleCityChange(event) {
    setData((data) => ({ ...data, city: event.target.value }));
  }

  const createProject = (projectName, province, city, headers) => {
    axios
      .post(
        config.url.API_URL + "/Project/Create",
        {
          projectName,
          status: 0,
          isPrivate: 1,
          kotaKabupatenId: city,
          ownerId: sessionStorage.userId,
        },
        { headers }
      )
      .then((data) => {
        setIsProcessing(false);
        localStorage.setItem(
          "state",
          JSON.stringify({
            id: data.data?.obj.id,
            projectName,
            status: 0,
            isPrivate: 1,
            kotaKabupatenId: city,
            ownerId: sessionStorage.userId,
          })
        );
        goManajemenDataPhase2(data.data?.obj.id);
      })
      .catch((error) => {
        console.error(error)
        setIsProcessing(false);
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendaftarkan proyek. Silahkan coba beberapa saat lagi."
            );
      });
  };

  const updateProject = (projectName, province, city, headers) => {
    axios
      .put(
        config.url.API_URL + "/Project/Update",
        {
          id: state ? state?.id : JSON.parse(localStorage.state)?.id,
          projectName,
          status: state
            ? state?.status
            : JSON.parse(localStorage.state)?.status,
          isPrivate: state
            ? state?.isPrivate
            : JSON.parse(localStorage.state)?.isPrivate,
          kotaKabupatenId: city,
          ownerId: state
            ? state?.owner
            : localStorage.state?.userId,
        },
        { headers }
      )
      .then((data) => {
        setIsProcessing(false);
        localStorage.setItem(
          "state",
          JSON.stringify({
            id: state ? state?.id : JSON.parse(localStorage.state)?.id,
            projectName,
            status: state
              ? state?.status
              : JSON.parse(localStorage.state)?.status,
            isPrivate: state
              ? state?.isPrivate
              : JSON.parse(localStorage.state)?.isPrivate,
            kotaKabupatenId: city,
            ownerId: state
              ? state?.owner
              : JSON.parse(localStorage.state)?.ownerId,
          })
        );
        goManajemenDataPhase2(state ? state?.id : JSON.parse(localStorage.state)?.id);
      })
      .catch((error) => {
        setIsProcessing(false);
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendaftarkan proyek. Silahkan coba beberapa saat lagi."
            );
      });
  };

  const provinces = listProvince.map((province) => (
    <option key={province.id} value={province.id}>
      {province.name}
    </option>
  ));

  const cities = listCity.map((city) => (
    <option key={city.id} value={city.id}>
      {city.name}
    </option>
  ));
  /* const provinceData = [
    {
      name: "DKI Jakarta",
      city: [
        "Jakarta Utara",
        "Jakarta Barat",
        "Jakarta Pusat",
        "Jakarta Timur",
        "Jakarta Selatan",
      ],
    },
    {
      name: "Banten",
      city: ["Kota Tangerang", "Kabupaten Tangerang", "Kota Tangerang Selatan"],
    },
    {
      name: "Jawa barat",
      city: ["Kota Depok", "Kota Bogor", "Kabupaten Bogor", "Kota Bandung"],
    },
  ];


  const cities = provinceData
    .find((item) => item.name === province)
    ?.city.map((cities) => (
      <option key={cities} value={cities}>
        {cities}
      </option>
    )); */

  function goSimulasi() {
    localStorage.removeItem("state");
    history.push("/datamanagement");
  }

  function goManajemenDataPhase2(id) {
    history.push("/datamanagementinput/kebutuhandata", {
      id,
    });
  }

  /* function handleProvinceChange(event) {
    setData((data) => ({ city: "", province: event.target.value }));
  }

  function handleCityChange(event) {
    setData((data) => ({ ...data, city: event.target.value }));
  } */

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
                  <h1>Proyek Saya</h1>
                  <p className="text-muted">
                    Silahkan lengkapi borang di bawah ini
                  </p>
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
                  {/* register your input into the hook by invoking the "register" function */}
                  <div className="form-group">
                    <label htmlFor="projectName">Nama Proyek</label>
                    <input
                      className={`form-control p-input ${
                        errors.projectName ? "is-invalid" : ""
                      }`}
                      id="projectName"
                      name="projectName"
                      defaultValue=""
                      placeholder="Nama Proyek"
                      ref={register({
                        required: "Nama proyek harus diisi",
                      })}
                    />
                    {errors.projectName && (
                      <small id="nameHelp" className="form-text text-danger">
                        {errors.projectName.message}
                      </small>
                    )}
                  </div>

                  {/* include validation with required or other standard HTML validation rules */}
                  <div className="form-group">
                    <label htmlFor="province">Provinsi</label>
                    <Controller
                      name="province"
                      control={control}
                      defaultValue={null}
                      render={(props) => (
                        <select
                        className={`form-control p-input ${
                          errors.province ? "is-invalid" : ""
                        }`}
                          id="province"
                          name="province"
                          value={province}
                          onChange={handleProvinceChange}
                          ref={register({ required: "Provinsi harus diisi"})}
                        >
                          {/* <option value="null">
                            ---
                          </option>
                          <option value="1">
                            aaa
                          </option> */}
                          {provinces}
                        </select>
                      )}
                      rules={{ required: "Provinsi harus diisi" }}
                    />
                    {errors.province && (
                      <small id="nameHelp" className="form-text text-danger">
                        {errors.province.message}
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="city">Kota</label>
                    <Controller
                      name="city"
                      control={control}
                      defaultValue={null}
                      render={(props) => (
                        <select
                        className={`form-control p-input ${
                          errors.city ? "is-invalid" : ""
                        }`}
                          id="city"
                          name="city"
                          value={city}
                          onChange={handleCityChange}
                          ref={register({ required: "Kota/kabupaten harus diisi"})}
                        >
                          {cities}
                        </select>
                      )}
                      rules={{ required: "Kota harus diisi" }}
                    />
                    {errors.city && (
                      <small id="nameHelp" className="form-text text-danger">
                        {errors.city.message}
                      </small>
                    )}
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
                      disabled={isProcessing}
                    >
                      {isProcessing && (
                        <span
                          className="spinner-border spinner-border-sm mr-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                      )}
                      Selanjutnya
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

export default ManajemenDataInput;
