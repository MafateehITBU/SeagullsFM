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
    placeholder="Search Tracks..."
  />
);

const UploadedTracksLayer = () => {
  const { user } = useAuth();
  const [allTracks, setAllTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [approveTrackId, setApproveTrackId] = useState(null);
  const [approveDate, setApproveDate] = useState("");
  const [approveTime, setApproveTime] = useState("");
  const [approveError, setApproveError] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchTracks();
  }, [user?.channelId]);

  const fetchTracks = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/uploadtrack");
      const allTracks = res.data.data || [];
      const filtered = allTracks.filter(
        (e) => e.channelId?._id === user?.channelId
      );
      setAllTracks(filtered);
      setPage(1);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (trackId, newStatus) => {
    if (newStatus === "Approved") {
      setApproveTrackId(trackId);
      setApproveDate("");
      setApproveTime("");
      setApproveError("");
      setShowApproveModal(true);
      return;
    }

    try {
      await axiosInstance.put(`/uploadtrack/${trackId}/status`, {
        status: newStatus,
      });
      toast.success("Track status updated successfully");
      fetchTracks();
    } catch (error) {
      toast.error("Failed to update track status");
    }
  };

  const submitApproval = async () => {
    if (!approveDate || !approveTime) {
      setApproveError("Date and time are required");
      return;
    }

    const selectedDateTime = new Date(`${approveDate}T${approveTime}`);
    if (selectedDateTime <= new Date()) {
      setApproveError("Date and time must be in the future");
      return;
    }

    try {
      await axiosInstance.post(`/uploadtrack/${approveTrackId}/approve`, {
        date: approveDate,
        time: approveTime,
      });

      toast.success("Track approved successfully");
      setShowApproveModal(false);
      setApproveTrackId(null);
      fetchTracks();
    } catch (error) {
      toast.error("Failed to approve track");
    }
  };

  const totalPages = Math.max(1, Math.ceil(allTracks.length / pageSize));
  const paginatedTracks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return allTracks.slice(start, start + pageSize);
  }, [allTracks, page]);
  const columns = useMemo(
    () => [
      {
        Header: "#",
        Cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      },
      { Header: "Singer", accessor: "userId.name" },
      { Header: "Song Name", accessor: "songName" },
      {
        Header: "Genre",
        accessor: "genre",
        Cell: ({ value }) => (value ? value.join(", ") : "-"),
      },
      {
        Header: "Track",
        accessor: "songFile",
        Cell: ({ value }) => {
          if (value && value.resource_type === "video") {
            return (
              <video width="150" height="100" controls>
                <source src={value.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            );
          } else if (value && value.resource_type === "audio") {
            const isPlaying = playingAudio === value.url;

            return (
              <div className="d-flex align-items-center justify-content-center gap-2">
                <button
                  className={`btn btn-sm ${
                    isPlaying ? "btn-danger" : "btn-primary"
                  }`}
                  onClick={() => {
                    if (isPlaying) {
                      setPlayingAudio(null);
                    } else {
                      setPlayingAudio(value.url);
                    }
                  }}
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>

                {isPlaying && (
                  <audio autoPlay onEnded={() => setPlayingAudio(null)}>
                    <source src={value.url} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            );
          } else {
            return "N/A";
          }
        },
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ row, value }) => {
          const adminId = row.original._id;

          let badgeColor, badgeText;
          switch (value) {
            case "Pending":
              badgeColor = "warning";
              badgeText = "Pending";
              break;
            case "Checked":
              badgeColor = "info";
              badgeText = "Checked";
              break;
            case "Approved":
              badgeColor = "success";
              badgeText = "Approved";
              break;
            case "Declined":
              badgeColor = "danger";
              badgeText = "Declined";
              break;
            default:
              badgeColor = "secondary";
              badgeText = "Unknown";
          }

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
                {["Pending", "Checked", "Approved", "Declined"].map(
                  (statusOption) => (
                    <li key={statusOption}>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          handleUpdateStatus(row.original._id, statusOption)
                        }
                      >
                        {statusOption.charAt(0).toUpperCase() +
                          statusOption.slice(1)}
                      </button>
                    </li>
                  )
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
              className="btn btn-sm btn-danger"
              onClick={() => {
                setSelectedTrack(row.original);
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
  } = useTable({ columns, data: paginatedTracks }, useGlobalFilter, useSortBy);

  const noResultsAfterSearch =
    !loading && allTracks.length > 0 && rows.length === 0;

  return (
    <div className="card basic-data-table" style={{ minHeight: "65vh" }}>
      <ToastContainer />

      <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
        <h5 className="card-title mb-0">Uploaded Tracks</h5>

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
        ) : allTracks.length === 0 ? (
          <div className="d-flex justify-content-center align-items-center p-4">
            No Uploaded Tracks found
          </div>
        ) : noResultsAfterSearch ? (
          <div className="text-center p-4 text-muted">
            No uploaded tracks match your search.
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
        item={selectedTrack}
        itemType="uploadtrack"
        fetchData={fetchTracks}
      />

      {showApproveModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered modal-md">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Approval</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowApproveModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={approveDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setApproveDate(e.target.value)}
                  />
                </div>

                <div className="mb-2">
                  <label className="form-label">Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={approveTime}
                    onChange={(e) => setApproveTime(e.target.value)}
                  />
                </div>

                {approveError && (
                  <div className="text-danger small mt-2">{approveError}</div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowApproveModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success btn-sm"
                  onClick={submitApproval}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadedTracksLayer;
