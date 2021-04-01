import React from "react";
import A from "../A";
import Img from "../Img";
import { Link, NavLink } from "react-router-dom";

function Menu() {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <span className="menu-title">Dashboard</span>
          </A>
        </li>
        <li className="nav-item">
<<<<<<< HEAD
          <A className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
            <i className="icon-layout menu-icon" />
            <span className="menu-title">UI Elements</span>
            <i className="menu-arrow" />
          </A>
          <div className="collapse" id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                {" "}
                <A className="nav-link" href="pages/ui-features/buttons.html">
                  Buttons
                </A>
              </li>
              <li className="nav-item">
                {" "}
                <A className="nav-link" href="pages/ui-features/dropdowns.html">
                  Dropdowns
                </A>
              </li>
              <li className="nav-item">
                {" "}
                <A className="nav-link" href="pages/ui-features/typography.html">
                  Typography
                </A>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="pages/documentation/documentation.html">
            <i className="icon-paper menu-icon" />
            <span className="menu-title">Documentation</span>
=======
          <A className="nav-link" href="index.html">
            <span className="menu-title">Manajemen Data</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <span className="menu-title">Simulasi</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <span className="menu-title">Laporan</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <span className="menu-title">Administrasi</span>
          </A>
        </li>
        <li className="nav-item">
          <A className="nav-link" href="index.html">
            <span className="menu-title">Bantuan</span>
>>>>>>> f76804ab221d2dc63c46e0b26b01ac243a149b21
          </A>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;
