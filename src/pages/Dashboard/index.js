import React from "react";
import { Header, Menu, Footer } from "../../components";

function Dashboard() {
  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="dashboard"/>
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
                <div className="card tale-bg">
                  <div className="card-people mt-auto" style={{ paddingTop: "0px" }}>
                    <img src="images/dashboard/info.png" alt="info" />
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
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
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
