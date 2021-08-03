import React, { useEffect } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";

import { Header, Menu, Footer } from "../../../components";
import SimulationInput from "../SimulationInput";

function SimulationHistory() {
  let history = useHistory();

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="dashboard"/>
        <div className="main-panel">
          <div className="content-wrapper">
            
            <div className="row">
              <div className="col-md-12 grid-margin stretch-card">
                  <h1>Welcome</h1>
              </div>
            </div>

            </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default SimulationHistory;
