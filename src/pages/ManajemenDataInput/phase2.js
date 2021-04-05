import React from "react";
import { useHistory } from "react-router-dom";

import { Header, Menu, Footer } from "../../components";

function ManajemenDataInputPhase2() {
    let history = useHistory();

    function goSimulasi() {
        history.push("/manajemendatainput")
    }

    function goManajemenData() {
        history.push("/manajemendatainput/uploaddata")
    }

    return (
        <div className="container-scroller">
            <Header />
            <div className="container-fluid page-body-wrapper">
                <Menu active="manajemendata" />
                <div className="main-panel">
                    <div className="content-wrapper">
                        <div className="row">
                            <div className="col-12">
                                <div className="mb-2">
                                    <h1>Kebutuhan Data</h1>
                                    <p className="text-muted">Pilih kebutuhan data di bawah ini</p>
                                </div>
                                <div style={{ flex:"4 1 50%", display: "flex", flexWrap:"wrap"}}>
                                    <div style={{ position: "relative", margin: "25px", cursor: "pointer" }}>
                                        <img src="../images/manajemendata/kemacetan.png" alt="banjir" width="100%"/>
                                        <div className="text-block" style={{position:"absolute", bottom:0, left:0, textAlign:"center", width:"100%", padding:"20px", color: "white"}}>
                                            Modul Kemacetan
                                        </div>
                                    </div>
                                    <div style={{ position: "relative", margin: "25px", cursor: "pointer" }}>
                                        <img src="../images/manajemendata/air.png" alt="banjir" width="100%"/>
                                        <div className="text-block" style={{position:"absolute", bottom:0, left:0, textAlign:"center", width:"100%", padding:"20px", color: "white"}}>
                                            Modul Kebutuhan Air
                                        </div>
                                    </div>
                                    <div style={{ position: "relative", margin: "25px", cursor: "pointer" }}>
                                        <img src="../images/manajemendata/sampah.png" alt="banjir" width="100%"/>
                                        <div className="text-block" style={{position:"absolute", bottom:0, left:0, textAlign:"center", width:"100%", padding:"20px", color: "white"}}>
                                            Modul Persampahan
                                        </div>
                                    </div>
                                    <div style={{ position: "relative", margin: "25px", cursor: "pointer" }}>
                                        <img src="../images/manajemendata/banjir.png" alt="banjir" width="100%"/>
                                        <div className="text-block" style={{position:"absolute", bottom:0, left:0, textAlign:"center", width:"100%", padding:"20px", color: "white"}}>
                                            Modul Banjir
                                        </div>
                                    </div>
                                    <div style={{ position: "relative", margin: "25px", cursor: "pointer" }} onClick={()=>goManajemenData()}>
                                        <img src="../images/manajemendata/kemacetan.png" alt="banjir" width="100%"/>
                                        <div className="text-block" style={{position:"absolute", bottom:0, left:0, textAlign:"center", width:"100%", padding:"20px", color: "white"}}>
                                            Modul Simulasi KDB & KDLB
                                        </div>
                                    </div>
                                </div>
                                <div className="template-demo float-right">
                                        <button className="btn btn-light" type="button" onClick={()=>goSimulasi()}>Kembali</button>
                                        <button className="btn btn-primary" type="button" onClick={() => goManajemenData()}>Lanjutkan ke Simulasi</button>
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

export default ManajemenDataInputPhase2;
