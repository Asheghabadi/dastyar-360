import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Grid, MenuItem, CircularProgress } from '@mui/material';

const BankTransactionForm = ({ enterpriseId, onAdd, initialData }) => {
    const [formData, setFormData] = useState({
        transaction_date: new Date().toISOString().split('T')[0], // Defaults to today
        amount: '',
        description: '',
        is_debit: 'true', // Default to debit
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                transaction_date: new Date(initialData.transaction_date).toISOString().split('T')[0],
                amount: initialData.amount || '',
                description: initialData.description || '',
                is_debit: String(initialData.is_debit),
            });
        } else {
            // Reset form if initialData is cleared (e.g., closing an edit modal or for adding new)
            setFormData({
                transaction_date: new Date().toISOString().split('T')[0],
                amount: '',
                description: '',
                is_debit: 'true',
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
            // It will handle the API call for both add and update.
            await onAdd({
                ...formData,
                amount: parseFloat(formData.amount),
                is_debit: formData.is_debit === 'true',
            });
            // Reset form only if it's for adding, not editing
            if (!initialData) {
                setFormData({
                    transaction_date: new Date().toISOString().split('T')[0],
                    amount: '',
                    description: '',
                    is_debit: 'true',
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
            <Typography variant="h6" gutterBottom>{initialData ? 'ویرایش تراکنش بانکی' : 'ثبت تراکنش بانکی جدید'}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        fullWidth
                        name="transaction_date"
                        label="تاریخ تراکنش"
                        type="date"
                        value={formData.transaction_date}
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
                        name="amount"
                        label="مبلغ (ریال)"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        fullWidth
                        name="description"
                        label="توضیحات"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        select
                        required
                        fullWidth
                        name="is_debit"
                        label="نوع تراکنش"
                        value={formData.is_debit}
                        onChange={handleChange}
                    >
                        <MenuItem value="true">بدهکار (برداشت)</MenuItem>
                        <MenuItem value="false">بستانکار (واریز)</MenuItem>
                    </TextField>
                </Grid>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button type="submit" variant="contained" disabled={isLoading}>
                        {isLoading ? <CircularProgress size={24} /> : (initialData ? 'به‌روزرسانی تراکنش' : 'ثبت تراکنش')}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default BankTransactionForm;
