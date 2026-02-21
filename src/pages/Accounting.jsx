import { useState, useEffect, useMemo } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, IconButton, Menu, MenuItem, 
  Select, InputLabel, FormControl, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { useSearch } from '../context/SearchContext';
import { useNotifications } from '../hooks/useNotifications.jsx';
import PayrollDashboard from '../components/PayrollDashboard';

const getInitialTransactions = () => {
  const savedTransactions = localStorage.getItem('transactions');
  return savedTransactions ? JSON.parse(savedTransactions) : [];
};

const getInitialCategories = () => {
    return ['حقوق', 'اجاره', 'قبوض', 'بازاریابی', 'فروش محصول'];
};

function Accounting() {
  const [transactions, setTransactions] = useState(getInitialTransactions);
  const [open, setOpen] = useState(false);
  const [dialogType, setDialogType] = useState('income');
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState(getInitialCategories);
  const { searchTerm } = useSearch();
  const { addNotification } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    const savedEmployees = localStorage.getItem('employees');
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  const checkProfitability = (updatedTransactions) => {
    const totalIncome = updatedTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = updatedTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome + totalExpense;

    if (totalIncome > 0 && (netProfit / totalIncome) < 0.2) { // Profitability drops below 20%
      addNotification(
        `هشدار سودآوری: سود خالص به کمتر از 20% درآمد کل رسیده است.`,
        { variant: 'error', persistent: true, id: 'profit-warning' }
      );
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    const now = new Date();

    if (timeFilter === 'month') {
      filtered = filtered.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear());
    } else if (timeFilter === 'year') {
      filtered = filtered.filter(t => new Date(t.date).getFullYear() === now.getFullYear());
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [transactions, timeFilter, categoryFilter, searchTerm]);

  const financialSummary = useMemo(() => {
    const income = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, net: income + expense };
  }, [filteredTransactions]);

  const handleOpen = (type) => {
    setIsEdit(false);
    setCurrentTransaction(null);
    setDialogType(type);
    setOpen(true);
  };

  const handleOpenEditDialog = (transaction) => {
    setIsEdit(true);
    setCurrentTransaction(transaction);
    setDialogType(transaction.amount > 0 ? 'income' : 'expense');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddTransaction = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const amount = dialogType === 'income' ? parseFloat(formJson.amount) : -parseFloat(formJson.amount);
    const attachment = formData.get('attachment');

    const newTransaction = {
      id: transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1,
      date: new Date().toISOString().split('T')[0],
      description: formJson.description,
      amount: amount,
      type: dialogType === 'income' ? 'درآمد' : 'هزینه',
      category: formJson.category,
      status: 'ثبت شده',
      attachment: attachment ? attachment.name : null
    };
    const newTransactions = [...transactions, newTransaction];
    setTransactions(newTransactions);
    checkProfitability(newTransactions);
    addNotification(`تراکنش '${newTransaction.description}' با موفقیت افزوده شد.`, { variant: 'success' });
    handleClose();
  };

  const handleUpdateTransaction = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const amount = dialogType === 'income' ? parseFloat(formJson.amount) : -parseFloat(formJson.amount);
    const attachment = formData.get('attachment');

    const updatedTransaction = {
      ...currentTransaction,
      description: formJson.description,
      amount: amount,
      category: formJson.category,
      attachment: attachment && attachment.name ? attachment.name : currentTransaction.attachment
    };

    const newTransactions = transactions.map(t => t.id === updatedTransaction.id ? updatedTransaction : t);
    setTransactions(newTransactions);
    checkProfitability(newTransactions);
    addNotification(`تراکنش '${updatedTransaction.description}' با موفقیت ویرایش شد.`, { variant: 'info' });
    handleClose();
  };

  const handleDeleteTransaction = (id) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    checkProfitability(newTransactions);
    addNotification('تراکنش با موفقیت حذف شد.', { variant: 'error' });
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransactionId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransactionId(null);
  };

  const handleStatusChange = (newStatus) => {
    const newTransactions = transactions.map(t => t.id === selectedTransactionId ? { ...t, status: newStatus } : t);
    setTransactions(newTransactions);
    addNotification(`وضعیت تراکنش به '${newStatus}' تغییر یافت.`, { variant: 'info' });
    handleMenuClose();
  };

  return (
    <Box>
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
                <PayrollDashboard transactions={transactions} employees={employees} />
            </Grid>
        </Grid>

      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h4">مدیریت مالی</Typography>
        <Box>
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => handleOpen('income')} sx={{ mr: 1 }}>
            افزودن درآمد
          </Button>
          <Button variant="contained" color="error" startIcon={<AddIcon />} onClick={() => handleOpen('expense')}>
            افزودن هزینه
          </Button>
        </Box>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>بازه زمانی</InputLabel>
              <Select value={timeFilter} label="بازه زمانی" onChange={(e) => setTimeFilter(e.target.value)}>
                <MenuItem value="all">همه</MenuItem>
                <MenuItem value="month">ماه جاری</MenuItem>
                <MenuItem value="year">سال جاری</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select value={categoryFilter} label="دسته‌بندی" onChange={(e) => setCategoryFilter(e.target.value)}>
                <MenuItem value="all">همه</MenuItem>
                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">درآمد</Typography><Typography variant="h5" color="success.main">{financialSummary.income.toLocaleString()} تومان</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">هزینه</Typography><Typography variant="h5" color="error.main">{Math.abs(financialSummary.expense).toLocaleString()} تومان</Typography></Paper></Grid>
        <Grid item xs={12} sm={4}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">سود/زیان خالص</Typography><Typography variant="h5" color={financialSummary.net >= 0 ? 'success.main' : 'error.main'}>{financialSummary.net.toLocaleString()} تومان</Typography></Paper></Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>تاریخ</TableCell>
              <TableCell>شرح</TableCell>
              <TableCell>دسته‌بندی</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="right">مبلغ (تومان)</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{new Date(row.date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{row.description}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>
                  <Chip label={row.status} size="small" />
                </TableCell>
                <TableCell align="right" sx={{ color: row.amount > 0 ? 'success.main' : 'error.main' }}>
                  {row.amount.toLocaleString()}
                </TableCell>
                <TableCell align="center">
                  {row.attachment && 
                    <IconButton aria-label="attachment" size="small" onClick={() => addNotification(`فایل پیوست: ${row.attachment}`, { variant: 'info' })}>
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                  }
                  <IconButton aria-label="edit" size="small" onClick={() => handleOpenEditDialog(row)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="actions" size="small" onClick={(e) => handleMenuClick(e, row.id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <IconButton aria-label="delete" size="small" onClick={() => handleDeleteTransaction(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: isEdit ? handleUpdateTransaction : handleAddTransaction }}>
        <DialogTitle>{isEdit ? 'ویرایش' : 'افزودن'} {dialogType === 'income' ? 'درآمد' : 'هزینه'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            name="description"
            label="شرح"
            type="text"
            fullWidth
            defaultValue={currentTransaction?.description}
          />
          <TextField
            required
            margin="dense"
            name="amount"
            label="مبلغ"
            type="number"
            fullWidth
            defaultValue={currentTransaction ? Math.abs(currentTransaction.amount) : ''}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>دسته‌بندی</InputLabel>
            <Select
              name="category"
              label="دسته‌بندی"
              defaultValue={currentTransaction?.category || ''}
            >
              {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </Select>
          </FormControl>
          <Button
            component="label"
            role={undefined}
            variant="outlined"
            tabIndex={-1}
            startIcon={<AttachFileIcon />}
            sx={{ mt: 2 }}
          >
            پیوست فایل
            <input type="file" name="attachment" hidden />
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>انصراف</Button>
          <Button type="submit">{isEdit ? 'ذخیره تغییرات' : 'ثبت'}</Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('در انتظار تایید')}>در انتظار تایید</MenuItem>
        <MenuItem onClick={() => handleStatusChange('پرداخت شده')}>پرداخت شده</MenuItem>
        <MenuItem onClick={() => handleStatusChange('لغو شده')}>لغو شده</MenuItem>
      </Menu>
    </Box>
  );
}

export default Accounting;
