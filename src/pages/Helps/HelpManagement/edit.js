import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import axios from "../../../axiosConfig";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor  from "ckeditor5-custom-build";

import { config } from "../../../Constants";

import { Header, Menu, Footer } from "../../../components";

function HelpManagementEdit() {
    let history = useHistory();
    const { state } = useLocation()
    const { register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
    } = useForm({
        defaultValues: {
            question: state?.pertanyaan,
            answer: state?.jawaban,
            kategori: state?.namaKategori
        }
    });

    const [listHelp, setListHelp] = useState([])
    const [errMessage, setErrMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        register('answer')
    })

    useEffect(() => {
        if (listHelp.length === 0) {
            axios.get(config.url.API_URL + '/Bantuan/GetAllKategori')
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

    useEffect(()=> {
        if(!state){
            history.goBack()
        }
    })

    const onSubmit = ({ question, answer, kategori }) => {
        setErrMessage(null);
        setIsProcessing(true)

        axios.put(
            config.url.API_URL + "/Bantuan/Update",
            {
                "id": state.id,
                "pertanyaan": question,
                "jawaban": answer,
                "kategoriId": getKategoriId(kategori)
            },
        )
            .then(() => {
                setIsProcessing(false)
                history.push("/helpmanagement")
            })
            .catch(error => {
                setIsProcessing(false)
                error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mengubah peran. Silahkan coba beberapa saat lagi.")
            })
    };

    const getKategoriId = (name) => {
        const result = listHelp.filter(help => help.namaKategori === name)
        return result[0].id
    }

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
                                    <h1>Ubah Bantuan</h1>
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
                                                    data={state?.jawaban}
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
                                        <select name="kategori" className={`form-control p-input ${errors.kategori ? 'is-invalid' : ''}`} id="kategoriId" ref={register({ required: "Kategori harus diisi" })}>
                                                {listHelp.map(help => (
                                                    <option key={help.id} value={help.namaKategori} selected={help.namaKategori === state?.namaKategori}>{help.namaKategori}</option>
                                                ))}
                                            </select>
                                        {errors.kategori && (
                                            <small id="kategoriIdHelp" className="form-text text-danger">
                                                {errors.kategori.message}
                                            </small>
                                        )}
                                    </div>
                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary btn-block" disabled={isProcessing}>
                                            {isProcessing && <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>}
                                            Ubah Bantuan
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

export default HelpManagementEdit;
