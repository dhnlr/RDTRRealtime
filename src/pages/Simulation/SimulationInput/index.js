import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";

import { config } from "../../../Constants";

import { Header, Menu, Footer, ProgressCircle } from "../../../components";
import Image from "../../DataManagementInput/Group 3735.svg";

function SimulationInput() {
  let history = useHistory();
  let { state } = useLocation();

  const { register, errors, control, handleSubmit } = useForm({
    defaultValues: {
      name: state ? state?.name : "",
    },
  });

  const [listProvince, setListProvince] = useState([]);
  const [listCity, setListCity] = useState([]);
  const [listProject, setListProject] = useState([]);
  const [{ province, city, project }, setData] = useState({
    province: state ? String(state?.project?.kotaKabupaten?.provinsi?.id) : "",
    city: state ? String(state?.project?.kotaKabupaten?.id) : "",
    project: state ? state?.projectId : "",
  });
  const [errMessage, setErrMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmit = ({ name, province, city, project }) => {
    setErrMessage(null);
    setIsProcessing(true);

    const headers = {
      Authorization: "Bearer " + sessionStorage.token,
      "Content-Type": "application/json",
    };
    !state?.id
      ? createProject(name, province, city, project, headers)
      : updateProject(name, province, city, project, headers);
  };

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

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
            // if (city === "")
            //   setData((state) => ({ ...state, city: String(data.obj[0].id) }));
          }
        })
        .catch((error) => {
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendapatkan kota/kabupaten. Silahkan coba beberapa saat lagi."
              );
        });
    }
  }, [listProvince, province]);

  useEffect(() => {
    console.log("aa", city, province, listCity.length, listProvince.length);
    if (listCity.length !== 0 && city!== "" && listProvince.length !== 0 && province !== "") {
      axios
        .get(config.url.API_URL + "/Project/GetAll", {
          headers: { Authorization: "Bearer " + sessionStorage.token },
          params: {
            KotaKabupatenId: city,
          },
        })
        .then(({ data }) => {
          if (data.status.code === 200) {
            setListProject(data.obj);
          }
        })
        .catch((error) => {
          error.response?.data?.status?.message
            ? setErrMessage(error.response?.data?.status?.message)
            : setErrMessage(
                "Gagal mendapatkan proyek. Silahkan coba beberapa saat lagi."
              );
        });
    }
  }, [listCity]);

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
          // if (city === "")
          //   setData((state) => ({ ...state, city: String(data.obj[0].id) }));
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
    axios
      .get(config.url.API_URL + "/Project/GetAll", {
        headers: { Authorization: "Bearer " + sessionStorage.token },
        params: {
          KotaKabupatenId: event.target.value,
        },
      })
      .then(({ data }) => {
        if (data.status.code === 200) {
          setListProject(data.obj);
        }
      })
      .catch((error) => {
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendapatkan proyek. Silahkan coba beberapa saat lagi."
            );
      });
    setData((data) => ({ ...data, city: event.target.value }));
  }

  function handleProjectChange(event) {
    setData((data) => ({ ...data, project: event.target.value }));
  }

  const createProject = (name, province, city, project, headers) => {
    axios
      .post(
        config.url.API_URL + "/Simulasi/Create",
        {
          name,
          ownerId: sessionStorage.userId,
          projectId: project,
        },
        { headers }
      )
      .then((data) => {
        setIsProcessing(false);
        goManajemenDataPhase2();
      })
      .catch((error) => {
        setIsProcessing(false);
        error.response?.data?.status?.message
          ? setErrMessage(error.response?.data?.status?.message)
          : setErrMessage(
              "Gagal mendaftarkan simulasi. Silahkan coba beberapa saat lagi."
            );
      });
  };

  const updateProject = (name, province, city, project, headers) => {
    axios
      .put(
        config.url.API_URL + "/Simulasi/Update",
        {
          id: state?.id,
          name,
          projectId: project,
          ownerId: state?.ownerId,
        },
        { headers }
      )
      .then((data) => {
        setIsProcessing(false);
        goManajemenDataPhase2(
          state ? state?.id : JSON.parse(localStorage.state)?.id
        );
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
    <option
      key={province.id}
      value={province.id}
      selected={province.id === state?.project?.kotaKabupaten?.provinsi?.id}
    >
      {province.name}
    </option>
  ));

  const cities = listCity.map((city) => (
    <option
      key={city.id}
      value={city.id}
      selected={city.id === state?.project?.kotaKabupaten?.id}
    >
      {city.name}
    </option>
  ));

  const projects = listProject.map((project) => (
    <option
      key={project.id}
      value={project.id}
      selected={project.id === state?.projectId}
    >
      {project.projectName}
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
    history.push("/Simulation");
  }

  function goManajemenDataPhase2(id) {
    history.push("/simulation");
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
        <Menu active="simulasi" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-12">
                <div className="mb-2">
                  {/* <div className="float-right">
                    <ProgressCircle className="text-primary"></ProgressCircle>
                    <ProgressCircle className="text-muted"></ProgressCircle>
                    <ProgressCircle className="text-muted"></ProgressCircle>
                  </div> */}
                  <h1>Simulasi Baru</h1>
                  <p className="text-muted">
                    Silahkan lengkapi borang di bawah ini
                  </p>
                </div>
                {errMessage && (
                  <div className="alert alert-warning" role="alert">
                    {errMessage}
                  </div>
                )}
                <div className="row">
                  <div className="col-5 d-none d-md-block d-lg-block">
                    <img src={Image} alt="input project" width="100%"></img>
                  </div>
                  <div className="col-md-7">
                    <form
                      className="forms-sample"
                      onSubmit={handleSubmit(onSubmit)}
                    >
                      {/* register your input into the hook by invoking the "register" function */}
                      <div className="form-group">
                        <label htmlFor="name">Nama Simulasi</label>
                        <input
                          className={`form-control p-input ${
                            errors.name ? "is-invalid" : ""
                          }`}
                          id="name"
                          name="name"
                          defaultValue=""
                          placeholder="Nama Simulasi"
                          ref={register({
                            required: "Nama simulasi harus diisi",
                          })}
                        />
                        {errors.name && (
                          <small
                            id="nameHelp"
                            className="form-text text-danger"
                          >
                            {errors.name.message}
                          </small>
                        )}
                      </div>

                      {/* include validation with required or other standard HTML validation rules */}
                      <div className="form-group">
                        <label htmlFor="province">Provinsi</label>
                        {/* <Controller
                          name="province"
                          control={control}
                          defaultValue={null}
                          render={(props) => (
                            
                          )}
                          rules={{ required: "Provinsi harus diisi" }}
                        /> */}
                        <select
                          className={`form-control ${
                            errors.province ? "is-invalid" : ""
                          }`}
                          id="province"
                          name="province"
                          // value  ={province}
                          onChange={handleProvinceChange}
                          ref={register({
                            required: "Provinsi harus diisi",
                          })}
                        >
                          <option value="" disabled selected>
                            Pilih provinsi
                          </option>
                          {provinces}
                        </select>
                        {errors.province && (
                          <small
                            id="nameHelp"
                            className="form-text text-danger"
                          >
                            {errors.province.message}
                          </small>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="city">Kota / kabupaten</label>
                        {/* <Controller
                          name="city"
                          control={control}
                          defaultValue={null}
                          render={(props) => (
                            
                          )}
                          rules={{ required: "Kota harus diisi" }}
                        /> */}
                        <select
                          className={`form-control ${
                            errors.city ? "is-invalid" : ""
                          }`}
                          id="city"
                          name="city"
                          // value={city}
                          onChange={handleCityChange}
                          ref={register({
                            required: "Kota/kabupaten harus diisi",
                          })}
                        >
                          <option value="" disabled selected>
                            Pilih kota
                          </option>
                          {cities}
                        </select>
                        {errors.city && (
                          <small
                            id="nameHelp"
                            className="form-text text-danger"
                          >
                            {errors.city.message}
                          </small>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="city">Proyek</label>
                        {/* <Controller
                          name="project"
                          control={control}
                          defaultValue={null}
                          render={(props) => (
                            
                          )}
                          rules={{ required: "Proyek harus diisi" }}
                        /> */}
                        <select
                          className={`form-control ${
                            errors.project ? "is-invalid" : ""
                          }`}
                          id="project"
                          name="project"
                          // value={project}
                          onChange={handleProjectChange}
                          ref={register({
                            required: "Proyek harus diisi",
                          })}
                        >
                          <option value="" disabled selected>
                            {city === "" || listProject.length !== 0 ? "Pilih proyek" : "Tidak ada proyek"}
                          </option>
                          {projects}
                        </select>
                        {errors.project && (
                          <small
                            id="nameHelp"
                            className="form-text text-danger"
                          >
                            {errors.project.message}
                          </small>
                        )}
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
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default SimulationInput;
