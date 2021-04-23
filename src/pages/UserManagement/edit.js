import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";

import { config } from "../../Constants";

import { Header, Menu, Footer } from "../../components";

function UserManagementEdit() {
    let history = useHistory();
    const { state } = useLocation()
    const { register,
        handleSubmit,
        formState: { errors },
        control
    } = useForm({
        defaultValues: {
            email: state?.email,
            username: state?.userName,
            rolename: state ? state["roles[0].name"] : null
        }
    });

    const [listRole, setListRole] = useState([])
    const [errMessage, setErrMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
        if (listRole.length === 0) {
            axios.get(config.url.API_URL + '/Role/List', {
                headers: { Authorization: "Bearer " + sessionStorage.token },
                params: {
                    "input.pageSize": 100,
                    "input.orderProperty": "name"
                }
            })
                .then(({ data }) => {
                    if(data.status.code === 200 && data.obj.length > 0) {
                        setListRole(data.obj)
                    }
                })
                .catch(error => {
                    error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendapatkan peran. Silahkan coba beberapa saat lagi.")
                })
        }
    }, [history, listRole])

    useEffect(()=> {
        if(!state){
            history.goBack()
        }
    })

    const onSubmit = ({ username, rolename, email }) => {
        setErrMessage(null);
        setIsProcessing(true)

        const headers = {
            "Authorization": "Bearer " + sessionStorage.token,
            "Content-Type": "application/json",
        };

        axios.put(
            config.url.API_URL + "/User/Update",
            {
                "id": state.id,
                "roleNames": [
                    rolename
                ],
                "email": email,
                "userName": username,
            },
            { headers }
        )
            .then(() => {
                setIsProcessing(false)
                history.push("/usermanagement")
            })
            .catch(error => {
                setIsProcessing(false)
                error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengubah pengguna. Silahkan coba beberapa saat lagi.")
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
                                    <h1>Ubah Pengguna</h1>
                                    <p className="text-muted">Silahkan lengkapi borang di bawah ini</p>
                                </div>
                                {errMessage && (
                                    <div className="alert alert-warning" role="alert">
                                        {errMessage}
                                    </div>
                                )}
                                <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group">
                                        <label htmlFor="email">Alamat Email</label>
                                        <input
                                            type="email"
                                            className="form-control p-input"
                                            id="email"
                                            aria-describedby="emailHelp"
                                            placeholder="Alamat email"
                                            name="email"
                                            autoFocus
                                            ref={
                                                register({
                                                    required: "Alamat email harus diisi",
                                                    pattern: {
                                                        value: /^\S+@\S+$/i,
                                                        message: "Format alamat email salah"
                                                    }
                                                }
                                                )} />
                                        {errors.email && (
                                            <small id="emailHelp" className="form-text text-danger">
                                                {errors.email.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            className="form-control p-input"
                                            id="username"
                                            aria-describedby="usernameHelp"
                                            placeholder="Username"
                                            name="username"
                                            ref={register({ required: "Username harus diisi", pattern: { value: /^[\w]*$/, message: "Hanya alfabet dan nomor yang diizinkan" } })}
                                        />
                                        {errors.username && (
                                            <small id="usernameHelp" className="form-text text-danger">
                                                {errors.username.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="exampleInputRole">Peranan</label>
                                        <Controller
                                            render={() =>
                                                <select name="rolename" className="form-control" id="exampleInputRole" ref={register({ required: "Peran harus diisi" })}>
                                                    {listRole.map(role => (
                                                        <option key={role.id} value={role.name} >{role.name}</option>
                                                    ))}
                                                </select>}
                                            control={control}
                                            name="rolename"
                                            rules={{ required: "Peran harus diisi" }}
                                        />
                                        {errors.rolename && (
                                            <small id="rolenameHelp" className="form-text text-danger">
                                                {errors.rolename.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing}>
                                            {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                            Ubah Pengguna
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

export default UserManagementEdit;
