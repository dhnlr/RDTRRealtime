import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import { Header, Menu, Footer, Table, TableLoading } from "../../../components";
import headerImage from "./Group 12399.svg";
import buildingIcon from "./building.svg";

import { config } from "../../../Constants";

function SimulationTable() {
  const [search, setSearch] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processCounter, setProcessCounter] = useState(0);
  const [data, setData] = useState([]);
  const [recordsFiltered, setRecordsFiltered] = useState(0);
  const [recordsTotal, setRecordsTotal] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [pI, setPI] = useState(0);
  const [sortByState, setSortByState] = useState([]);
  const fetchIdRef = React.useRef(0);

  let history = useHistory();
  function goInputSimulasi() {
    history.push("/simulationinput");
  }

  useEffect(() => {
    if (!sessionStorage.token) {
      history.push("/login");
    }
  }, [history]);

  const fetchData = React.useCallback(
    ({
      pageSize,
      pageIndex,
      valueFilter,
      navPagination,
      pageOptLength,
      sortBy,
      searchVal,
    }) => {
      const getUser = async () => {
        try {
          let pageIndexTbl = 0;
          // let pageIndexAPI = 0;
          if ((valueFilter !== "") & (navPagination === "Y")) {
            if (pageIndex + 1 > pageOptLength) {
              pageIndexTbl = 0;
              // pageIndexAPI = 0;
            } else {
              pageIndexTbl = pageIndex;
              // pageIndexAPI = pageSize * pageIndex;
            }
          } else {
            if (valueFilter !== "") {
              pageIndexTbl = 0;
              // pageIndexAPI = 0;
            } else {
              pageIndexTbl = pageIndex;
              // pageIndexAPI = pageSize * pageIndex;
            }
          }
          /* var keyword = ''
                if (valueFilter !== '') {
                    keyword = '&input.keyword=' + valueFilter
                } */
          var sort = sortBy[0] ? sortBy[0].id : "id";
          var orderType = sortBy[0]?.desc ? "desc" : "asc";
          /* const datas = await axios.get(config.url.API_URL + "/User/List?input.pageSize=" + pageSize + "&input.page=" + (pageIndexTbl+1) + "&input.orderProperty="+sort+"&input.orderType="+ orderType + keyword, {
                    headers: { Authorization: "Bearer " + sessionStorage.token }
                }); */
          setIsProcessing(true);
          const datas = await axios.get(
            config.url.API_URL + "/Simulasi/GetList",
            {
              headers: { Authorization: "Bearer " + sessionStorage.token },
              params: {
                "input.pageSize": pageSize,
                "input.page": pageIndexTbl + 1,
                "input.orderProperty": sort,
                "input.orderType": orderType,
                "input.keyword": searchVal,
              },
            }
          );

          const fetchId = ++fetchIdRef.current;
          if (fetchId === fetchIdRef.current) {
            // const startRow = pageSize * pageIndex;
            // const endRow = startRow + pageSize;
            // setData(data.data.slice(startRow, endRow));
            // setPI(pageIndex);
            setPI(pageIndexTbl);
            setData(datas.data.obj);
            setRecordsFiltered(datas.data.obj.length);
            setRecordsTotal(datas.data.count);
            setPageCount(Math.ceil(datas.data.count / pageSize));
            setSortByState(sortBy);
            setIsProcessing(false);
          }
        } catch (errorForm) {
          setIsProcessing(false);
          console.warn(errorForm);
        }
      };

      getUser();
    },
    []
  );

  const handleDelete = ({ id }) => {
    try {
      Swal.fire({
        title: "Hapus Simulasi",
        text: "Simulasi yang dihapus tidak dapat dikembalikan. Apakah Anda yakin untuk menghapus simulasi?",
        icon: "warning",
        showCancelButton: true,
        showLoaderOnConfirm: true,
        customClass: {
          confirmButton: "btn btn-danger",
          cancelButton: "btn-link",
        },
        confirmButtonText: "Ya, hapus!",
        confirmButtonColor: "#FF4747",
        cancelButtonText: "Batal",
      }).then((action) => {
        if (action.isConfirmed) {
          axios
            .delete(config.url.API_URL + "/Simulasi/Delete", {
              headers: { Authorization: "Bearer " + sessionStorage.token },
              params: {
                id,
              },
            })
            .then(() => {
              Swal.fire({
                title: "Berhasil",
                text: "Pengguna berhasil dihapus",
                icon: "success",
                confirmButtonText: "Selesai",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                  setProcessCounter(processCounter + 1);
                }
              });
            });
        }
      });
    } catch (errorForm) {
      Swal.fire("Maaf", errorForm.response.data.error.message, "error");
    }
  };

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
                  <div className="card" style={{ background: "#80c3d1" }}>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-8 ">
                          <table style={{ height: "100%" }}>
                            <tbody>
                              <tr>
                                {/* <td className="align-baseline">baseline</td>
                                <td className="align-top">top</td> */}
                                <td className="align-middle text-white">
                                  <h2 className="">Simulasi</h2>
                                  <p className=" font-weight-500 mb-2">
                                    Siapapun dapat melihat perencanaan secara
                                    publik
                                  </p>
                                  {/* <p className=" font-weight-400 mt-4"><i className="ti-help-alt"> </i>Butuh bantuan?</p> */}
                                </td>
                                {/* <td className="align-bottom">bottom</td>
                                <td className="align-text-top">text-top</td>
                                // <td className="align-text-bottom">text-bottom</td> */}
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div
                          className="col-4 background-icon" /* style={{content:`url("${headerImage}")`, position: "absolute", right: 0, maxHeight: "10rem"}} */
                        >
                          {/* {<img src={headerImage} alt="header" style={{ width: "50%", float: "right" }}></img>} */}
                          <ImageDiv src={headerImage} alt="header"></ImageDiv>
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

            <div
              className="d-flex justify-content-center" /* style={{ display: "none" }} */
            >
              <div className="col-md-7 stretch-card mt-2 mb-2">
                <div className="input-group">
                  <div
                    className="input-group-prepend hover-cursor"
                    id="navbar-search-icon"
                  >
                    <span
                      className="input-group-text"
                      id="search"
                      style={{ background: "white", borderRight: "none" }}
                    >
                      {!isProcessing && <i className="icon-search"></i>}
                      {isProcessing && (
                        <div
                          className="spinner-border spinner-border-sm"
                          role="status"
                        >
                          <span className="sr-only">Loading...</span>
                        </div>
                      )}
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
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 stretch-card mt-4 mb-2">
                <img
                  className="mr-2"
                  src={buildingIcon}
                  alt="building icon"
                  style={{ float: "left", width: "3rem" }}
                />
                <p>
                  <span
                    className="font-weight-bold ml-1 mr-1 align-middle"
                    style={{ fontSize: 20 }}
                  >
                    Buat Simulasi Anda
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
                    <p className="card-title">Data yang Telah Dibuat</p>
                    <div className="row">
                      <div className="col-12">
                        <div className="table-responsive">
                          {isProcessing && data.length === 0 && (
                            <TableLoading />
                          )}
                          <div>
                            <Table
                              routeAdd="/user/add"
                              // filterTenant={site}
                              columns={[
                                {
                                  Header: "Nama Proyek",
                                  accessor: "name",
                                  // width: "20%",
                                },
                                {
                                  Header: "Dibuat pada",
                                  accessor: "createDate",
                                  width: "10%",
                                  Cell: (row) => (
                                    <span>
                                      {new Date(
                                        row.cell.value
                                      ).toLocaleDateString("id-ID", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      })}
                                    </span>
                                  ),
                                },
                                {
                                  Header: "",
                                  accessor: "action",
                                  width: "15%",
                                  disableGlobalFilter: true,
                                  Cell: (row) => (
                                    <div style={{ textAlign: "right" }}>
                                      <Link to="/simulasimap">
                                        <button
                                          className="btn btn-outline-light btn-xs"
                                          title="Peta Simulasi"
                                        >
                                            Lihat Simulasi
                                        </button>
                                      </Link>
                                      &nbsp;
                                    </div>
                                  ),
                                },
                                {
                                  Header: "",
                                  accessor: "id",
                                  width: "15%",
                                  disableGlobalFilter: true,
                                  Cell: (row) => (
                                    <div style={{ textAlign: "right" }}>
                                      <Link
                                        to={{
                                          pathname: "/simulationinput",
                                          state: data.filter(
                                            (datum) =>
                                              datum.id === row.row.values.id
                                          )[0],
                                          // row.row.values,
                                        }}
                                      >
                                        <button
                                          className="btn btn-outline-dark btn-xs"
                                          title="Ubah"
                                        >
                                          <span>
                                            <i className="ti-pencil"></i>
                                          </span>
                                        </button>
                                      </Link>
                                      &nbsp;
                                      <button
                                        className="btn btn-outline-danger btn-xs"
                                        title="Hapus"
                                        onClick={() =>
                                          handleDelete(row.row.values)
                                        }
                                      >
                                        <span>
                                          <i className="ti-trash"></i>
                                        </span>
                                      </button>
                                    </div>
                                  ),
                                },
                              ]}
                              data={data}
                              fetchData={fetchData}
                              pageCount={pageCount}
                              pI={pI}
                              recordsFiltered={recordsFiltered}
                              recordsTotal={recordsTotal}
                              sortBy={sortByState}
                              // valueTenant={selTenant}
                              searchVal={search}
                              processCounter={processCounter}
                              isProcessing={isProcessing}
                            />
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

const ImageDiv = styled.img`
  // position: absolute;
  float: right;
  width: 50%;
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

export default SimulationTable;
