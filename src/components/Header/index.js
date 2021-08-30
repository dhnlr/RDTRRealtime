import React from "react";
import A from "../A";
import { Link, useHistory } from "react-router-dom";
// import logo from "./logo-txt.png"

import logo2 from "./logo2.jpeg"
import profile from "./face28.jpg"

function Header() {
  let history = useHistory();

  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <Link className="navbar-brand brand-logo mr-5" to="/dashboard">
          <img src={logo2} className="mr-2" alt="logo" />
        </Link>
        <Link className="navbar-brand brand-logo-mini" to="/dashboard">
          <img src="./images/logo-txt-mini.png" alt="logo" />
        </Link>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize" onClick={()=> {
          if (document.body.getAttribute("class") === 'sidebar-icon-only') {
            document.body.setAttribute("class",'');
          } else {
            document.body.setAttribute("class",'sidebar-icon-only');
          }
        }}>
          <span className="icon-menu" />
        </button>
        <ul className="navbar-nav navbar-nav-right">
          {/* <li className="nav-item dropdown">
            <A className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
              <i className="icon-bell mx-0" />
              <span className="count" />
            </A>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
              <p className="mb-0 font-weight-normal float-left dropdown-header">Notifications</p>
              <A className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-success">
                    <i className="ti-info-alt mx-0" />
                  </div>
                </div>
                <div className="preview-item-content">
                  <h6 className="preview-subject font-weight-normal">Application Error</h6>
                  <p className="font-weight-light small-text mb-0 text-muted">Just now</p>
                </div>
              </A>
            </div>
          </li> */}
          <li className="nav-item nav-profile dropdown">
            <A className="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
              <img src={profile} alt="profile" />
            </A>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
              <A className="dropdown-item" onClick={()=>history.push("/profile")}>
                <i className="ti-settings text-primary" />
                Profil
              </A>
              <A className="dropdown-item" onClick={() => {
                sessionStorage.clear();
                history.push("/login")
                }}>
                <i className="ti-power-off text-primary" />
                Keluar
              </A>
            </div>
          </li>
        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas" onClick={()=> {
          if (document.getElementById("sidebar").getAttribute("class").indexOf('active') === -1) {
            document.getElementById("sidebar").setAttribute("class", "sidebar sidebar-offcanvas active");
          } else {
            document.getElementById("sidebar").setAttribute("class", "sidebar sidebar-offcanvas");
          }
        }}>
          <span className="icon-menu" />
        </button>
      </div>
    </nav>
  );
}

export default Header;
