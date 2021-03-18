import React, { useEffect } from "react";
import { Header, Menu, Footer, A } from "../../components";
import { useHistory, Link } from "react-router-dom";

function Home() {
  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 grid-margin">
                <div className="row">
                  <div className="col-12 col-xl-8 mb-4 mb-xl-0">
                    <h3 className="font-weight-bold">Welcome Aamir</h3>
                    <h6 className="font-weight-normal mb-0">
                      All systems are running smoothly! You have <span className="text-primary">3 unread alerts!</span>
                    </h6>
                  </div>
                  <div className="col-12 col-xl-4">
                    <div className="justify-content-end d-flex">
                      <div className="dropdown flex-md-grow-1 flex-xl-grow-0">
                        <button
                          className="btn btn-sm btn-light bg-white dropdown-toggle"
                          type="button"
                          id="dropdownMenuDate2"
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="true"
                        >
                          <i className="mdi mdi-calendar" /> Today (10 Jan 2021)
                        </button>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuDate2">
                          <A className="dropdown-item" href="#">
                            January - March
                          </A>
                          <A className="dropdown-item" href="#">
                            March - June
                          </A>
                          <A className="dropdown-item" href="#">
                            June - August
                          </A>
                          <A className="dropdown-item" href="#">
                            August - November
                          </A>
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

export default Home;
