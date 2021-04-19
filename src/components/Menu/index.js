import React from "react";
import A from "../A";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

function Menu(props) {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className={`nav-item ${props.active === "dashboard" ? "active" : ""}`}>
          <Link className="nav-link" to="/dashboard">
            <i className="ti-dashboard menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>
        <li className={`nav-item ${props.active.indexOf("manajemendata") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/manajemendata">
            <i className="ti-folder menu-icon"></i>
            <span className="menu-title">Manajemen Data</span>
          </Link>
        </li>
        <li className={`nav-item ${props.active.indexOf("simulasi") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/simulasi">
            <i className="ti-map-alt menu-icon"></i>
            <span className="menu-title">Simulasi</span>
          </Link>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <i className="ti-write menu-icon"></i>
            <span className="menu-title">Laporan</span>
          </A>
        </li>
        <li className={`nav-item ${props.active.indexOf("user") !== -1 ? "active" : ""}`}>
        <Link className="nav-link" to="/usermanagement">
            <i className="ti-user menu-icon"></i>
            <span className="menu-title">Administrasi</span>
          </Link>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <i className="ti-help-alt menu-icon"></i>
            <span className="menu-title">Bantuan</span>
          </A>
        </li>
      </ul>
    </nav>
  );
}

Menu.propTypes = {
  active: PropTypes.string,
};

export default Menu;
