import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Grid, CircularProgress } from '@mui/material';

const TaxInvoiceForm = ({ enterpriseId, onAdd, initialData }) => {
    const [formData, setFormData] = useState({
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_number: '',
        total_amount: '',
        vat_amount: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                invoice_date: new Date(initialData.invoice_date).toISOString().split('T')[0],
                invoice_number: initialData.invoice_number || '',
                total_amount: initialData.total_amount || '',
                vat_amount: initialData.vat_amount || '',
            });
        } else {
            setFormData({
                invoice_date: new Date().toISOString().split('T')[0],
                invoice_number: '',
                total_amount: '',
                vat_amount: '',
            });
        }
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // The onAdd function will be provided by the parent component (Financials.jsx)
            await onAdd({
                ...formData,
                total_amount: parseFloat(formData.total_amount),
                vat_amount: parseFloat(formData.vat_amount),
            });
            // Reset form only on successful ADDITION
            if (!initialData) {
                setFormData({
                    invoice_date: new Date().toISOString().split('T')[0],
                    invoice_number: '',
                    total_amount: '',
                    vat_amount: '',
                });
            }
        } catch (error) {
            // Parent component will show the error message
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{initialData ? 'ویرایش فاکتور مالیاتی' : 'ثبت فاکتور مالیاتی جدید'}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        name="invoice_date"
                        label="تاریخ فاکتور"
                        type="date"
                        value={formData.invoice_date}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        name="invoice_number"
                        label="شماره فاکتور"
                        value={formData.invoice_number}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        name="total_amount"
                        label="مبلغ کل (ریال)"
                        type="number"
                        value={formData.total_amount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        name="vat_amount"
                        label="مبلغ مالیات بر ارزش افزوده (ریال)"
                        type="number"
                        value={formData.vat_amount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} /> : (initialData ? 'به‌روزرسانی فاکتور' : 'ثبت فاکتور')}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default TaxInvoiceForm;
