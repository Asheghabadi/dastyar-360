import React from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography, 
    Box, 
    IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const TaxInvoicesTable = ({ invoices, onEdit, onDelete }) => {
    if (!invoices || invoices.length === 0) {
        return (
            <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
                <Typography>هیچ فاکتوری برای نمایش وجود ندارد.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>لیست فاکتورهای مالیاتی ثبت شده</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>تاریخ</TableCell>
                            <TableCell>شماره فاکتور</TableCell>
                            <TableCell align="right">مبلغ کل (ریال)</TableCell>
                            <TableCell align="right">مبلغ ارزش افزوده (ریال)</TableCell>
                            <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {invoices.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {new Date(row.invoice_date).toLocaleDateString('fa-IR')}
                                </TableCell>
                                <TableCell>{row.invoice_number}</TableCell>
                                <TableCell align="right">{row.total_amount.toLocaleString('fa-IR')}</TableCell>
                                <TableCell align="right">{row.vat_amount.toLocaleString('fa-IR')}</TableCell>
                                <TableCell align="center">
                                    <IconButton aria-label="edit" color="primary" onClick={() => onEdit(row)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton aria-label="delete" color="error" onClick={() => onDelete(row.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TaxInvoicesTable;
