import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import axios from "axios"
import Swal from "sweetalert2"

import { Header, Menu, Footer, Table } from "../../../components";
import headerImage from "./header.svg"
import "./style.css"

import { config } from "../../../Constants";

function HelpData() {
    const a = "<strong>coba</strong>"
    let history = useHistory();
    /* function goInputSimulasi() {
        history.push("/helpmanagement/create");
    } */

    const [listHelp, setListHelp] = useState([])
    const [errMessage, setErrMessage] = useState(null);

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
    }, [history])

    useEffect(() => {
        if (listHelp.length === 0) {
            axios.get(config.url.API_URL + '/Bantuan/GetAll', {
                headers: { Authorization: "Bearer " + sessionStorage.token },
            })
                .then(({ data }) => {
                    if(data.status.code === 200 && data.obj.length > 0) {
                        setListHelp(data.obj)
                    }
                })
                .catch(error => {
                    error.response?.data?.status?.message ? setErrMessage(error.response?.data?.status?.message) : setErrMessage("Gagal mendapatkan bantuan. Silahkan coba beberapa saat lagi.")
                })
        }
    }, [listHelp])

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="helpmanagement" />
                <div className="main-panel">

                    <div className="card rounded-0" style={{ background: "#63af9b", /* backgroundImage: "url("+headerImage+")", backgroundRepeat: "no-repeat", backgroundPosition: "right center", backgroundSize: "contain" */ }}>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6 col-sm-12">
                                    <table className="my-5" style={{ height: "100px" }}>
                                        <tbody>
                                            <tr>
                                                <td className="align-middle text-white"><h2 className="">Bantuan</h2>
                                                    <p className=" font-weight-500 mb-2">Berisikan tata cara penggunaan fitur yang disediakan oleh aplikasi Rencana Detail Tata Ruang (RDTR).</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-6 background-icon">
                                    <ImageDiv src={headerImage} alt="header"></ImageDiv>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="content-wrapper my-5">
                        {listHelp.map((help, index) => (

                        <div className="col-md-12 grid-margin stretch-card my-4" key={help.namaKategori}>
                            <div className="card">
                                <div className="card-body">
                                    <p className="card-title">{help.namaKategori}</p>
                                    <div className="row">
                                        <div className="col-12">
                                            <div>

                                                <div className="accordion" id="accordionExample">
                                                    {help.bantuan.map(bantuan => (

                                                    <div className="card" key={bantuan?.id}>
                                                        <div className="card-header" id="headingOne">
                                                            <h2 className="mb-0">
                                                                <button className="btn btn-link btn-block text-left collapsed" type="button" data-toggle="collapse" data-target={"#"+help.namaKategori.replace(/\s\W+/g, '')+bantuan?.id} aria-expanded="true" aria-controls={help.namaKategori.replace(/\s\W+/g, '')+bantuan?.id}>
                                                                    {bantuan?.pertanyaan}
                                                                    <i className="ti-arrow-circle-down float-right"></i>
                                                                </button>
                                                            </h2>
                                                        </div>

                                                        <div id={help.namaKategori.replace(/\s\W+/g, '')+bantuan?.id} className="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                                                <div className="card-body" dangerouslySetInnerHTML={{ __html: bantuan?.jawaban }}/>
                                                        </div>
                                                    </div>
                                                    ))}
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ))}


                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
}

const ImageDiv = styled.img`
  position: absolute;
  bottom: -100px;
  right: -70px;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`

export default HelpData;
