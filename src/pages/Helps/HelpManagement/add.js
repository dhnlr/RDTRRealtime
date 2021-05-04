import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import axios from "axios";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor  from "ckeditor5-custom-build";

import { config } from "../../../Constants";

import { Header, Menu, Footer } from "../../../components";

function HelpManagementCreate() {
    let history = useHistory();
    const { register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        getValues
    } = useForm();

    const [listHelp, setListHelp] = useState([])
    const [errMessage, setErrMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        register('answer')
    })

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
        if (listHelp.length === 0) {
            axios.get(config.url.API_URL + '/Bantuan/GetAllKategori', { headers: { Authorization: "Bearer " + sessionStorage.token }, })
                .then(({ data }) => {
                    if (data.status.code === 200 && data.obj.length > 0) {
                        setListHelp(data.obj)
                    }
                })
                .catch(error => {
                    error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendapatkan izin peran. Silahkan coba beberapa saat lagi.")
                })
        }
    }, [history, listHelp])

    const onSubmit = ({ question, answer, kategoriId }) => {
        setErrMessage(null);
        setIsProcessing(true)

        const headers = {
            "Authorization": "Bearer " + sessionStorage.token,
            "Content-Type": "application/json",
        };
        axios.post(
            config.url.API_URL + "/Bantuan/Create",
            {
                "pertanyaan": question,
                "jawaban": getValues().answer,
                "kategoriId": kategoriId
            },
            { headers }
        )
            .then(({ data }) => {
                setIsProcessing(false)
                if (data.code === 200) {
                    history.push("/helpmanagement")
                } else {
                    setErrMessage(data?.description)
                }
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
                <Menu active="helpmanagement" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-12">
                                <div className="mb-4">
                                    <h1>Tambah Bantuan</h1>
                                    <p className="text-muted">Silahkan lengkapi borang di bawah ini</p>
                                </div>
                                {errMessage && (
                                    <div className="alert alert-warning" role="alert">
                                        {errMessage}
                                    </div>
                                )}
                                <form className="forms-sample" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="form-group">
                                        <label htmlFor="question">Pertanyaan</label>
                                        <input
                                            type="text"
                                            className={`form-control p-input ${errors.question ? 'is-invalid' : ''}`}
                                            id="question"
                                            aria-describedby="questionHelp"
                                            placeholder="Pertanyaan"
                                            name="question"
                                            ref={register({ required: "Pertanyaan harus diisi" })}
                                        />
                                        {errors.question && (
                                            <small id="questionHelp" className="form-text text-danger">
                                                {errors.question.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="answer">Jawaban</label>
                                        <Controller
                                            render={() =>
                                                <CKEditor
                                                    editor={Editor}
                                                    config={ config.editorConfiguration }
                                                    onChange={(value, editor) => setValue('answer', editor.getData())}
                                                />
                                            }
                                            control={control}
                                            name="answer"
                                            rules={{ required: "Jawaban harus diisi" }}
                                            defaultValue=""
                                        />
                                        {/* <textarea
                                            type="text"
                                            className={`form-control p-input ${errors.answer ? 'is-invalid' : ''}`}
                                            id="answer"
                                            placeholder="Jawaban"
                                            name="answer"
                                            rows="5"
                                            aria-describedby="answerHelp"
                                            ref={register({
                                                required: "Jawaban harus diisi",
                                            })}
                                        /> */}
                                        {errors.answer && (
                                            <small id="answerHelp" className="form-text text-danger">
                                                {errors.answer.message}
                                            </small>
                                        )}
                                    </div>
                                    <div id="kategoriId" className="form-group">
                                        <label htmlFor="kategoriId">Kategori</label>
                                        <Controller
                                            render={() =>
                                                <select name="kategoriId" className={`form-control ${errors.kategoriId ? 'is-invalid' : ''}`} id="kategoriId" ref={register({ required: "Kategori harus diisi" })}>
                                                    {listHelp.map(help => (
                                                        <option key={help.id} value={help.id} >{help.namaKategori}</option>
                                                    ))}
                                                </select>
                                            }
                                            control={control}
                                            name="kategoriId"
                                            rules={{ required: "Kategori harus diisi" }}
                                            defaultValue=""
                                        />
                                        {errors.kategoriId && (
                                            <small id="kategoriIdHelp" className="form-text text-danger">
                                                {errors.kategoriId.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing}>
                                            {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                            Tambah Bantuan
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

export default HelpManagementCreate;
