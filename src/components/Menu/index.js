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
            <i className="icon-grid menu-icon"></i>
            <span className="menu-title">Dashboard</span>
          </Link>
        </li>
        <li className={`nav-item ${props.active.indexOf("manajemendata") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/manajemendata">
            <i className="icon-grid-2 menu-icon"></i>
            <span className="menu-title">Manajemen Data</span>
          </Link>
        </li>
        <li className={`nav-item ${props.active.indexOf("simulasi") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/simulasi">
            <i className="icon-columns menu-icon"></i>
            <span className="menu-title">Simulasi</span>
          </Link>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <i className="icon-bar-graph menu-icon"></i>
            <span className="menu-title">Laporan</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <i className="icon-head menu-icon"></i>
            <span className="menu-title">Administrasi</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <i className="icon-paper menu-icon"></i>
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
