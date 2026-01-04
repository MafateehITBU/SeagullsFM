import { useEffect, useState, useMemo } from "react";
import { useTable, useGlobalFilter, useSortBy } from "react-table";
import { Icon } from "@iconify/react";
import axiosInstance from "../axiosConfig";
import { ToastContainer, toast } from "react-toastify";
import { Card } from "react-bootstrap";
import "react-toastify/dist/ReactToastify.css";
import AddInterviewModal from "./modals/Program/AddInterviewModal.jsx";
import UpdateInterviewModal from "./modals/Program/UpdateInterviewModal.jsx";
import DeleteModal from "./modals/DeleteModal";

const GlobalFilter = ({ globalFilter, onChange }) => (
  <input
    className="form-control w-100"
    value={globalFilter || ""}
    onChange={(e) => onChange(e.target.value)}
    placeholder="Search Interviews..."
  />
);

const ProgramInterviews = ({ program, channelId }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch interviews
  useEffect(() => {
    fetchInterviews();
  }, [channelId, program]);

  const fetchInterviews = async () => {
    if (!program?._id) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get("/interview");
      const allInterviews = res.data.data;
      //   Filter by program ID and channel ID
      const filtered = allInterviews.filter(
        (app) =>
          app.programId._id === program._id &&
          (!channelId || app.channelId._id === channelId)
      );
      setInterviews(filtered);
      setPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch interviews.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(interviews.length / pageSize));
  const paginatedInterviews = useMemo(() => {
    const start = (page - 1) * pageSize;
    return interviews.slice(start, start + pageSize);
  }, [interviews, page]);

  const handleDeleteInterview = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteModal(true);
  };

  const columns = useMemo(
    () => [
      { Header: "#", Cell: ({ row }) => (page - 1) * pageSize + row.index + 1 },
      { Header: "Title", accessor: "title" },
      {
        Header: "Date",
        accessor: (row) => new Date(row.date).toLocaleDateString(),
      },
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
      {
        Header: "Content",
        accessor: "content",
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
        Header: "Actions",
        Cell: ({ row }) => (
          <div className="d-flex align-items-center justify-content-center gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => {
                setSelectedInterview(row.original);
                setShowUpdateModal(true);
              }}
            >
              <Icon icon="mdi:pencil" />
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteInterview(row.original)}
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
    { columns, data: paginatedInterviews },
    useGlobalFilter,
    useSortBy
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    setGlobalFilter(value);
  };

  return (
    <div>
      {/* Program Card Details */}
      {program && (
        <Card key={program._id} className="mb-3 shadow-sm border-0 rounded-3">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-around flex-wrap gap-3">
              {/* Program Image */}
              <img
                src={program.image?.url}
                alt={program.title}
                style={{
                  height: 200,
                  borderRadius: "6px",
                  objectFit: "cover",
                  border: "1px solid #ddd",
                }}
              />

              {/* Title + Description */}
              <div>
                <h5 className="fw-bold mb-3">
                  {program.title || "Untitled Program"}
                </h5>
                <p className="mb-0 text-muted medium">
                  {program.description || "No Description"}
                </p>
              </div>

              {/* Day + Time */}
              <div className="text-end text-muted medium">
                <div>{program.day || "N/A"}</div>
                <div>
                  {program.startTime || "N/A"} - {program.endTime || "N/A"}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <div
        className="card basic-data-table"
        style={{ minHeight: "65vh", display: "flex", flexDirection: "column" }}
      >
        <ToastContainer />

        {/* Header */}
        <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <a href="/programs" className="text-blue-600">
            &larr; Back to Programs
          </a>
          <div className="w-35 w-md-100 w-sm-100">
            <GlobalFilter
              globalFilter={state.globalFilter}
              onChange={handleSearchChange}
            />
          </div>

          <div className="w-35 w-md-100 w-sm-100">
            <button
              className="btn btn-success w-100 w-md-auto"
              onClick={() => setShowAddModal(true)}
            >
              Add New Interview
            </button>
          </div>
        </div>

        {/* Table + Pagination */}
        <div className="card-body p-0 d-flex flex-column flex-grow-1">
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : rows.length === 0 ? (
            <div className="text-center p-4">No interviews found</div>
          ) : (
            <div className="d-flex flex-column flex-grow-1">
              {/* Table */}
              <div className="table-responsive flex-grow-1">
                <table
                  className="table bordered-table mb-0"
                  {...getTableProps()}
                >
                  <thead>
                    {headerGroups.map((headerGroup) => (
                      <tr
                        {...headerGroup.getHeaderGroupProps()}
                        key={headerGroup.id}
                      >
                        {headerGroup.headers.map((column) => (
                          <th
                            {...column.getHeaderProps(
                              column.getSortByToggleProps()
                            )}
                            key={column.id}
                            className="text-center px-3 py-2"
                          >
                            {column.render("Header")}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>

                  <tbody {...getTableBodyProps()}>
                    {rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          key={row.original._id || row.id}
                          className="hover:bg-gray-50 transition"
                        >
                          {row.cells.map((cell) => (
                            <td
                              {...cell.getCellProps()}
                              key={cell.column.id}
                              className="text-center px-3 py-2 align-middle"
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
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <AddInterviewModal
        channelId={channelId}
        programId={program?._id}
        show={showAddModal}
        handleClose={() => setShowAddModal(false)}
        fetchInterviews={fetchInterviews}
      />
      <UpdateInterviewModal
        channelId={channelId}
        show={showUpdateModal}
        handleClose={() => setShowUpdateModal(false)}
        interview={selectedInterview}
        fetchInterviews={fetchInterviews}
      />

        <DeleteModal
          show={showDeleteModal}
          handleClose={() => setShowDeleteModal(false)}
          item={selectedInterview}
          itemType="interview"
          fetchData={fetchInterviews}
        />
      </div>
    </div>
  );
};

export default ProgramInterviews;
