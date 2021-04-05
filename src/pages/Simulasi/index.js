import React from "react";
import { useHistory } from "react-router-dom";

import { Header, Menu, Footer } from "../../components";
import headerImage from "./header.png"
import buildingIcon from "./building.svg"


function Simulasi() {
    let history = useHistory();
    function goInputSimulasi() {
        history.push("/simulasimap")
    }

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="simulasi" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-md-12 stretch-card mb-4">
                                {/* <div className="card data-icon-card-primary">
                                    <div className="card-body">
                                        <div className="row">
                                            <div className="col-8 text-white">
                                                <p className="card-title text-white">Simulasi</p>
                                                <p className="text-white font-weight-500 mb-0">Kini masyarakat dapat melakukan simulasi terencana<br /> tata ruang secara online menjadi lebih mudah</p>
                                            </div>
                                            <div className="col-4 background-icon"></div>
                                        </div>
                                    </div>
                                </div> */}
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    <div style={{ flex: "1" }}>
                                        <img src={headerImage} alt="header" style={{ width: "100%" }}></img>
                                    </div>
                                    <div style={{ flex: "2", display: "flex", flexWrap: "wrap", flexDirection: "column", padding: "0 2.3rem" }}>
                                        <p className="font-weight-bold mb-4 fs-30">Simulasi</p>
                                        <p className="font-weight-500 mb-0" style={{ fontSize: "16px", lineHeight: "1.64" }}>Kini masyarakat dapat melakukan simulasi terencana<br /> tata ruang secara online menjadi lebih mudah. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia tempor dolor, blandit mollis erat scelerisque vel. </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12 stretch-card mt-4 mb-2">
                                <img className="mr-2" src={buildingIcon} alt="building icon" style={{float:"left", width:"3rem"}}/>
                                <p><span className="font-weight-bold ml-1 mr-1 align-middle" style={{fontSize:20}}>Buat simulasi Anda</span>
                                <button className="btn btn-success ml-2" onClick={() => { goInputSimulasi() }}>Buat Sekarang</button></p>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12 grid-margin stretch-card my-4">
                                <div className="card">
                                    <div className="card-body">
                                        <p className="card-title">Perencanaanmu</p>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="table-responsive">
                                                    <div style={{ "display": "flex", alignContent: "center", flexWrap: "wrap", flexDirection: "column", padding: "3% 30%" }}>
                                                        <p>Ups... Kamu belum miliki perencanaan yang tersimpan. Silahkan membuat yang baru terlebih dahulu.</p>
                                                        <button className="btn btn-success" onClick={() => { goInputSimulasi() }}>Buat Simulasi Anda</button>
                                                    </div>
                                                    {/* <div id="example_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer"><div className="row"><div className="col-sm-12 col-md-6"></div><div className="col-sm-12 col-md-6"></div></div><div className="row"><div className="col-sm-12">
                                                        <table id="manajemendata" className="display expandable-table dataTable no-footer" style={{ "width": "100%" }} role="grid">
                                                        <thead>
                                                            <tr role="row">
                                                                <th className="sorting" tabIndex="0" aria-controls="example">Project Name</th>
                                                                <th className="sorting" tabIndex="0" aria-controls="example">Kabupaten/Kota</th>
                                                                <th className="sorting" tabIndex="0" aria-controls="example">Analis</th>
                                                                <th className="sorting" tabIndex="0" aria-controls="example">Status</th>
                                                                <th className="details-control sorting_disabled" tabIndex="0" aria-controls="example">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="odd">
                                                                <td>Kemacetan</td>
                                                                <td>Kab. Bandung</td>
                                                                <td>1 Analis</td>
                                                                <td>Private</td>
                                                                <td>Make Visible to Public</td>
                                                            </tr>
                                                            <tr className="even">
                                                                <td>Perencanaan Kota</td>
                                                                <td>Kota Surabaya</td>
                                                                <td>2 Analis</td>
                                                                <td>Private</td>
                                                                <td>Make Visible to Public</td>
                                                            </tr>
                                                        </tbody>
                                                    </table></div></div><div className="row"><div className="col-sm-12 col-md-5"></div><div className="col-sm-12 col-md-7"></div></div></div> */}
                                                </div>
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

export default Simulasi;
