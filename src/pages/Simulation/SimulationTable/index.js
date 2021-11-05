import React, { useState } from "react";
import styled from "styled-components";
import { useHistory, Link } from "react-router-dom";
import axios from "../../../axiosConfig";
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
  const [isCompare, setIsCompare] = useState(false);
  const [comparedSchenario, setComparedSchenario] = useState([]);
  const fetchIdRef = React.useRef(0);

  let history = useHistory();
  function goInputSimulasi() {
    history.push("/schenarioinput");
  }

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
          setIsProcessing(true);
          const datas = await axios.get(
            config.url.API_URL + "/Project/GetList",
            {
              params: {
                "input.pageSize": pageSize,
                "input.page": pageIndexTbl + 1,
                "input.orderProperty": sort,
                "input.orderType": orderType,
                "input.keyword": searchVal,
              },
            }
          );
          for (let index = 0; index <= datas.data.obj.length; index++) {
            if (index < datas.data.obj.length) {
              const element = datas.data.obj[index];
              let subRows = await fetchSubRows(element.id);
              element.subRows = subRows.data.obj;
            } else if (index === datas.data.obj.length) {
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
            }
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

  const fetchSubRows = (id) => {
    return axios.get(config.url.API_URL + "/Simulasi/GetAll", {
      params: {
        ProjectId: id,
      },
    });
  };

  const handleDelete = ({ id }) => {
    try {
      Swal.fire({
        title: "Hapus Skenario",
        text: "Skenario yang dihapus tidak dapat dikembalikan. Apakah Anda yakin untuk menghapus skenario?",
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
              })
                .then((result) => {
                  if (result.value) {
                    setProcessCounter(processCounter + 1);
                  }
                })
                .catch((errorForm) => {
                  Swal.fire(
                    "Maaf",
                    errorForm.response.data.error.message,
                    "error"
                  );
                });
            });
        }
      });
    } catch (errorForm) {
      Swal.fire("Maaf", errorForm.response.data.error.message, "error");
    }
  };

  const handleSimulasi = (state) => {
    Swal.fire({
      title: "Peringatan",
      html: `<ol><li>Perlu diketahui bahwa kebutuhan air setiap kegiatan berbeda-beda.</li>
    <li>Perlu diketahui bahwa terdapat beberapa hal yang mempengaruhi tingkat LOS, diantaranya waktu, jenis kegiatan, lebar jalan, dan cakupan kegiatan. Hal ini mengakibatkan perlunya pengkategorian level LOS yang tepat.</li>
    </ol>`,
      icon: "warning",
      showCloseButton: true,
      focusConfirm: true,
      confirmButtonText: "Lihat Skenario",
      showCancelButton: true,
      cancelButtonText: "Batal",
      customClass: {
        content: "text-left",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        history.push("/schenariomap", state);
      }
    });
  };

  const handleCompare = (newState) => {
    var sameId = comparedSchenario.filter(
      (schenario) => schenario.id === newState.id
    );
    if (comparedSchenario.length < 2 && sameId.length === 0) {
      setComparedSchenario((state) => [...state, newState]);
    } else if (sameId.length !== 0) {
      Swal.fire(
        "Maaf",
        "Skenario sudah dipilih untuk dibandingkan. Silahkan pilih skenario lain.",
        "error"
      );
    } else if (comparedSchenario.length >= 2) {
      Swal.fire(
        "Maaf",
        "Maksimal skenario yang dapat dibandingkan hanya dua",
        "error"
      );
    }
  };

  const removeCompare = (id) => {
    var newState = comparedSchenario.filter((schenario) => schenario.id !== id);
    setComparedSchenario(newState);
  };

  const routeCompare = () => {
    if (comparedSchenario.length === 2) {
      history.push("/schenariohistory", comparedSchenario);
    } else {
      Swal.fire(
        "Maaf",
        "Minimal skenario untuk dibandingkan adalah dua",
        "error"
      );
    }
  };

  return (
    <div className="container-fluid">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="schenario" />
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
                                <td className="align-middle text-white">
                                  <h2 className="">Skenario</h2>
                                  <p className=" font-weight-500 mb-2">
                                    Siapapun dapat melihat perencanaan secara
                                    publik
                                  </p>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div
                          className="col-4 background-icon" /* style={{content:`url("${headerImage}")`, position: "absolute", right: 0, maxHeight: "10rem"}} */
                        >
                          <ImageDiv src={headerImage} alt="header"></ImageDiv>
                        </div>
                      </div>
                    </div>
                  </div>
                }
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
                    placeholder="Cari skenario"
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
                    Buat Skenario Anda
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
                    <div className="d-flex justify-content-between flex-wrap align-items-baseline">
                      <p className="card-title float-left">
                        Skenario yang Telah Dibuat
                      </p>
                      <p className="card float-right">
                        <button
                          className={
                            "btn ml-2 " +
                            (!isCompare ? "btn-success" : "btn-outline-danger")
                          }
                          onClick={() => {
                            setIsCompare(!isCompare);
                            setComparedSchenario([])
                          }}
                        >
                          {!isCompare ? "Bandingkan" : "Batal Perbandingan"}
                        </button>
                      </p>
                    </div>
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
                                  id: "expander", // Make sure it has an ID
                                  Cell: ({ row }) =>
                                    row.canExpand ? (
                                      <span
                                        {...row.getToggleRowExpandedProps({
                                          style: {
                                            paddingLeft: `${row.depth * 2}rem`,
                                          },
                                        })}
                                      >
                                        {row.isExpanded ? (
                                          <i className="ti-arrow-circle-down"></i>
                                        ) : (
                                          <i className="ti-arrow-circle-right"></i>
                                        )}
                                      </span>
                                    ) : null,
                                },
                                {
                                  Header: "Nama Proyek",
                                  accessor: "projectName",
                                  // width: "20%",
                                },
                                {
                                  Header: "Nama Skenario",
                                  accessor: "name",
                                  // width: "20%",
                                },
                                {
                                  Header: "Provinsi",
                                  accessor:
                                    "project.kotaKabupaten.provinsi.name",
                                  // width: "20%",
                                },
                                {
                                  Header: "Kabupaten / Kota",
                                  accessor: "project.kotaKabupaten.name",
                                  // width: "20%",
                                },
                                {
                                  Header: "Dibuat pada",
                                  accessor: "createDate",
                                  width: "10%",
                                  Cell: (row) => row.row.original.projectName ? (<></>) : (
                                    <span>
                                      {row.cell.value
                                        ? new Date(
                                            row.cell.value
                                          ).toLocaleDateString("id-ID", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          })
                                        : ""}
                                    </span>
                                  ),
                                },
                                {
                                  Header: "",
                                  accessor: "action",
                                  width: "15%",
                                  disableGlobalFilter: true,
                                  Cell: (row) => {
                                    if (row.row.original.projectName) {
                                      return <></>;
                                    } else {
                                      return (
                                        <div style={{ textAlign: "right" }}>
                                          {row.row.original.simulasiBangunan
                                            ?.projectId && (
                                            <>
                                              <button
                                                className="btn btn-outline-light btn-xs"
                                                title="Peta Skenario"
                                                onClick={() => {
                                                  handleSimulasi(
                                                    row.row.original
                                                  );
                                                }}
                                              >
                                                Lanjutkan Analisis
                                              </button>
                                              &nbsp;
                                            </>
                                          )}
                                          {isCompare && (
                                            <button
                                              className="btn btn-outline-light btn-xs"
                                              title="Peta Skenario"
                                              onClick={() => {
                                                handleCompare(row.row.original);
                                              }}
                                            >
                                              Bandingkan Skenario
                                            </button>
                                          )}
                                        </div>
                                      );
                                    }
                                  },
                                },
                                {
                                  Header: "",
                                  accessor: "id",
                                  width: "15%",
                                  disableGlobalFilter: true,
                                  Cell: (row) => {
                                    if (row.row.original.projectName) {
                                      return <></>;
                                    } else {
                                      return (
                                        <div style={{ textAlign: "right" }}>
                                          <Link
                                            to={{
                                              pathname: "/schenarioinput",
                                              state: row.row.original,
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
                                              handleDelete(row.row.original)
                                            }
                                          >
                                            <span>
                                              <i className="ti-trash"></i>
                                            </span>
                                          </button>
                                        </div>
                                      );
                                    }
                                  },
                                },
                              ]}
                              data={data}
                              fetchData={fetchData}
                              fetchSubRows={fetchSubRows}
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

            {isCompare && (
              <div
                className="row"
                style={{ position: "sticky", bottom: "12px", zIndex: "100" }}
              >
                <div className="col-md-12 grid-margin my-4 ">
                  <div className="card">
                    <div className="card-body">
                      <p className="card-title">Skenario yang Dibandingkan</p>
                      <div className="d-flex justify-content-between flex-wrap">
                        <div className="d-flex flex-wrap">
                          <div
                            style={
                              comparedSchenario[0]
                                ? compareSelection
                                : emptyCompareSelection
                            }
                          >
                            {comparedSchenario[0] && (
                              <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                style={{
                                  paddingLeft: "0.6rem",
                                  fontSize: "1.2rem",
                                }}
                                onClick={() =>
                                  removeCompare(comparedSchenario[0].id)
                                }
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            )}
                            {comparedSchenario[0]
                              ? comparedSchenario[0].name
                              : "Skenario belum dipilih"}
                          </div>
                          <div
                            style={
                              comparedSchenario[1]
                                ? compareSelection
                                : emptyCompareSelection
                            }
                          >
                            {comparedSchenario[1] && (
                              <button
                                type="button"
                                className="close"
                                aria-label="Close"
                                style={{
                                  paddingLeft: "0.6rem",
                                  fontSize: "1.2rem",
                                }}
                                onClick={() =>
                                  removeCompare(comparedSchenario[1].id)
                                }
                              >
                                <span aria-hidden="true">&times;</span>
                              </button>
                            )}
                            {comparedSchenario[1]
                              ? comparedSchenario[1].name
                              : "Skenario belum dipilih"}
                          </div>
                        </div>
                        <div className="d-flex align-items-baseline flex-column justify-content-center">
                          <button className="btn btn-success btn-block" onClick={routeCompare}>
                            Lanjutkan Perbandingan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

const emptyCompareSelection = {
  borderColor: "rgba(163, 164, 165, 0.2)",
  borderRadius: "15px",
  backgroundColor: "rgba(163, 164, 165, 0.2)",
  color: "#a3a4a5",
  textAlign: "center",
  padding: "0.5rem 0.75rem",
  margin: "0.5rem",
  lineHeight: 1.5,
  position: "relative",
  fontSize: "0.875rem",
  height: "max-content",
};
const compareSelection = {
  borderColor: "#e3e3e3",
  borderRadius: "15px",
  border: "1px solid",
  // backgroundColor: "#e3e3e3",
  color: "#212529",
  textAlign: "center",
  padding: "0.5rem 0.75rem",
  margin: "0.5rem",
  lineHeight: 1.5,
  position: "relative",
  fontSize: "0.875rem",
  height: "max-content",
};

export default SimulationTable;
