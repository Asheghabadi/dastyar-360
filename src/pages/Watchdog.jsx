import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Container, Grid, Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useAppContext } from '../context/AppContext';
import CrawlerControlCard from '../components/watchdog/CrawlerControlCard';
import { runGazetteCrawler, runBrandCrawler, getCrawlerStatus } from '../api';

const Watchdog = () => {
    const { token } = useAppContext();
    const { enqueueSnackbar } = useSnackbar();
    const [crawlerStatus, setCrawlerStatus] = useState({});
    const [error, setError] = useState(null);

    const fetchStatus = useCallback(async () => {
        try {
            const statusData = await getCrawlerStatus(token);
            const statusMap = statusData.reduce((acc, log) => {
                acc[log.crawler_name] = log;
                return acc;
            }, {});
            setCrawlerStatus(statusMap);
        } catch (err) {
            setError('خطا در دریافت وضعیت خزنده‌ها.');
            console.error(err);
        }
    }, [token]);

    useEffect(() => {
        fetchStatus();
        // Set up an interval to poll for status updates, especially for running crawlers
        const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
        return () => clearInterval(interval); // Cleanup on unmount
    }, [fetchStatus]);

    const handleRunCrawler = async (crawlerFunction, crawlerName) => {
        // Optimistically update the UI
        setCrawlerStatus(prev => ({...prev, [crawlerName]: {...prev[crawlerName], status: 'running'}}));
        try {
            const response = await crawlerFunction(token);
            enqueueSnackbar(response.message || `${crawlerName} با موفقیت شروع شد.`, { variant: 'info' });
            // No need to call fetchStatus() immediately, the interval will pick it up
        } catch (error) {
            console.error(`Failed to start ${crawlerName}:`, error);
            enqueueSnackbar(`خطا در شروع ${crawlerName}.`, { variant: 'error' });
            fetchStatus(); // Refresh status immediately on error
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom component="h1">
                مدیریت دیده‌بان‌ها (خزنده‌ها)
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
                از این بخش می‌توانید فرآیندهای جمع‌آوری خودکار داده از منابع مختلف را مدیریت و اجرا کنید. وضعیت‌ها به صورت خودکار به‌روزرسانی می‌شوند.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12} md={6}>
                    <CrawlerControlCard 
                        title="خزنده روزنامه رسمی کشور"
                        description="این فرآیند آخرین آگهی‌های ثبت شده در روزنامه رسمی جمهوری اسلامی ایران را جمع‌آوری می‌کند."
                        onRun={() => handleRunCrawler(runGazetteCrawler, 'gazette')}
                        statusLog={crawlerStatus['gazette']}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CrawlerControlCard 
                        title="خزنده علائم تجاری"
                        description="این فرآیند آخرین علائم تجاری ثبت شده را از مرکز مالکیت معنوی ایران استخراج می‌کند."
                        onRun={() => handleRunCrawler(runBrandCrawler, 'brand')}
                        statusLog={crawlerStatus['brand']}
                    />
                </Grid>
            </Grid>
        </Container>
    );
};

export default Watchdog;
