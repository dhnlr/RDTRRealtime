import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import axios from "../../axiosConfig";

import { config } from "../../Constants";

import { Header, Menu, Footer } from "../../components";

function UserManagementCreate() {
    let history = useHistory();
    const { register,
        handleSubmit,
        formState: { errors },
        control,
        watch
    } = useForm({
        defaultValues:{
            rolename: "Masyarakat"
        }
    });

    const [listRole, setListRole] = useState([])
    const [errMessage, setErrMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false)

    const password = useRef({});
    password.current = watch("password", "");

    useEffect(() => {
        if (listRole.length === 0) {
            axios.get(config.url.API_URL + '/Role/List', {
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

    const onSubmit = ({ username, rolename, email, password }) => {
        setErrMessage(null);
        setIsProcessing(true)

        axios.post(
            config.url.API_URL + "/User/Create",
            {
                "roleNames": [
                    rolename
                ],
                "email": email,
                "userName": username,
                "password": password
            },
        )
            .then(() => {
                setIsProcessing(false)
                history.push("/usermanagement")
            })
            .catch(error => {
                setIsProcessing(false)
                error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendaftarkan pengguna. Silahkan coba beberapa saat lagi.")
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
                                    <h1>Buat Pengguna</h1>
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
                                            className={`form-control p-input ${errors.email ? 'is-invalid' : ''}`}
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
                                            className={`form-control p-input ${errors.username ? 'is-invalid' : ''}`}
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
                                                <select name="rolename" className={`form-control ${errors.rolename ? 'is-invalid' : ''}`} id="exampleInputRole" ref={register({ required: "Peran harus diisi" })}>
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
                                        <label htmlFor="password">Kata Sandi</label>
                                        <input
                                            type="password"
                                            className={`form-control p-input ${errors.password ? 'is-invalid' : ''}`}
                                            id="password"
                                            placeholder="Kata sandi"
                                            name="password"
                                            ref={register({
                                                required: "Kata sandi harus diisi",
                                                minLength: {
                                                    value: 6,
                                                    message: "Kata sandi sekurangnya memiliki 6 karaketer"
                                                }
                                            })}
                                        />
                                        {!errors.password && <small className="form-text text-muted">Kata sandi sekurangnya memiliki 6 karakter</small>}
                                        {errors.password && (
                                            <small id="passwordHelp" className="form-text text-danger">
                                                {errors.password.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="konfirmasiPassword">Konfirmasi Kata Sandi</label>
                                        <input
                                            type="password"
                                            className={`form-control p-input ${errors.konfirmasiPassword ? 'is-invalid' : ''}`}
                                            id="konfirmasiPassword"
                                            placeholder="Konfirmasi kata sandi"
                                            name="konfirmasiPassword"
                                            ref={register({
                                                validate: value =>
                                                    value === password.current || "Kata sandi tidak sama"
                                            })}
                                        />
                                        {errors.konfirmasiPassword && (
                                            <small id="konfirmasiPasswordHelp" className="form-text text-danger">
                                                {errors.konfirmasiPassword.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing}>
                                            {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                            Buat Pengguna
                                        </button>
                                    </div>
                                </form>
                                <button className="btn btn-light btn-block mt-1" onClick={() => history.goBack()}>
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

export default UserManagementCreate;
