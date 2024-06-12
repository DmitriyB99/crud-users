import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient, InvalidateQueryFilters } from '@tanstack/react-query';
import { getUsers, deleteUser, User } from '../api/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Typography,
  TablePagination,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const UserList: React.FC = () => {
  const queryClient = useQueryClient();
  
  const {
    data: users = [],
    error,
    isLoading,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'] as InvalidateQueryFilters);
    },
  });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof (typeof users)[0] | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof (typeof users)[0]) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedUsers = sortField
    ? [...users].sort((a, b) =>
        sortOrder === 'asc'
          ? a[sortField] > b[sortField]
            ? 1
            : -1
          : a[sortField] < b[sortField]
          ? 1
          : -1,
      )
    : users;

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        User List
      </Typography>
      <Button component={Link} to="/add" variant="contained" color="primary" style={{ marginBottom: '20px' }}>
        Add User
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('id')}>ID</TableCell>
              <TableCell onClick={() => handleSort('name')}>Name</TableCell>
              <TableCell onClick={() => handleSort('surname')}>Surname</TableCell>
              <TableCell onClick={() => handleSort('email')}>Email</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell onClick={() => handleSort('regDate')}>Registration Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.surname}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.skills.join('; ')}</TableCell>
                <TableCell>{user.regDate}</TableCell>
                <TableCell>
                  <IconButton component={Link} to={`/edit/${user.id}`}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => deleteUserMutation.mutate(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
};

export default UserList;
