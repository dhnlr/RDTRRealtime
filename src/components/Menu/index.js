import React from "react";
import A from "../A";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Cookies from "js-cookie";

function Menu(props) {
  const permissions = JSON.parse(Cookies.get("permissions"))

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className={`nav-item ${props.active === "dashboard" ? "active" : ""}`}>
          <Link className="nav-link" to="/dashboard">
            <i className="ti-dashboard menu-icon"></i>
            <span className="menu-title">Dasbor</span>
          </Link>
        </li>
        {permissions.indexOf("Manajemen Data") !== -1 && <li className={`nav-item ${props.active.indexOf("manajemendata") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/datamanagement">
            <i className="ti-folder menu-icon"></i>
            <span className="menu-title">Manajemen Data</span>
          </Link>
        </li>}
        {permissions.indexOf("Simulasi") !== -1 && <li className={`nav-item ${props.active.indexOf("schenario") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/schenario">
            <i className="ti-map-alt menu-icon"></i>
            <span className="menu-title">Skenario</span>
          </Link>
        </li>}
        {permissions.indexOf("Laporan") !== -1 && <li className={`nav-item ${props.active.indexOf("report") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/report">
            <i className="ti-write menu-icon"></i>
            <span className="menu-title">Laporan</span>
          </Link>
        </li>}
        {(permissions.indexOf("Users") !== -1 || permissions.indexOf("Roles") !== -1) && <li className={`nav-item ${props.active.indexOf("user") !== -1 ? "active" : ""}`}>
        {/* <Link className="nav-link" to="/usermanagement"> */}
        <A className="nav-link collapsed" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
            <i className="ti-user menu-icon"></i>
            <span className="menu-title">Administrasi</span>
            <i className="menu-arrow"></i>
            </A>
          {/* </Link> */}
          <div className="collapse" id="ui-basic" >
              <ul className="nav flex-column sub-menu">
                {permissions.indexOf("Users") !== -1 && <li className="nav-item"> <Link className="nav-link" to="/usermanagement">Pengguna</Link></li>}
                {permissions.indexOf("Roles") !== -1 && <li className="nav-item"> <Link className="nav-link" to="/rolemanagement">Peran</Link></li>}
              </ul>
            </div>
        </li>}
        {<li className={`nav-item ${props.active.indexOf("help") !== -1 ? "active" : ""}`}>
          <Link className="nav-link" to="/help">
            <i className="ti-help-alt menu-icon"></i>
            <span className="menu-title">Bantuan</span>
          </Link>
        </li>}
      </ul>
    </nav>
  );
}

Menu.propTypes = {
  active: PropTypes.string,
};

export default Menu;
