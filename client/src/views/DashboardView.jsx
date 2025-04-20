// Main view showing the issue table
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Container, Table, Spinner, Alert, Button, Form, InputGroup } from 'react-bootstrap';
import { fetchIssues } from '../api/axiosClient';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

// Utility to format date strings nicely
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid Date';
  }
};

function DashboardView() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- TanStack Table State ---
  const [sorting, setSorting] = useState([]); // Manages column sorting
  const [globalFilter, setGlobalFilter] = useState(''); // Manages the global search filter

  // --- TanStack Table Column Definitions ---
  // Defined using useMemo for performance
  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', enableSorting: true },
      { accessorKey: 'title', header: 'Title', enableSorting: true },
      { accessorKey: 'status', header: 'Status', enableSorting: true },
      { accessorKey: 'priority', header: 'Priority', enableSorting: true },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: info => formatDate(info.getValue()), // Format the date cell
        enableSorting: true,
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false, // Actions column shouldn't be sortable
        cell: ({ row }) => ( // Render a link/button for each row
          <Button
            as={Link}
            to={`/issues/${row.original.id}`}
            variant="outline-primary"
            size="sm"
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  // --- Fetch Issues on component mount ---
  useEffect(() => {
    const getIssues = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchIssues();
        setIssues(data);
      } catch (err) {
        setError(err.message || 'Failed to load issues. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    getIssues();
  }, []);

  // --- TanStack Table Instance Setup ---
  const table = useReactTable({
    data: issues,
    columns,
    state: { sorting, globalFilter }, // Connect table state
    onSortingChange: setSorting, // Allow sorting updates
    onGlobalFilterChange: setGlobalFilter, // Allow global filter updates
    getCoreRowModel: getCoreRowModel(), // Core row model logic
    getSortedRowModel: getSortedRowModel(), // Enable sorting
    getFilteredRowModel: getFilteredRowModel(), // Enable filtering
  });

  // --- Render Logic ---

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p>Loading issues...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Issues</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <h1 className="my-4">Issue Dashboard</h1>

      {/* Global filter input */}
      <InputGroup className="mb-3">
        <InputGroup.Text>Filter:</InputGroup.Text>
        <Form.Control
          placeholder="Search all columns..."
          value={globalFilter ?? ''}
          onChange={e => setGlobalFilter(e.target.value)}
        />
      </InputGroup>

      {/* Conditional rendering: show message if no issues or table */}
      {table.getRowModel().rows.length === 0 ? (
         <Alert variant="info">
           {globalFilter ? 'No issues match your filter.' : 'No issues found.'}
           {!globalFilter && <Link to="/issues/new"> Create one?</Link>}
         </Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  // Make headers clickable for sorting if enabled
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {/* Display sort direction indicator */}
                        {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default DashboardView;