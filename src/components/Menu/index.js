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
            <i className="icon-grid menu-icon" />
            <span className="menu-title">Dashboard</span>
          </A>
        </li>
        <li className="nav-item">
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
          </A>
        </li>
      </ul>
    </nav>
  );
}

export default Menu;
