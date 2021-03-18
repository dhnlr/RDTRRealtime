import React from "react";
import A from "../A";
import Img from "../Img";
import { Link, useHistory } from "react-router-dom";

function Header() {
  return (
    <nav className="navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <A className="navbar-brand brand-logo mr-5" href="#">
          <Img src="images/logo.svg" className="mr-2" alt="logo" />
        </A>
        <A className="navbar-brand brand-logo-mini" href="#">
          <Img src="images/logo-mini.svg" alt="logo" />
        </A>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
          <span className="icon-menu" />
        </button>
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item dropdown">
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
          </li>
          <li className="nav-item nav-profile dropdown">
            <A className="nav-link dropdown-toggle" href="#" data-toggle="dropdown" id="profileDropdown">
              <Img src="images/faces/face28.jpg" alt="profile" />
            </A>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="profileDropdown">
              <A className="dropdown-item">
                <i className="ti-settings text-primary" />
                Settings
              </A>
              <A className="dropdown-item">
                <i className="ti-power-off text-primary" />
                Logout
              </A>
            </div>
          </li>
        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
          <span className="icon-menu" />
        </button>
      </div>
    </nav>
  );
}

export default Header;
