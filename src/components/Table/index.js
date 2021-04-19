import React from "react";
import { useTable, useSortBy, usePagination } from "react-table";
import { useHistory } from "react-router-dom";
// import Cookie from "js-cookie";
// import { generalUserLogoutAction } from "../../redux/actions/generalActions";
// import DateRangePicker from '@wojtekmaj/react-daterange-picker';

function Table({
  routeAdd,
  columns,
  data,
  fetchData,
  pageCount: controlledPageCount,
  pI,
  recordsFiltered,
  recordsTotal,
  routeApprove,
  nameApprove,
  filterStatus,
  filterTenant,
//   filterDate
searchVal,
processCounter
}) {
  const [valueFilter, setvalueFilter] = React.useState("");
  const [valueStatus, setValueStatus] = React.useState("");
  const [valueTenant, setValueTenant] = React.useState("");
  const [navPagination, setNavPagination] = React.useState("");
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 7)
  const [valueDate, setValueDate] = React.useState([yesterday,today])
  let history = useHistory();

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize, sortBy },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: pI },
      manualPagination: true,
      manualSortBy: true,
      pageCount: controlledPageCount,
    },
    useSortBy,
    usePagination
  );

  const num = [];
  for (
    var i = pageSize * (pageIndex + 1) - pageSize + 1;
    i <= pageSize * (pageIndex + 1);
    i++
  ) {
    num.push(i);
  }

  const handleAdd = (routeAdd) => {
    history.push(routeAdd);
  };

  const handleApprove = (routeApprove) => {
    history.push(routeApprove);
  };

  React.useEffect(() => {
    let pageOptLength = pageOptions.length;
    fetchData({
      pageIndex,
      pageSize,
      valueFilter,
      navPagination,
      pageOptLength,
      valueStatus,
      valueTenant,
      valueDate,
      sortBy,
      searchVal,
      processCounter
    });
  }, [
    fetchData,
    pageIndex,
    pageSize,
    valueFilter,
    navPagination,
    pageOptions,
    valueStatus,
    valueTenant,
    valueDate,  
    sortBy,
    history,
    searchVal,
    processCounter
  ]);

  // Render the UI for your table
  return (
    <>
      <div className="card-header" style={{display: "none"}}>
        <div className="d-flex justify-content-between row">
          <span className="card-title" style={{float:"right"}}>
            { 
              routeAdd ? 
              <button
              type="button"
              className="btn btn-primary btn-flat mr-2"
              onClick={() => handleAdd(routeAdd)}
              >
                <span>
                  <i className="fas fa-plus-circle mr-2"></i>&nbsp;
                </span>
                Add
              </button>
              :
              null
            }
            { 
              routeApprove ? 
              <button
              type="button"
              className="btn btn-info btn-flat mr-2"
              onClick={() => handleApprove(routeApprove)}
              >
                <span>
                  <i className="fas fa-check-circle mr-2"></i>&nbsp;
                </span>
                {nameApprove ? nameApprove : 'Approve'}
              </button>
              :
              null
            }          
          </span>
          {/* filter disini */}
          
          {/* { 
              filterDate ? 
              <div className="col-6 row">
                <label
                  className="col-3 pt-2"
                >
                Date Periode
              </label>
                <DateRangePicker style={{paddingTop:"15px !important", float:"right"}}
                  onChange={setValueDate}
                  value={valueDate}
                  format="dd-MM-y"
                />
              </div>
              : 
              null
            }  */} 
          <div className="col-6 row" style={{float:"right"}}>
              { 
                (filterTenant && filterTenant.length) ?
                  <div className={
                    (filterStatus && filterStatus.length) ? 
                      (filterTenant && filterTenant.length) ?
                        "input-group col-4" : "input-group col-6"
                      :  "input-group col-6"
                    }
                  >
                    <div className="input-group-prepend ml-2">
                      <select 
                        className="form-control"
                          // data={filterStatus}
                          placeholder="Select Site"                         
                          onChange={e => {
                            setValueTenant(e.target.value ? e.target.value : null);
                          }}
                        >
                          {filterTenant.map((t) => <option key={t.name} value={t.id}>
                            {t.name}
                        </option>)}
                      </select>
                    </div>
                  </div>
                  : <div className={ (filterStatus && filterStatus.length) ? "null" : "col-3"}></div>
              } 
              { 
                (filterStatus && filterStatus.length) ?
                  <div className={
                    (filterStatus && filterStatus.length) ? 
                      (filterTenant && filterTenant.length) ?
                        "input-group col-4" : "input-group col-6"
                      :  "input-group col-6"
                    }
                  >
                    <div className="input-group-prepend ml-2">
                    <select 
                      className="form-control"
                        // data={filterStatus}
                        placeholder="Select Status"                         
                        onChange={e => {
                          setValueStatus(e.target.value);
                        }}
                      >
                        {filterStatus.map((f) => <option key={f.value} value={f.value}>
                          {f.id}
                      </option>)}
                    </select>
                  </div>
                  </div>
                  : <div className={ (filterTenant && filterTenant.length) ? null : "col-3"}></div>
              } 
            <div className={
              (filterStatus && filterStatus.length) ? 
                (filterTenant && filterTenant.length) ?
                  "input-group col-4" : "input-group col-6"
                :  "input-group col-6"
              }>
              <input
                type="text"
                className="form-control"
                value={valueFilter || ""}
                onChange={(e) => {
                  setvalueFilter(e.target.value);
                }}
                placeholder={`Search.....`}
              />
              <div className="input-group-append">
                <span className="input-group-text">
                  <i className="fas fa-search" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <table
          {...getTableProps()}
          className="table table-striped table-responsive"
        >
          <thead className="text-center">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    width={column.width}
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  >
                    {column.render("Header")}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()}>
                        {cell.column.Header === "No"
                          ? num[i]
                          : cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card-footer clearfix">
        <ul className="pagination pagination-sm m-0 float-right">
          <li className="page-item">
            <button
              type="button"
              className={
                canPreviousPage
                  ? "btn btn-block btn-default btn-flat"
                  : "btn btn-block btn-default btn-flat disabled"
              }
              onClick={() => gotoPage(0)}
            >
              {"First"}
            </button>{" "}
          </li>
          <li className="page-item">
            <button
              type="button"
              className={
                canPreviousPage
                  ? "btn btn-block btn-default btn-flat"
                  : "btn btn-block btn-default btn-flat disabled"
              }
              onClick={() => previousPage()}
            >
              {"<"}
            </button>{" "}
          </li>
          <li className="page-item">
            <button
              type="button"
              className={
                canNextPage
                  ? "btn btn-block btn-default btn-flat"
                  : "btn btn-block btn-default btn-flat disabled"
              }
              onClick={() => {
                setNavPagination("Y");
                nextPage();
              }}
            >
              {">"}
            </button>{" "}
          </li>
          <li className="page-item">
            <button
              type="button"
              className={
                canNextPage
                  ? "btn btn-block btn-default btn-flat"
                  : "btn btn-block btn-default btn-flat disabled"
              }
              onClick={() => gotoPage(pageCount - 1)}
            >
              {"Last"}
            </button>{" "}
          </li>
        </ul>
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>{" "}
        </span>
        <span>
          | Show{" "}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </span>
        <span>
          {" "}
          of{" "}
          {recordsFiltered === recordsTotal && (
            <>
              <strong>{recordsTotal}</strong>
              {" total entries"}
            </>
          )}
          {recordsFiltered !== recordsTotal && (
            <>
              <strong>{recordsFiltered}</strong>
              {" entries (filtered from "}
              <strong>{recordsTotal}</strong>
              {" total entries)"}
            </>
          )}
        </span>
      </div>
    </>
  );
}

export default Table;
