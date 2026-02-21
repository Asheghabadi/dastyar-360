import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
import { useNotifications } from '../hooks/useNotifications.jsx';
import EmailIcon from '@mui/icons-material/Email';
import {
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const getInitialCustomers = () => {
  const savedCustomers = localStorage.getItem('customers');
  if (savedCustomers) {
    return JSON.parse(savedCustomers);
  }
  return [
    { id: 1, name: 'مشتری اول', company: 'شرکت نمونه', email: 'customer1@example.com', phone: '09123456789' },
  ];
};

function Customers() {
  const [customers, setCustomers] = useState(getInitialCustomers);
  const [open, setOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const { searchTerm } = useSearch();
  const { addNotification } = useNotifications();

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddCustomer = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const newCustomer = {
      id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
      ...formJson
    };
    setCustomers([...customers, newCustomer]);
    addNotification(`مشتری '${newCustomer.name}' با موفقیت اضافه شد.`, { variant: 'success' });
    handleClose();
  };

  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter(c => c.id !== id));
    addNotification('مشتری با موفقیت حذف شد.', { variant: 'error' });
  };

  const handleOpenEmailDialog = (customer) => {
    setSelectedCustomer(customer);
    setEmailOpen(true);
  };

  const handleCloseEmailDialog = () => {
    setEmailOpen(false);
    setSelectedCustomer(null);
  };

  const handleSendEmail = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    console.log(`--- Sending Email ---`);
    console.log(`To: ${selectedCustomer.email}`);
    console.log(`Subject: ${formJson.subject}`);
    console.log(`Body: ${formJson.body}`);
    console.log(`---------------------`);
    addNotification(`ایمیل برای ${selectedCustomer.name} ارسال شد.`, { variant: 'success' });
    handleCloseEmailDialog();
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        مدیریت مشتریان
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleClickOpen}>
          افزودن مشتری
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="customer table">
          <TableHead>
            <TableRow>
              <TableCell>نام مشتری</TableCell>
              <TableCell>شرکت</TableCell>
              <TableCell>ایمیل</TableCell>
              <TableCell>تلفن</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell>{row.company}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell align="center">
                  <IconButton aria-label="email" size="small" onClick={() => handleOpenEmailDialog(row)}>
                    <EmailIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" size="small" onClick={() => handleDeleteCustomer(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleAddCustomer }}>
        <DialogTitle>افزودن مشتری جدید</DialogTitle>
        <DialogContent>
          <TextField autoFocus required margin="dense" id="name" name="name" label="نام مشتری" type="text" fullWidth variant="standard" />
          <TextField margin="dense" id="company" name="company" label="شرکت" type="text" fullWidth variant="standard" />
          <TextField required margin="dense" id="email" name="email" label="ایمیل" type="email" fullWidth variant="standard" />
          <TextField required margin="dense" id="phone" name="phone" label="تلفن" type="text" fullWidth variant="standard" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>انصراف</Button>
          <Button type="submit">ثبت</Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      {selectedCustomer && (
        <Dialog open={emailOpen} onClose={handleCloseEmailDialog} PaperProps={{ component: 'form', onSubmit: handleSendEmail }}>
          <DialogTitle>ارسال ایمیل به {selectedCustomer.name}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ارسال به: {selectedCustomer.email}
            </DialogContentText>
            <TextField autoFocus required margin="dense" id="subject" name="subject" label="موضوع" type="text" fullWidth variant="standard" />
            <TextField required margin="dense" id="body" name="body" label="متن پیام" type="text" fullWidth multiline rows={4} variant="standard" />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEmailDialog}>انصراف</Button>
            <Button type="submit">ارسال</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}

export default Customers;
