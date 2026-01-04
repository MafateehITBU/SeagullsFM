import React, { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { Icon } from "@iconify/react";
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import AddNewsModal from "./modals/News/AddNewsModal.jsx";
import UpdateNewsModal from "./modals/News/UpdateNewsModal.jsx";
import DeleteModal from "./modals/DeleteModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <input
    className="form-control w-100"
    value={globalFilter || ""}
    onChange={(e) => setGlobalFilter(e.target.value)}
    placeholder="Search News..."
  />
);

const NewsLayer = () => {
  const { user } = useAuth();
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchNews();
  }, [user?.channelId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/news");
      const allNews = res.data.data || [];
      const filtered = allNews.filter(
        (n) => n.channelId?._id === user?.channelId
      );
      setAllNews(filtered);
      setPage(1);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allNews.length / pageSize));
  const paginatedNews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allNews.slice(start, start + pageSize);
  }, [allNews, page]);

  const columns = useMemo(
    () => [
      {
        Header: "#",
        Cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      },
      {
        Header: "Photo",
        accessor: "image",
        Cell: ({ value }) => (
          <img
            src={value?.url}
            alt="Profile"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={() => setPreviewImage(value?.url)}
          />
        ),
      },
      { Header: "Title", accessor: "title" },
      {
        Header: "Description",
        accessor: (row) => row.description || "-",
        Cell: ({ value }) => (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "400px",
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
        Header: "Content",
        accessor: (row) => row.content || "-",
        Cell: ({ value }) => (
          <span
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              maxWidth: "400px",
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
              className="btn btn-sm btn-primary"
              onClick={() => {
                setSelectedNews(row.original);
                setShowUpdateModal(true);
              }}
            >
              <Icon icon="mdi:pencil" />
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                setSelectedNews(row.original);
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
  } = useTable({ columns, data: paginatedNews }, useGlobalFilter, useSortBy);

  const noResultsAfterSearch =
    !loading && allNews.length > 0 && rows.length === 0;

  return (
    <div className="card basic-data-table" style={{ minHeight: "65vh" }}>
      <ToastContainer />

      <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <h5 className="card-title mb-0">News</h5>

        <div className="w-35 w-md-100 w-sm-100">
          <GlobalFilter
            globalFilter={state.globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        </div>

        <div className="w-35 w-md-100 w-sm-100">
          <button
            className="btn btn-success w-100 w-md-auto"
            onClick={() => setShowAddModal(true)}
          >
            Add New News
          </button>
        </div>
      </div>

      <div className="card-body p-0 d-flex flex-column">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : allNews.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            No News found
          </div>
        ) : noResultsAfterSearch ? (
          <div className="text-center p-4 text-muted">
            No news match your search.
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

      <AddNewsModal
        channelId={user?.channelId}
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        fetchNews={fetchNews}
      />
      <UpdateNewsModal
        channelId={user?.channelId}
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        news={selectedNews}
        fetchNews={fetchNews}
      />
      <DeleteModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        item={selectedNews}
        itemType="news"
        fetchData={fetchNews}
      />

      {/*IMAGE PREVIEW OVERLAY */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "90%",
              maxHeight: "90%",
            }}
          >
            <button
              onClick={() => setPreviewImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: 0,
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 32,
                cursor: "pointer",
              }}
            >
              ×
            </button>

            <img
              src={previewImage}
              alt="Preview"
              style={{
                width: "100%",
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsLayer;
