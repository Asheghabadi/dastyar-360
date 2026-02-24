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

const BankTransactionsTable = ({ transactions, onEdit, onDelete }) => {
    if (!transactions || transactions.length === 0) {
        return (
            <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
                <Typography>هیچ تراکنشی برای نمایش وجود ندارد.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>لیست تراکنش‌های بانکی ثبت شده</Typography>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>تاریخ</TableCell>
                            <TableCell align="right">مبلغ (ریال)</TableCell>
                            <TableCell>توضیحات</TableCell>
                            <TableCell align="center">نوع تراکنش</TableCell>
                            <TableCell align="center">عملیات</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {new Date(row.transaction_date).toLocaleDateString('fa-IR')}
                                </TableCell>
                                <TableCell align="right">{row.amount.toLocaleString('fa-IR')}</TableCell>
                                <TableCell>{row.description}</TableCell>
                                <TableCell align="center">
                                    {row.is_debit ? 'برداشت' : 'واریز'}
                                </TableCell>
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

export default BankTransactionsTable;
