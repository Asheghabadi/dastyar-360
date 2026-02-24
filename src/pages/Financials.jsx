import React, { useState, useEffect, useCallback } from 'react';
import { Box, Tab, Tabs, CircularProgress, Divider, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppContext } from '../context/AppContext';
import { 
    addBankTransaction, addTaxInvoice, 
    getBankTransactions, getTaxInvoices,
    deleteBankTransaction, deleteTaxInvoice,
    updateBankTransaction, updateTaxInvoice
} from '../api';

import BankTransactionForm from '../components/financials/BankTransactionForm';
import TaxInvoiceForm from '../components/financials/TaxInvoiceForm';
import BankTransactionsTable from '../components/financials/BankTransactionsTable';
import TaxInvoicesTable from '../components/financials/TaxInvoicesTable';
import EditModal from '../components/financials/EditModal';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

const Financials = () => {
    const [value, setValue] = useState(0);
    const { token, user } = useAppContext();
    const { enqueueSnackbar } = useSnackbar();

    const [transactions, setTransactions] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // State for Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [modalType, setModalType] = useState(null); // 'transaction' or 'invoice'

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const fetchTransactions = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await getBankTransactions(token);
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions:", error);
            enqueueSnackbar('خطا در دریافت لیست تراکنش‌ها', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [token, enqueueSnackbar]);

    const fetchInvoices = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);
        try {
            const data = await getTaxInvoices(token);
            setInvoices(data);
        } catch (error) {
            console.error("Failed to fetch invoices:", error);
            enqueueSnackbar('خطا در دریافت لیست فاکتورها', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }, [token, enqueueSnackbar]);

    useEffect(() => {
        if (value === 0) {
            fetchTransactions();
        } else if (value === 1) {
            fetchInvoices();
        }
    }, [value, fetchTransactions, fetchInvoices]);

    // --- CRUD Handlers ---
    const handleAddTransaction = async (transaction) => {
        try {
            await addBankTransaction(transaction, token);
            enqueueSnackbar('تراکنش جدید با موفقیت ثبت شد', { variant: 'success' });
            fetchTransactions();
        } catch (error) {
            console.error("Failed to add transaction:", error);
            enqueueSnackbar('خطا در ثبت تراکنش', { variant: 'error' });
        }
    };

    const handleAddInvoice = async (invoice) => {
        try {
            await addTaxInvoice(invoice, token);
            enqueueSnackbar('فاکتور جدید با موفقیت ثبت شد', { variant: 'success' });
            fetchInvoices();
        } catch (error) {
            console.error("Failed to add invoice:", error);
            enqueueSnackbar('خطا در ثبت فاکتور', { variant: 'error' });
        }
    };

    const handleDeleteTransaction = async (transactionId) => {
        try {
            await deleteBankTransaction(transactionId, token);
            enqueueSnackbar('تراکنش با موفقیت حذف شد', { variant: 'success' });
            fetchTransactions();
        } catch (error) {
            console.error("Failed to delete transaction:", error);
            enqueueSnackbar('خطا در حذف تراکنش', { variant: 'error' });
        }
    };

    const handleDeleteInvoice = async (invoiceId) => {
        try {
            await deleteTaxInvoice(invoiceId, token);
            enqueueSnackbar('فاکتور با موفقیت حذف شد', { variant: 'success' });
            fetchInvoices();
        } catch (error) {
            console.error("Failed to delete invoice:", error);
            enqueueSnackbar('خطا در حذف فاکتور', { variant: 'error' });
        }
    };

    const handleUpdate = async (updatedData) => {
        try {
            if (modalType === 'transaction') {
                await updateBankTransaction(editingItem.id, updatedData, token);
                enqueueSnackbar('تراکنش با موفقیت به‌روزرسانی شد', { variant: 'success' });
                fetchTransactions();
            } else if (modalType === 'invoice') {
                await updateTaxInvoice(editingItem.id, updatedData, token);
                enqueueSnackbar('فاکتور با موفقیت به‌روزرسانی شد', { variant: 'success' });
                fetchInvoices();
            }
            handleCloseModal();
        } catch (error) {
            console.error(`Failed to update ${modalType}:`, error);
            enqueueSnackbar(`خطا در به‌روزرسانی ${modalType === 'transaction' ? 'تراکنش' : 'فاکتور'}`, { variant: 'error' });
        }
    };

    // --- Modal Handlers ---
    const handleOpenEditModal = (item, type) => {
        setEditingItem(item);
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setModalType(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="financial tabs">
                    <Tab label="تراکنش‌های بانکی" id="simple-tab-0" />
                    <Tab label="فاکتورهای مالیاتی" id="simple-tab-1" />
                </Tabs>
            </Box>

            <TabPanel value={value} index={0}>
                <Typography variant="h6" gutterBottom>ثبت تراکنش جدید</Typography>
                <BankTransactionForm onAdd={handleAddTransaction} />
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>لیست تراکنش‌ها</Typography>
                {isLoading ? <CircularProgress /> : <BankTransactionsTable transactions={transactions} onEdit={(item) => handleOpenEditModal(item, 'transaction')} onDelete={handleDeleteTransaction} />}
            </TabPanel>

            <TabPanel value={value} index={1}>
                <Typography variant="h6" gutterBottom>ثبت فاکتور جدید</Typography>
                <TaxInvoiceForm onAdd={handleAddInvoice} />
                <Divider sx={{ my: 4 }} />
                <Typography variant="h6" gutterBottom>لیست فاکتورها</Typography>
                {isLoading ? <CircularProgress /> : <TaxInvoicesTable invoices={invoices} onEdit={(item) => handleOpenEditModal(item, 'invoice')} onDelete={handleDeleteInvoice} />}
            </TabPanel>

            <EditModal 
                open={isModalOpen} 
                handleClose={handleCloseModal} 
                title={`ویرایش ${modalType === 'transaction' ? 'تراکنش' : 'فاکتور'}`}
            >
                {modalType === 'transaction' && (
                    <BankTransactionForm onAdd={handleUpdate} initialData={editingItem} />
                )}
                {modalType === 'invoice' && (
                    <TaxInvoiceForm onAdd={handleUpdate} initialData={editingItem} />
                )}
            </EditModal>
        </Box>
    );
};

export default Financials;
