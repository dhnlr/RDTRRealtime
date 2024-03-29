import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="d-sm-flex justify-content-center justify-content-sm-between">
        <span className="text-muted text-center text-sm-left d-block d-sm-inline-block">
          Hak Cipta © {new Date().getFullYear()}. Direktorat Jenderal Tata Ruang Kementerian.
        </span>
        {/* <span className="float-none float-sm-right d-block mt-1 mt-sm-0 text-center">
          Dibuat oleh Esri Indonesia <i className="ti-heart text-danger ml-1" />
        </span> */}
      </div>
    </footer>
  );
}

export default Footer;
