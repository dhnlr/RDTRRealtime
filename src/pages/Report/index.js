import React, { useEffect, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios"
import Swal from "sweetalert2"

import { Header, Menu, Footer } from "../../components";
import image from "./OBJECTS.svg"

import { config } from "../../Constants";

function Report() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch
    } = useForm();
    let history = useHistory();

    const [isProcessing, setIsProcessing] = useState(false)

    const password = useRef({});
    password.current = watch("password", "");

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
    }, [history])

    const onSubmit = ({ subject, name, email, agency, body }, e) => {
        setIsProcessing(true)

        axios.post(config.url.API_URL + "/Report", {
            subject,
            name,
            email,
            agency,
            body
        }, {
            headers: { Authorization: "Bearer " + sessionStorage.token },
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
                            e.target.reset()
                            setIsProcessing(false)
                        }
                    });
                } else {
                    Swal.fire("Maaf", response.data.description, "error");
                    setIsProcessing(false)
                }
            })
            .catch(error => {
                Swal.fire("Maaf", error.response?.data?.status?.message ? error.response?.data?.status?.message : 'Gagal mengirim laporan. Silahkan coba beberapa saat lagi', "error");
                setIsProcessing(false)
            })
    }

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="report" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 stretch-card mt-4 mb-2">
                                {/* <img className="mr-2" src={buildingIcon} alt="building icon" style={{ float: "left", width: "3rem" }} /> */}
                                {/* <p>
                                    <span className="font-weight-bold ml-1 mr-1 align-middle" style={{ fontSize: 20 }}>
                                        Laporan
                                    </span>
                                </p> */}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-6  my-2 transparent">
                                {/* <div className="row">
                                    <div className="col-12"> */}
                                        <h2 className="mb-4">
                                            <span className="font-weight-bold mr-1 align-middle" style={{ fontSize: 20 }}>
                                                Laporan
                                    </span>
                                        </h2>
                                        {/* <br/> */}
                                        <p><strong>Silahkan hubungi kami untuk mengirimkan saran atau mendapatkan bantuan terkait sistem.</strong>
                                            <br /><br />Umpan balik Anda sangat penting bagi kami. Jika Anda ingin mengirimkan proyek hebat yang baru saja Anda selesaikan atau proyek yang akan datang, bagikan kisah hebat Anda dengan pengguna lainnya, laporkan kesalahan, atau beri saran dan masukkan.
                                    <br /><br />
                                            <img src={image} alt="Hubungi kami" style={{width: "100%"}}/>
                                        </p>
                                    {/* </div>
                                </div> */}
                            </div>


                            <div className="col-md-6 grid-margin stretch-card my-2">
                                <div className="card">
                                    <div className="card-body">
                                        {/* <p className="card-title">Kata Sandi</p> */}
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="table-responsive">
                                                    <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                                                        <div className="form-group">
                                                            <label htmlFor="subject">Subjek</label>
                                                            <input
                                                                type="text"
                                                                className="form-control p-input"
                                                                id="subject"
                                                                placeholder="Subjek"
                                                                name="subject"
                                                                ref={register({
                                                                    required: "Subjek harus diisi",
                                                                })}
                                                            />
                                                            {errors.subject && (
                                                                <small id="subjectHelp" className="form-text text-danger">
                                                                    {errors.subject.message}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="name">Nama</label>
                                                            <input
                                                                type="text"
                                                                className="form-control p-input"
                                                                id="name"
                                                                placeholder="Nama"
                                                                name="name"
                                                                ref={register({
                                                                    required: "Nama harus diisi",
                                                                })}
                                                            />
                                                            {errors.name && (
                                                                <small id="nameHelp" className="form-text text-danger">
                                                                    {errors.name.message}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="email">Alamat Email</label>
                                                            <input
                                                                type="email"
                                                                className="form-control p-input"
                                                                id="email"
                                                                aria-describedby="emailHelp"
                                                                placeholder="Alamat email"
                                                                name="email"
                                                                autoComplete="email"
                                                                autoFocus
                                                                ref={register({
                                                                    required: "Alamat email harus diisi", pattern: { value: /^\S+@\S+$/i, message: "Format alamat email salah" }
                                                                })}
                                                            />
                                                            {errors.email && (
                                                                <small id="emailHelp" className="form-text text-danger">
                                                                    {errors.email.message}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="agency">Instansi</label>
                                                            <input
                                                                type="text"
                                                                className="form-control p-input"
                                                                id="agency"
                                                                placeholder="Instansi"
                                                                name="agency"
                                                                ref={register({
                                                                    required: "Instansi harus diisi",
                                                                })}
                                                            />
                                                            {errors.agency && (
                                                                <small id="agencyHelp" className="form-text text-danger">
                                                                    {errors.agency.message}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <label htmlFor="body">Pesan</label>
                                                            <textarea
                                                                type="text"
                                                                className="form-control p-input"
                                                                id="body"
                                                                placeholder="Pesan"
                                                                name="body"
                                                                rows="5"
                                                                ref={register({
                                                                    required: "Pesan harus diisi",
                                                                })}
                                                            />
                                                            {errors.body && (
                                                                <small id="bodyHelp" className="form-text text-danger">
                                                                    {errors.body.message}
                                                                </small>
                                                            )}
                                                        </div>
                                                        <div className="form-group">
                                                            <button className="btn btn-success" type="submit" disabled={isProcessing}>
                                                                {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                                                Kirim Laporan
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        <div className="row">

                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

export default Report;
