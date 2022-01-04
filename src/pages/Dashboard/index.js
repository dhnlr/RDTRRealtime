import Cookies from "js-cookie";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
// import Select from 'react-select'

import { Header, Menu, Footer } from "../../components";
import DashboardImage from "./dasbor.svg"
// import kegiatanBangunan from "../SimulasiMap/kegiatanBangunan"

function Dashboard() {
  const history = useHistory();
  useEffect(() => {
    // if(JSON.parse(Cookies.get("permissions")).indexOf("Dasbor") === -1) history.goBack()
  }, [history]);

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="dashboard" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
              <div className="card" style={{ backgroundColor: "#63af9b", backgroundImage: `url("${DashboardImage}")`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-8 ">
                          <table style={{ height: "100%" }}>
                            <tbody>
                              <tr>
                                <td className="align-middle text-white">
                                  <h2 className="mt-3 pt-3">Selamat Datang di Aplikasi RDTR Realtime</h2>
                                  <p className=" font-weight-500 mb-5 ">
                                    Kini membuat perencanaan lebih mudah
                                  </p>
                                  <p className=" font-weight-400 pt-5 mb-3">
                                    Anda dapat melihat Rencana Detail Tata Ruang (RDTR) wilayah kabupaten/kota seluruh Indonesia, serta melakukan simulasi aturan untuk lokasi Anda.
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
                <div className="card position-relative">
                  <div className="card-body">
                    <div id="detailedReports" className="carousel slide detailed-report-carousel position-static pt-2" data-ride="carousel">
                      <div className="carousel-inner">
                        <div className="carousel-item active">
                          <div className="row">
                            <div className="col-md-6 col-xl-6 d-flex flex-column justify-content-start">
                              <div className="row">
                                <div className="col-md-6 grid-margin stretch-card">
                                  <div className="card tale-bg" style={{ height: "50%" }}>
                                    <div className="card-people mt-auto" style={{ paddingTop: "0px" }}>
                                      <img src="images/dashboard/mask-group7.png" alt="info" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                  <h4>Membuat peta perencanaan yang telah ada</h4>
                                  <br />
                                  Menggunakan file dari perencanaan database kami
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 col-xl-6">
                              <div className="row">
                                <div className="col-md-6 grid-margin stretch-card">
                                  <div className="card tale-bg" style={{ height: "50%" }}>
                                    <div className="card-people mt-auto" style={{ paddingTop: "0px" }}>
                                      <img src="images/dashboard/mask-group7.png" alt="info" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                  <h4>Membuat peta perencanaan yang telah ada</h4>
                                  <br />
                                  Menggunakan file dari perencanaan database kami
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="carousel-item">
                          <div className="row">
                            <div className="col-md-6 col-xl-6 d-flex flex-column justify-content-start">
                              <div className="row">
                                <div className="col-md-6 grid-margin stretch-card">
                                  <div className="card tale-bg" style={{ height: "50%" }}>
                                    <div className="card-people mt-auto" style={{ paddingTop: "0px" }}>
                                      <img src="images/dashboard/mask-group7.png" alt="info" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                  <h4>Membuat peta perencanaan yang telah ada</h4>
                                  <br />
                                  Menggunakan file dari perencanaan database kami
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 col-xl-6">
                              <div className="row">
                                <div className="col-md-6 grid-margin stretch-card">
                                  <div className="card tale-bg" style={{ height: "50%" }}>
                                    <div className="card-people mt-auto" style={{ paddingTop: "0px" }}>
                                      <img src="images/dashboard/mask-group7.png" alt="info" />
                                    </div>
                                  </div>
                                </div>
                                <div className="col-md-6 mt-3">
                                  <h4>Membuat peta perencanaan yang telah ada</h4>
                                  <br />
                                  Menggunakan file dari perencanaan database kami
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <a className="carousel-control-prev" href="#detailedReports" role="button" data-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true" />
                        <span className="sr-only">Previous</span>
                      </a>
                      <a className="carousel-control-next" href="#detailedReports" role="button" data-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true" />
                        <span className="sr-only">Next</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          {/* <Select options={kegiatanBangunan} isSearchable="true" isClearable="true" onChange={({value}) => console.log(value)} /> */}

          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
