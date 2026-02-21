import { useState, useEffect } from 'react';
import { useSearch } from '../context/SearchContext';
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
  DialogTitle,
  TextField,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const getInitialCompetitors = () => {
  const savedCompetitors = localStorage.getItem('competitors');
  if (savedCompetitors) {
    return JSON.parse(savedCompetitors);
  }
  return [
    { id: 1, name: 'رقیب شماره یک', website: 'competitor1.com', product: 'محصول مشابه', price: '120,000 تومان' },
  ];
};

function CompetitorAnalysis() {
  const [competitors, setCompetitors] = useState(getInitialCompetitors);
  const [open, setOpen] = useState(false);
  const { searchTerm } = useSearch();

  const filteredCompetitors = competitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    localStorage.setItem('competitors', JSON.stringify(competitors));
  }, [competitors]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddCompetitor = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    const newCompetitor = {
      id: competitors.length > 0 ? Math.max(...competitors.map(c => c.id)) + 1 : 1,
      ...formJson
    };
    setCompetitors([...competitors, newCompetitor]);
    handleClose();
  };

  const handleDeleteCompetitor = (id) => {
    setCompetitors(competitors.filter(c => c.id !== id));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        رادار بازار - تحلیل رقبا
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={handleClickOpen}>
          افزودن رقیب
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="competitor table">
          <TableHead>
            <TableRow>
              <TableCell>نام رقیب</TableCell>
              <TableCell>وب سایت</TableCell>
              <TableCell>محصول اصلی</TableCell>
              <TableCell>قیمت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompetitors.map((row) => (
              <TableRow key={row.id}>
                <TableCell component="th" scope="row">{row.name}</TableCell>
                <TableCell>{row.website}</TableCell>
                <TableCell>{row.product}</TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell align="center">
                  <IconButton aria-label="delete" size="small" onClick={() => handleDeleteCompetitor(row.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} PaperProps={{ component: 'form', onSubmit: handleAddCompetitor }}>
        <DialogTitle>افزودن رقیب جدید</DialogTitle>
        <DialogContent>
          <TextField autoFocus required margin="dense" id="name" name="name" label="نام رقیب" type="text" fullWidth variant="standard" />
          <TextField required margin="dense" id="website" name="website" label="وب سایت" type="text" fullWidth variant="standard" />
          <TextField required margin="dense" id="product" name="product" label="محصول اصلی" type="text" fullWidth variant="standard" />
          <TextField required margin="dense" id="price" name="price" label="قیمت" type="text" fullWidth variant="standard" />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>انصراف</Button>
          <Button type="submit">ثبت</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CompetitorAnalysis;
