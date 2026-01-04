import React, { useEffect, useState } from 'react';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { Icon } from '@iconify/react';
import axiosInstance from "../axiosConfig.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSortUp, FaSortDown, FaSort } from 'react-icons/fa';
import DeleteModal from './modals/DeleteModal.jsx';

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => (
    <input
        className="form-control w-100"
        value={globalFilter || ''}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search Users..."
    />
);

const UsersLayer = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');

    const pageSize = 10;

    useEffect(() => {
        fetchUsers();
    }, [page, search]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/user', {
                params: { page, limit: pageSize, search }
            });
            setUsers(res.data.data || []);
            setTotalPages(res.data.pagination?.totalPages || 1);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const columns = React.useMemo(() => [
        {
            Header: '#',
            Cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
            disableSortBy: true,
        },
        {
            Header: 'Photo',
            accessor: 'image',
            Cell: ({ value }) => (
                <img
                    src={value?.url}
                    alt="Profile"
                    style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
            ),
            disableSortBy: true,
        },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Email', accessor: 'email' },
        { Header: 'Phone', accessor: 'phoneNumber' },
        {
            Header: 'Actions',
            Cell: ({ row }) => (
                <div className="d-flex gap-2 justify-content-center">
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteUser(row.original)}
                    >
                        <Icon icon="mdi:delete" />
                    </button>
                </div>
            ),
            disableSortBy: true,
        },
    ], [page]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        rows,
        setGlobalFilter
    } = useTable(
        { columns, data: users },
        useGlobalFilter,
        useSortBy
    );

    useEffect(() => {
        setGlobalFilter(search);
    }, [search, setGlobalFilter]);

    return (
        <div className="card basic-data-table" style={{ minHeight: '65vh' }}>
            <ToastContainer />
            <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                <h5 className='card-title mb-0 flex-shrink-0 w-35 w-md-100 w-sm-100'>Users</h5>
                <div className="w-35 w-md-100 w-sm-100">
                    <GlobalFilter globalFilter={search} setGlobalFilter={setSearch} />
                </div>
            </div>

            <div className="card-body p-0 d-flex flex-column">
                {loading ? (
                    <div className="text-center p-4">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="text-center p-4">No Users found</div>
                ) : (
                    <>
                        <div className="table-responsive">
                            <table className="table bordered-table mb-0" {...getTableProps()}>
                                <thead>
                                    {headerGroups.map(headerGroup => (
                                        <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                                            {headerGroup.headers.map(column => (
                                                <th
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    style={{ textAlign: 'center', whiteSpace: 'nowrap' }}
                                                    key={column.id}
                                                >
                                                    {column.render('Header')}{' '}
                                                    {column.isSorted ? (
                                                        column.isSortedDesc ? <FaSortDown /> : <FaSortUp />
                                                    ) : (
                                                        <FaSort style={{ opacity: 0.3 }} />
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody {...getTableBodyProps()}>
                                    {rows.map(row => {
                                        prepareRow(row);
                                        return (
                                            <tr {...row.getRowProps()} key={row.id}>
                                                {row.cells.map(cell => (
                                                    <td
                                                        {...cell.getCellProps()}
                                                        key={cell.column.id}
                                                        style={{ textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}
                                                    >
                                                        {cell.render('Cell')}
                                                    </td>
                                                ))}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Backend Pagination */}
                        <div className="d-flex justify-content-end mt-auto px-3 pb-4">
                            <ul className="pagination mb-0">
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(prev => Math.max(prev - 1, 1))}>Prev</button>
                                </li>
                                {[...Array(totalPages).keys()].map(p => (
                                    <li key={p} className={`page-item ${p + 1 === page ? 'active' : ''}`}>
                                        <button className="page-link" onClick={() => setPage(p + 1)}>{p + 1}</button>
                                    </li>
                                ))}
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                    <button className="page-link" onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}>Next</button>
                                </li>
                            </ul>
                        </div>
                    </>
                )}
            </div>

            <DeleteModal
                show={showDeleteModal}
                handleClose={() => setShowDeleteModal(false)}
                item={selectedUser}
                itemType="user"
                fetchData={fetchUsers}
            />
        </div>
    );
};

export default UsersLayer;