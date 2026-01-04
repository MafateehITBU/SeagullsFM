import React, { useEffect, useMemo, useState } from "react";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { Icon } from "@iconify/react";
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSortUp, FaSortDown, FaSort } from "react-icons/fa";
import ProgramInterviews from "./ProgramInterviews.jsx";
import AddProgramModal from "./modals/Program/AddProgramModal.jsx";
import UpdateProgramModal from "./modals/Program/UpdateProgramModal.jsx";
import DeleteModal from "./modals/DeleteModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
  <input
    className="form-control w-100"
    value={globalFilter || ""}
    onChange={(e) => setGlobalFilter(e.target.value)}
    placeholder="Search Programs..."
  />
);

const ProgramsLayer = () => {
  const { user } = useAuth();
  const [allPrograms, setAllPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedProgramInterviews, setSelectedProgramInterviews] =
    useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchPrograms();
  }, [user?.channelId]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/program");
      const allPrograms = res.data.data || [];
      const filtered = allPrograms.filter(
        (n) => n.channelId?._id === user?.channelId
      );
      setAllPrograms(filtered);
      setPage(1);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(allPrograms.length / pageSize));
  const paginatedPrograms = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allPrograms.slice(start, start + pageSize);
  }, [allPrograms, page]);

  const handleActivation = async (programId) => {
    try {
      const res = await axiosInstance.put(
        `/program/${programId}/toggle-active`
      );
      toast.success(res.data.message, { position: "top-right" });
      fetchPrograms();
    } catch (error) {
      toast.error("Failed to Toggle Activation.", { position: "top-right" });
    }
  };

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
      { Header: "Day", accessor: "day" },
      { Header: "Start Time", accessor: "startTime" },
      { Header: "End Time", accessor: "endTime" },
      {
        Header: "Interviews",
        // btn that navigates to ProgramInterviews component with programId as prop
        Cell: ({ row }) => (
          <button
            className="btn btn-sm btn-info"
            onClick={() => setSelectedProgramInterviews(row.original)}
          >
            View Interviews
          </button>
        ),
      },
      {
        Header: "is Active",
        accessor: "isActive",
        Cell: ({ row, value }) => {
          const programId = row.original._id;
          const badgeColor = value ? "success" : "danger";
          const badgeText = value ? "Active" : "De-Activated";

          return (
            <div className="dropdown">
              <span
                className={`badge bg-${badgeColor} dropdown-toggle`}
                data-bs-toggle="dropdown"
                role="button"
                style={{ cursor: "pointer" }}
              >
                {badgeText}
              </span>
              <ul className="dropdown-menu">
                {value !== true && (
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleActivation(programId)}
                    >
                      Activate
                    </button>
                  </li>
                )}
                {value !== false && (
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => handleActivation(programId)}
                    >
                      De-Activate
                    </button>
                  </li>
                )}
              </ul>
            </div>
          );
        },
      },
      {
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex gap-2 justify-content-center">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setSelectedProgram(row.original);
                setShowUpdateModal(true);
              }}
            >
              <Icon icon="mdi:pencil" />
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => {
                setSelectedProgram(row.original);
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
  } = useTable(
    { columns, data: paginatedPrograms },
    useGlobalFilter,
    useSortBy
  );

  const noResultsAfterSearch =
    !loading && allPrograms.length > 0 && rows.length === 0;

  return (
    <div className="card basic-data-table" style={{ minHeight: "65vh" }}>
      <ToastContainer />

      {!selectedProgramInterviews && (
        <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <h5 className="card-title mb-0">Programs</h5>

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
              Add New Program
            </button>
          </div>
        </div>
      )}

      <div className="card-body p-0 d-flex flex-column">
        {loading ? (
          <div className="text-center p-4">Loading...</div>
        ) : allPrograms.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            No Programs found
          </div>
        ) : noResultsAfterSearch ? (
          <div className="text-center p-4 text-muted">
            No programs match your search.
          </div>
        ) : selectedProgramInterviews ? (
          <ProgramInterviews
            program={selectedProgramInterviews}
            channelId={user?.channelId}
            goBack={() => setSelectedProgramInterviews(null)}
          />
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

      <AddProgramModal
        channelId={user?.channelId}
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        fetchPrograms={fetchPrograms}
      />
      <UpdateProgramModal
        channelId={user?.channelId}
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        program={selectedProgram}
        fetchPrograms={fetchPrograms}
      />
      <DeleteModal
        show={showDeleteModal}
        handleClose={() => setShowDeleteModal(false)}
        item={selectedProgram}
        itemType="program"
        fetchData={fetchPrograms}
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

export default ProgramsLayer;
