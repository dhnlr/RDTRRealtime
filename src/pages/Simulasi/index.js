import React from "react";
import { Header, Menu, Footer, Img } from "../../components";
import { useHistory } from "react-router-dom";

function Simulasi() {
    let history = useHistory();
    function goManajemenData() {
        history.push("/simulasimanajemendata")
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
                                <div className="card data-icon-card-primary">
                                    <div className="card-body">
                                        {/* <img src="images/dashboard/info.png" alt="info" /> */}
                                        <div className="row">
                                            <div className="col-8 text-white">
                                                <p className="card-title text-white">Manajemen Data</p>
                                                <p className="text-white font-weight-500 mb-0">Kini masyarakat dapat melakukan simulasi terencana<br /> tata ruang secara online menjadi lebih mudah</p>
                                            </div>
                                            <div className="col-4 background-icon"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row my-4">
                            <div className="col-md-1"><Img src="images/file-icons/64/attention.png"></Img></div>
                            <div className="col-md-8">
                                <h3>Buat Perencanaan Anda</h3>
                                <p>Impor segala file pendukung kedalam modul perencanaan</p>
                            </div>
                            <div className="col-md-3">
                                <button className="btn btn-primary btn-block" type="button" onClick={() => goManajemenData()}>Buat Sekarang</button>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-12 grid-margin stretch-card my-4">
                                <div className="card">
                                    <div className="card-body">
                                        <p className="card-title">Advanced Table</p>
                                        <div className="row">
                                            <div className="col-12">
                                                <div className="table-responsive">
                                                    <div id="example_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer"><div className="row"><div className="col-sm-12 col-md-6"></div><div className="col-sm-12 col-md-6"></div></div><div className="row"><div className="col-sm-12"><table id="example" className="display expandable-table dataTable no-footer" style={{ "width": "100%" }} role="grid">
                                                        <thead>
                                                            <tr role="row">
                                                                <th>Project Name</th>
                                                                <th>Kabupaten/Kota</th>
                                                                <th>Analis</th>
                                                                <th>Status</th>
                                                                <th>Actions</th>
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
                                                        </tbody>
                                                    </table></div></div><div className="row"><div className="col-sm-12 col-md-5"></div><div className="col-sm-12 col-md-7"></div></div></div>
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
