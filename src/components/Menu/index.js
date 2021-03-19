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
          </A>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;
