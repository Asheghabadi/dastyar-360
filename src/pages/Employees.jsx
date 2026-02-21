import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { useNotifications } from '../hooks/useNotifications.jsx';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const getInitialEmployees = () => {
  const savedEmployees = localStorage.getItem('employees');
  if (savedEmployees) {
    return JSON.parse(savedEmployees);
  }
  return [
    { id: 1, name: 'آرش محمدی', position: 'توسعه‌دهنده نرم‌افزار', department: 'فنی' },
    { id: 2, name: 'سارا رضایی', position: 'مدیر محصول', department: 'محصول' },
    { id: 3, name: 'علی کریمی', position: 'کارشناس بازاریابی', department: 'بازاریابی' },
  ];
};

function Employees() {
  const [employees, setEmployees] = useState(getInitialEmployees);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const { searchTerm } = useSearch();
  const { addNotification } = useNotifications();

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  const filteredEmployees = employees.filter(e =>
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClickOpen = () => {
    setIsEdit(false);
    setCurrentEmployee(null);
    setOpen(true);
  };

  const handleOpenEditDialog = (employee) => {
    setIsEdit(true);
    setCurrentEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setCurrentEmployee(null);
  };

  const handleAddOrUpdateEmployee = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());

    if (isEdit) {
      const updatedEmployee = { ...currentEmployee, ...formJson };
      setEmployees(employees.map(e => e.id === currentEmployee.id ? updatedEmployee : e));
      addNotification(`کارمند '${updatedEmployee.name}' با موفقیت ویرایش شد.`, { variant: 'info' });
    } else {
      const newEmployee = {
        id: employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1,
        ...formJson
      };
      setEmployees([...employees, newEmployee]);
      addNotification(`کارمند '${newEmployee.name}' با موفقیت اضافه شد.`, { variant: 'success' });
    }
    handleClose();
  };

  const handleDeleteEmployee = (id) => {
    setEmployees(employees.filter(e => e.id !== id));
    addNotification('کارمند با موفقیت حذف شد.', { variant: 'error' });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">مدیریت کارمندان</Typography>
        <Button variant="contained" onClick={handleClickOpen}>افزودن کارمند</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شناسه</TableCell>
              <TableCell>نام</TableCell>
              <TableCell>سمت</TableCell>
              <TableCell>دپارتمان</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell align="center">
                  <IconButton aria-label="edit" size="small" onClick={() => handleOpenEditDialog(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" size="small" onClick={() => handleDeleteEmployee(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleAddOrUpdateEmployee }}>
        <DialogTitle>{isEdit ? 'ویرایش کارمند' : 'افزودن کارمند'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus required margin="dense" id="name" name="name" label="نام" type="text" fullWidth variant="standard" defaultValue={isEdit ? currentEmployee.name : ''} />
          <TextField required margin="dense" id="position" name="position" label="سمت" type="text" fullWidth variant="standard" defaultValue={isEdit ? currentEmployee.position : ''} />
          <TextField required margin="dense" id="department" name="department" label="دپارتمان" type="text" fullWidth variant="standard" defaultValue={isEdit ? currentEmployee.department : ''} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>انصراف</Button>
          <Button type="submit">{isEdit ? 'ذخیره تغییرات' : 'افزودن'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Employees;
