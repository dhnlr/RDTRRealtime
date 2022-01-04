import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import axios from "../../axiosConfig";
import Swal from "sweetalert2";

import { Header, Menu, Footer, Table, TableLoading } from "../../components";

import { config } from "../../Constants";
import Cookies from "js-cookie";

function UserManagement() {
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
    history.push("/usermanagement/create");
  }

  useEffect(() => {
    if (JSON.parse(Cookies.get("permissions")).indexOf("Users") === -1)
      history.goBack();
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
          setIsProcessing(true);
          const datas = await axios.get(config.url.API_URL + "/User/List", {
            params: {
              "input.pageSize": pageSize,
              "input.page": pageIndexTbl + 1,
              "input.orderProperty": sort,
              "input.orderType": orderType,
              "input.keyword": searchVal,
            },
          });

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
        title: "Hapus Pengguna",
        text: "Pengguna yang dihapus tidak dapat dikembalikan. Apakah Anda yakin untuk menghapus pengguna?",
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
            .delete(config.url.API_URL + "/User/Delete", {
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
            })
            .catch((error) =>
              Swal.fire(
                "Maaf",
                error.response?.data?.status?.message
                  ? error.response?.data?.status?.message
                  : "Gagal menghapus pengguna. Silahkan coba beberapa saat lagi.",
                "error"
              )
            );
        }
      });
    } catch (errorForm) {
      Swal.fire("Maaf", errorForm.response.data.error.message, "error");
    }
  };

  const handleConfirm = (id) => {
    Swal.fire({
      title: "Konfirmasi Pengguna",
      text: "Apakah Anda yakin untuk mengkonfirmasi pengguna?",
      icon: "question",
      showCancelButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText: "Ya, konfirmasi!",
      cancelButtonText: "Batal",
    })
      .then((action) => {
        if (action.isConfirmed) {
          axios
            .post(config.url.API_URL + "/User/ConfirmAccountById", null, {
              params: {
                id,
              },
            })
            .then(() => {
              Swal.fire({
                title: "Berhasil",
                text: "Pengguna berhasil dikonfirmasi",
                icon: "success",
                confirmButtonText: "Selesai",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                  setProcessCounter(processCounter + 1);
                }
              });
            })
            .catch((error) =>
              Swal.fire(
                "Maaf",
                error.response?.data?.status?.message
                  ? error.response?.data?.status?.message
                  : "Gagal mengkonfirmasi pengguna. Silahkan coba beberapa saat lagi.",
                "error"
              )
            );
        }
      })
      .catch((errorForm) => {
        Swal.fire("Maaf", errorForm.response.data.error.message, "error");
      });
  };

  const handleUnlock = (id) => {
    Swal.fire({
      title: "Izin Akses Pengguna",
      text: "Apakah Anda yakin untuk memberi izin akses kepada pengguna?",
      icon: "question",
      showCancelButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText: "Ya, izinkan!",
      cancelButtonText: "Batal",
    })
      .then((action) => {
        if (action.isConfirmed) {
          axios
            .post(config.url.API_URL + "/User/ActivateAccountById", null, {
              params: {
                id,
              },
            })
            .then(() => {
              Swal.fire({
                title: "Berhasil",
                text: "Pengguna berhasil diizinkan",
                icon: "success",
                confirmButtonText: "Selesai",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                  setProcessCounter(processCounter + 1);
                }
              });
            })
            .catch((error) =>
              Swal.fire(
                "Maaf",
                error.response?.data?.status?.message
                  ? error.response?.data?.status?.message
                  : "Gagal mengganti izin pengguna. Silahkan coba beberapa saat lagi.",
                "error"
              )
            );
        }
      })
      .catch((errorForm) => {
        Swal.fire("Maaf", errorForm.response.data.error.message, "error");
      });
  };

  const handleResetPassword = ({ email }) => {
    Swal.fire({
      title: "Ubah Kata Sandi Pengguna",
      text: "Apakah Anda yakin untuk mengubah kata sandi pengguna?",
      icon: "question",
      showCancelButton: true,
      showLoaderOnConfirm: true,
      confirmButtonText: "Ya, ubah kata sandi!",
      cancelButtonText: "Batal",
    })
      .then((action) => {
        if (action.isConfirmed) {
          axios
            .put(config.url.API_URL + "/User/ResetPasswordByEmail", null, {
              params: {
                email,
              },
            })
            .then(() => {
              Swal.fire({
                title: "Berhasil",
                text: "Kata sandi pengguna berhasil diubah",
                icon: "success",
                confirmButtonText: "Selesai",
                allowOutsideClick: false,
              }).then((result) => {
                if (result.value) {
                  setProcessCounter(processCounter + 1);
                }
              });
            })
            .catch((error) =>
              Swal.fire(
                "Maaf",
                error.response?.data?.status?.message
                  ? error.response?.data?.status?.message
                  : "Gagal mengganti sandi pengguna. Silahkan coba beberapa saat lagi.",
                "error"
              )
            );
        }
      })
      .catch((errorForm) => {
        Swal.fire("Maaf", errorForm.response.data.error.message, "error");
      });
  };

  return (
    <div className="container-scroller">
      <Header />
      <div className="container-fluid page-body-wrapper">
        <Menu active="usermanagement" />
        <div className="main-panel">
          <div className="content-wrapper">
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
                    placeholder="Cari pengguna"
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
                {/* <img className="mr-2" src={buildingIcon} alt="building icon" style={{ float: "left", width: "3rem" }} /> */}
                <p>
                  <span
                    className="font-weight-bold ml-1 mr-1 align-middle"
                    style={{ fontSize: 20 }}
                  >
                    Manajemen Pengguna
                  </span>
                  <button
                    className="btn btn-success ml-2"
                    onClick={() => {
                      goInputSimulasi();
                    }}
                  >
                    Buat Pengguna
                  </button>
                </p>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 grid-margin stretch-card my-4">
                <div className="card">
                  <div className="card-body">
                    {/* <p className="card-title">Simulasi Anda</p> */}
                    <div className="row">
                      <div className="col-12">
                        <div className="table-responsive">
                          {isProcessing && data.length === 0 && (
                            <TableLoading />
                          )}

                          {
                            <div>
                              <Table
                                routeAdd="/user/add"
                                // filterTenant={site}
                                columns={[
                                  {
                                    Header: "Email",
                                    accessor: "email",
                                    width: "20%",
                                  },
                                  {
                                    Header: "Username",
                                    accessor: "userName",
                                    width: "10%",
                                  },
                                  {
                                    Header: "Peran",
                                    accessor: "roles[0].name",
                                    width: "10%",
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
                                    Header: "Status Konfirmasi",
                                    accessor: "emailConfirmed",
                                    width: "10%",
                                    Cell: (row) =>
                                      row.cell.value ? (
                                        <label className="badge badge-success">
                                          Terkonfirmasi
                                        </label>
                                      ) : (
                                        <label className="badge badge-danger">
                                          Belum Dikonfirmasi
                                        </label>
                                      ),
                                  },
                                  {
                                    Header: "Status Izin",
                                    accessor: "lockoutEnabled",
                                    width: "10%",
                                    Cell: (row) =>
                                      row.cell.value ? (
                                        <label className="badge badge-danger">
                                          Belum Diizinkan
                                        </label>
                                      ) : (
                                        <label className="badge badge-success">
                                          Diizinkan
                                        </label>
                                      ),
                                  },
                                  {
                                    Header: "",
                                    accessor: "id",
                                    width: "25%",
                                    disableGlobalFilter: true,
                                    Cell: (row) => (
                                      <div style={{ textAlign: "right" }}>
                                        {!row.row.values.emailConfirmed && (
                                          <>
                                            <button
                                              className="btn btn-outline-dark btn-xs icons-size-16px"
                                              title="Konfirmasi"
                                              onClick={() =>
                                                handleConfirm(row.row.values.id)
                                              }
                                            >
                                              <span>
                                                <i className="ti-id-badge"></i>
                                              </span>
                                            </button>
                                            &nbsp;
                                          </>
                                        )}
                                        {row.row.values.lockoutEnabled && (
                                          <>
                                            <button
                                              className="btn btn-outline-dark btn-xs icons-size-16px"
                                              title="Izin Akses"
                                              onClick={() =>
                                                handleUnlock(row.row.values.id)
                                              }
                                            >
                                              <span>
                                                <i className="ti-key"></i>
                                              </span>
                                            </button>
                                            &nbsp;
                                          </>
                                        )}
                                        <button
                                          className="btn btn-outline-dark btn-xs"
                                          title="Ubah Kata Sandi"
                                          onClick={() =>
                                            handleResetPassword(row.row.values)
                                          }
                                        >
                                          <span>
                                            <i className="ti-unlock"></i>
                                          </span>
                                        </button>
                                        &nbsp;
                                        <Link
                                          to={{
                                            pathname: "/usermanagement/edit",
                                            state: row.row.values,
                                          }}
                                        >
                                          <button
                                            className="btn btn-outline-dark btn-xs"
                                            title="Ubah" /* onClick={() =>  console.log(row.row.values, pI)} */
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
                          }
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

export default UserManagement;
