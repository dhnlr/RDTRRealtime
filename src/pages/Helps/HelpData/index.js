import React, { useEffect } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";

import { Header, Menu, Footer } from "../../../components";
import headerImage from "./header.svg"
import "./style.css"

function HelpData() {
    let history = useHistory();

    useEffect(() => {
        if (!sessionStorage.token) {
            history.push("/login");
        }
    }, [history])

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="helpmanagement" />
                <div className="main-panel">

                    <div className="card rounded-0 py-3 pl-2" style={{ background: "#63af9b" }}>
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

                    <div className="content-wrapper py-5">
                    <div className="row">


                        <div className="col-md-8 grid-margin stretch-card my-4">
                            <div className="card">
                                <div className="card-body">
                                    <p className="card-title">Topik Bantuan</p>
                                    <div className="row my-4">
                                        <div className="col-6">
                                            <div className="media p-2 help-menu">
                                                <div className="mr-3" ><i className="ti-id-badge"></i></div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">Akun Saya</h5>
                                                    <p>Cara mengelola akun Anda dan fiturnya.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6 my-2">
                                            <div className="media p-2 help-menu">
                                                <div className="mr-3" ><i className="ti-star"></i></div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">Tentang Aplikasi</h5>
                                                    <p>Lebih lanjut tentang aplikasi RDTR.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="media p-2 help-menu">
                                                <div className="mr-3" ><i className="ti-eye"></i></div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">Copyright & Legal</h5>
                                                    <p>Informasi bagaimana kami menangani privasi dan data Anda.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="media p-2 help-menu" onClick={()=>history.push("/help/faq")} style={{cursor: "pointer"}}>
                                                <div className="mr-3" ><i className="ti-flag-alt-2"></i></div>
                                                <div className="media-body">
                                                    <h5 className="mt-0">FAQ</h5>
                                                    <p>Segala pertanyaan dan jawaban berkaitan dengan RDTR.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 grid-margin my-4">
                        <Link className="btn btn-primary btn-block mb-2" to="/helpmanagement">Manajemen Bantuan</Link>
                            <div className="card p-3" style={{ background: "#daeaae"}}>
                                <div className="card-body">
                                    <p className="card-title">Butuh Bantuan?</p>
                                    <div className="row">
                                        <div className="col-12">
                                            <p>Tidak dapat menemukan jawaban yang Anda cari? Jangan khawatir kami di sini untuk membantu.</p>
                                            <Link className="btn btn-success btn-block" to="/report">Hubungi Kami</Link>
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

const ImageDiv = styled.img`
  position: absolute;
  bottom: -130px;
  right: -35px;
  width: 80%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`

export default HelpData;
