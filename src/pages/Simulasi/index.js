import React from "react";
import { useHistory } from "react-router-dom";
import { useTable } from "react-table";

import { Header, Menu, Footer } from "../../components";
import headerImage from "./header.png";
import buildingIcon from "./building.svg";

function Simulasi() {
  let history = useHistory();
  function goInputSimulasi() {
    history.push("/simulasimap");
  }

  const data = React.useMemo(
    () => [
      {
        projectName: "Apartemen Tangguh Makmur",
        modul: "KDB/KLB",
        provence: "Jawa Barat",
        city: "Kota Bogor",
        date: "7 April 2021",
        status: "Tersedia",
        actions: "Lihat Smulasi",
      },
      {
        projectName: "Pembangunan Bendungan Hulu",
        modul: "Sampah",
        provence: "Jawa Barat",
        city: "Kota Bogor",
        date: "1 April 2021",
        status: "Tersedia",
        actions: "Lihat Smulasi",
      },
    ],
    []
  );

  const columns = React.useMemo(
    () => [
      {
        Header: "Nama Proyek",
        accessor: "projectName",
      },
      {
        Header: "Modul",
        accessor: "modul",
      },
      {
        Header: "Provinsi",
        accessor: "provence",
      },
      {
        Header: "City",
        accessor: "city",
      },
      {
        Header: "Tanggal",
        accessor: "date",
      },
      {
        Header: "Status",
        accessor: "status",
      },
      {
        Header: "",
        accessor: "actions",
      },
    ],
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="simulasi" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 stretch-card mb-4">
                {
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-8 ">
                          <p className="card-title ">Simulasi</p>
                          <p className=" font-weight-500 mb-0">Siapapun dapat melihat perencanaan secara publik</p>
                        </div>
                        <div className="col-4 background-icon">
                          <img src={headerImage} alt="header" style={{ width: "50%", float: "right" }}></img>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                {/* <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    <div style={{ flex: "1" }}>
                                        <img src={headerImage} alt="header" style={{ width: "100%" }}></img>
                                    </div>
                                    <div style={{ flex: "2", display: "flex", flexWrap: "wrap", flexDirection: "column", padding: "0 2.3rem", justifyContent: "center" }}>
                                        <p className="font-weight-bold mb-4 fs-30">Simulasi</p>
                                        <p className="font-weight-500 mb-0" style={{ fontSize: "16px", lineHeight: "1.64" }}>Kini masyarakat dapat melakukan simulasi terencana<br /> tata ruang secara online menjadi lebih mudah. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean lacinia tempor dolor, blandit mollis erat scelerisque vel. </p>
                                    </div>
                                </div> */}
              </div>
            </div>

            <div /* className="d-flex justify-content-center" */ style={{ display: "none" }}>
              <div className="col-md-7 stretch-card mt-2 mb-2">
                <div className="input-group">
                  <div className="input-group-prepend hover-cursor" id="navbar-search-icon">
                    <span className="input-group-text" id="search" style={{ background: "white", borderRight: "none" }}>
                      <i className="icon-search"></i>
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    id="navbar-search-input"
                    placeholder="Cari simulasi"
                    aria-label="search"
                    aria-describedby="search"
                    style={{ borderLeft: "none" }}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 stretch-card mt-4 mb-2">
                <img className="mr-2" src={buildingIcon} alt="building icon" style={{ float: "left", width: "3rem" }} />
                <p>
                  <span className="font-weight-bold ml-1 mr-1 align-middle" style={{ fontSize: 20 }}>
                    Buat simulasi Anda
                  </span>
                  <button
                    className="btn btn-success ml-2"
                    onClick={() => {
                      goInputSimulasi();
                    }}
                  >
                    Buat Sekarang
                  </button>
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 grid-margin stretch-card my-4">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Simulasi Anda</p>
                    <div className="row">
                      <div className="col-12">
                        <div className="table-responsive">
                          <div style={{ display: "flex", alignContent: "center", flexWrap: "wrap", flexDirection: "column", padding: "3% 30%" }}>
                            <p>Ups... Kamu belum miliki perencanaan yang tersimpan. Silahkan membuat yang baru terlebih dahulu.</p>
                            <button
                              className="btn btn-success"
                              onClick={() => {
                                goInputSimulasi();
                              }}
                            >
                              Buat Simulasi Anda
                            </button>
                          </div>
                          <div style={{ display: "none" }}>
                            <table {...getTableProps()} className="table">
                              <thead>
                                {headerGroups.map((headerGroup) => (
                                  <tr {...headerGroup.getHeaderGroupProps()}>
                                    {headerGroup.headers.map((column) => (
                                      <th>{column.render("Header")}</th>
                                    ))}
                                  </tr>
                                ))}
                              </thead>
                              <tbody {...getTableBodyProps()}>
                                {rows.map((row) => {
                                  prepareRow(row);
                                  return (
                                    <tr {...row.getRowProps()}>
                                      {row.cells.map((cell) => {
                                        if (cell.column.Header === "Status" && cell.value === "Tersedia") {
                                          return (
                                            <td>
                                              <span className="btn btn-success">{cell.render("Cell")}</span>
                                            </td>
                                          );
                                        } else {
                                          return <td>{cell.render("Cell")}</td>;
                                        }
                                      })}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default Simulasi;
