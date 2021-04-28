import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";

import { config } from "../../Constants";

import { Header, Menu, Footer } from "../../components";

function RoleManagementCreate() {
    let history = useHistory();
    const { register,
        handleSubmit,
        formState: { errors },
        control
    } = useForm();

    const [listRole, setListRole] = useState([])
    const [errMessage, setErrMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
        if (listRole.length === 0) {
            axios.get(config.url.API_URL + '/Role/GetAllPermissions', { headers: { Authorization: "Bearer " + sessionStorage.token }, })
                .then(({ data }) => {
                    if (data.status.code === 200 && data.obj.length > 0) {
                        setListRole(data.obj)
                    }
                })
                .catch(error => {
                    error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendapatkan izin peran. Silahkan coba beberapa saat lagi.")
                })
        }
    }, [history, listRole])

    const onSubmit = ({ name, permissions, isPublisher }) => {
        setErrMessage(null);
        setIsProcessing(true)

        const headers = {
            "Authorization": "Bearer " + sessionStorage.token,
            "Content-Type": "application/json",
        };
        axios.post(
            config.url.API_URL + "/Role/Create",
            {
                "permissions": permissions,
                "name": name,
                "isPublisher": isPublisher
            },
            { headers }
        )
            .then(() => {
                setIsProcessing(false)
                history.push("/rolemanagement")
            })
            .catch(error => {
                setIsProcessing(false)
                error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendaftarkan peran. Silahkan coba beberapa saat lagi.")
            })
    };

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="usermanagement" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-12">
                                <div className="mb-4">
                                    <h1>Tambah Peran</h1>
                                    <p className="text-muted">Silahkan lengkapi borang di bawah ini</p>
                                </div>
                                {errMessage && (
                                    <div className="alert alert-warning" role="alert">
                                        {errMessage}
                                    </div>
                                )}
                                <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group">
                                        <label htmlFor="name">Nama Peran</label>
                                        <input
                                            type="text"
                                            className="form-control p-input"
                                            id="name"
                                            aria-describedby="nameHelp"
                                            placeholder="Nama peran"
                                            name="name"
                                            ref={register({ required: "Nama peran harus diisi", pattern: { value: /^[\w]*$/, message: "Hanya alfabet dan nomor yang diizinkan" } })}
                                        />
                                        {errors.name && (
                                            <small id="nameHelp" className="form-text text-danger">
                                                {errors.name.message}
                                            </small>
                                        )}
                                    </div>
                                    <div id="permissions" className="form-group">
                                        <label htmlFor="permissions">Izin</label>
                                        <Controller
                                            render={() =>
                                            // <select name="rolename" className="form-control" id="exampleInputRole" ref={register({ required: "Peran harus diisi" })}>
                                            //     {listRole.map(role => (
                                            //         <option key={role.id} value={role.name} >{role.name}</option>
                                            //     ))}
                                            //     <option value="Admin">Admin</option>
                                            // </select>
                                            {
                                                return listRole.map(permission => {
                                                    return <div className="form-check" key={permission}>
                                                        <input className="form-check-input" type="checkbox" name="permissions" id={permission} value={permission} ref={register({ required: "Izin harus diisi" })} style={{ marginLeft: 0 }} />
                                                        <label className="form-check-label" htmlFor={permission}>
                                                            {permission}
                                                        </label>
                                                    </div>
                                                })
                                            }

                                            }
                                            control={control}
                                            name="permissions"
                                            rules={{ required: "Izin harus diisi" }}
                                            defaultValue=""
                                        />
                                        {errors.permissions && (
                                            <small id="permissionsHelp" className="form-text text-danger">
                                                {errors.permissions.message}
                                            </small>
                                        )}
                                    </div>
                                    <div id="isPublishers" className="form-group">
                                        <label htmlFor="isPublishers">Publisher</label>
                                        <Controller
                                            render={() =>
                                            (<><div className="form-check">
                                                <input className="form-check-input" type="radio" name="isPublisher" id="isPublisherTrue" value="true" ref={register({ required: "Status publisher harus diisi" })} style={{ marginLeft: 0 }} />
                                                <label className="form-check-label" htmlFor="isPublisherTrue">
                                                    Ya
  </label>
                                            </div>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="isPublisher" id="isPublisherFalse" value="false" ref={register({ required: "Status publisher harus diisi" })} style={{ marginLeft: 0 }} />
                                                    <label className="form-check-label" htmlFor="isPublisherFalse">
                                                        Tidak
  </label>
                                                </div>
                                            </>)

                                            }
                                            control={control}
                                            name="isPublisher"
                                            rules={{ required: "Status publisher harus diisi" }}
                                            defaultValue=""
                                        />
                                        {errors.isPublisher && (
                                            <small id="isPublisherHelp" className="form-text text-danger">
                                                {errors.isPublisher.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing}>
                                            {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                            Tambah Peran
                                        </button>
                                    </div>
                                </form>
                                <button className="btn btn-light btn-block mt-2" onClick={() => history.goBack()}>
                                    Kembali
                                </button>
                            </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default RoleManagementCreate;
