import React, { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { Icon } from "@iconify/react";
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import DeleteModal from "./modals/DeleteModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <input
    className="form-control w-100"
    value={globalFilter || ""}
    onChange={(e) => setGlobalFilter(e.target.value)}
    placeholder="Search Advertisement Requests..."
  />
);

const AdvertisementLayer = () => {
  const { user } = useAuth();
  const [allAds, setAllAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchAds();
  }, [user?.channelId]);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/ad");
      const allAds = res.data.data || [];
      const filtered = allAds.filter(
        (e) => e.channelId?._id === user?.channelId
      );
      setAllAds(filtered);
      setPage(1);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allAds.length / pageSize));
  const paginatedAds = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allAds.slice(start, start + pageSize);
  }, [allAds, page]);
  const columns = useMemo(
    () => [
      {
        Header: "#",
        Cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Email", accessor: "email" },
      { Header: "Phone", accessor: "phoneNumber" },
      {
        Header: "Message",
        accessor: (row) => row.message || "-",
        Cell: ({ value }) => (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "250px",
              whiteSpace: "normal",
              wordBreak: "break-word",
              textAlign: "center",
              margin: "0 auto",
            }}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                setSelectedAd(row.original);
                setShowDeleteModal(true);
              }}
            >
              <Icon icon="mdi:delete" />
            </button>
          </div>
        ),
      },
    ],
    [page]
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    state,
    setGlobalFilter,
  } = useTable({ columns, data: paginatedAds }, useGlobalFilter, useSortBy);

  const noResultsAfterSearch =
    !loading && allAds.length > 0 && rows.length === 0;

  return (
    <div className="card basic-data-table" style={{ minHeight: "65vh" }}>
      <ToastContainer />

      <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <h5 className="card-title mb-0">Advertisement Requests</h5>

        <div className="w-35 w-md-100 w-sm-100">
          <GlobalFilter
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>
      </div>

      <div className="card-body p-0 d-flex flex-column">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : allAds.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            No Advertisement Requests found
          </div>
        ) : noResultsAfterSearch ? (
          <div className="text-center p-4 text-muted">
            No advertisement requests match your search.
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table bordered-table mb-0" {...getTableProps()}>
                <thead>
                  {headerGroups.map((hg) => (
                    <tr {...hg.getHeaderGroupProps()} key={hg.id}>
                      {hg.headers.map((col) => (
                        <th
                          {...col.getHeaderProps(col.getSortByToggleProps())}
                          key={col.id}
                          style={{ textAlign: "center", whiteSpace: "nowrap" }}
                        >
                          {col.render("Header")}{" "}
                          {col.isSorted ? (
                            col.isSortedDesc ? (
                              <FaSortDown />
                            ) : (
                              <FaSortUp />
                            )
                          ) : (
                            <FaSort style={{ opacity: 0.3 }} />
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} key={row.id}>
                        {row.cells.map((cell) => (
                          <td
                            {...cell.getCellProps()}
                            key={cell.column.id}
                            style={{
                              textAlign: "center",
                              verticalAlign: "middle",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex justify-content-end mt-auto px-3 pb-4">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    Prev
                  </button>
                </li>
                {[...Array(totalPages).keys()].map((p) => (
                  <li
                    key={p}
                    className={`page-item ${p + 1 === page ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setPage(p + 1)}
                    >
                      {p + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      <DeleteModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        item={selectedAd}
        itemType="ad"
        fetchData={fetchAds}
      />

    </div>
  );
};

export default AdvertisementLayer;
