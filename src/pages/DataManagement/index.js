import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

import {
  Header,
  Img,
  Menu,
  Footer,
  Table,
  TableLoading,
} from "../../components";

import { config } from "../../Constants";

function DataManagement() {
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
  function goManajemenData() {
    history.push("/manajemendatainput");
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
            config.url.API_URL + "/Project/GetList",
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
        title: "Hapus Bantuan",
        text: "Bantuan yang dihapus tidak dapat dikembalikan. Apakah Anda yakin untuk menghapus bantuan?",
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
            .delete(config.url.API_URL + "/Project/Delete", {
              headers: { Authorization: "Bearer " + sessionStorage.token },
              params: {
                id,
              },
            })
            .then((response) => {
              if (response.data.code === 200) {
                Swal.fire({
                  title: "Berhasil",
                  text: "Bantuan berhasil dihapus",
                  icon: "success",
                  confirmButtonText: "OK",
                  allowOutsideClick: false,
                }).then((result) => {
                  if (result.value) {
                    setProcessCounter(processCounter + 1);
                  }
                });
              } else {
                Swal.fire("Maaf", response.data.description, "error");
              }
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
        <Menu active="manajemendata" />
        <div className="main-panel">
          <div className="content-wrapper">
            <div className="row">
              <div className="col-md-12 stretch-card mb-4">
                <div className="card data-icon-card-primary">
                  <div className="card-body">
                    {/* <img src="images/dashboard/info.png" alt="info" /> */}
                    <div className="row">
                      <div className="col-8 text-white">
                        <p className="card-title text-white">Manajemen Data</p>
                        <p className="text-white font-weight-500 mb-0">
                          Kini masyarakat dapat melakukan simulasi terencana
                          <br /> tata ruang secara online menjadi lebih mudah
                        </p>
                      </div>
                      <div className="col-4 background-icon"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center">
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
                    placeholder="Cari projek"
                    aria-label="search"
                    aria-describedby="search"
                    style={{ borderLeft: "none" }}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="row my-4">
              <div className="col-md-1">
                <Img
                  src="images/file-icons/64/attention.png"
                  alt="Attention"
                  aria-label="Business type: activate to sort column ascending"
                ></Img>
              </div>
              <div className="col-md-8">
                <h3>Buat Data Anda</h3>
                <p>Impor segala file pendukung kedalam modul perencanaan</p>
              </div>
              <div className="col-md-3">
                <button
                  className="btn btn-primary btn-block"
                  type="button"
                  onClick={() => goManajemenData()}
                >
                  Buat Sekarang
                </button>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 grid-margin stretch-card my-4">
                <div className="card">
                  <div className="card-body">
                    <p className="card-title">Projek Yang Telah Dibuat</p>
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
                                  Header: "Nama Project",
                                  accessor: "projectName",
                                  width: "25%",
                                },
                                {
                                  Header: "Provinsi",
                                  accessor: "kotaKabupaten.provinsi.name",
                                },
                                {
                                  Header: "Kabupaten / Kota",
                                  accessor: "kotaKabupaten.name",
                                },
                                {
                                  Header: "Modul Data",
                                  accessor: "totalModul",
                                },
                                {
                                  Header: "Status",
                                  accessor: "status",
                                  Cell: (row) =>
                                    row.cell.value ? (
                                      <label className="badge badge-success">
                                        Terpublikasi
                                      </label>
                                    ) : (
                                      <label className="badge badge-dark">
                                        Rancangan
                                      </label>
                                    ),
                                  /* Cell: (row) => (
                                    <div style={{ textAlign: "center" }}>
                                      {row.cell.value ? (
                                        <i
                                          className="ti-check text-success text-center"
                                          title="Terpublikasi"
                                        ></i>
                                      ) : (
                                        <i
                                          className="ti-close text-danger text-center"
                                          title="Rancangan"
                                        ></i>
                                      )}
                                    </div>
                                  ), */
                                },
                                {
                                  Header: "Privasi",
                                  accessor: "isPrivate",
                                  Cell: (row) => (
                                    <div style={{ textAlign: "center" }}>
                                      {row.cell.value ? (
                                        <i
                                          className="ti-lock text-danger text-center"
                                          title="Privat"
                                        ></i>
                                      ) : (
                                        <i
                                          className="ti-unlock text-success text-center"
                                          title="Publik"
                                        ></i>
                                      )}
                                    </div>
                                  ),
                                },
                                {
                                  Header: "Action",
                                  accessor: "id",
                                  width: "15%",
                                  disableGlobalFilter: true,
                                  Cell: (row) => (
                                    <div style={{ textAlign: "center" }}>
                                      {/* <Link
                                        to={{
                                          pathname: "/helpmanagement/edit",
                                          state: row.row.values,
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
                                      &nbsp; */}
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

export default DataManagement;
