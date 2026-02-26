import React from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Chip, Tooltip, Alert } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

const CrawlerControlCard = ({ title, description, onRun, statusLog }) => {
    const isLoading = statusLog?.status === 'running';

    const getStatusChip = () => {
        if (!statusLog || !statusLog.status) {
            return <Chip label="اجرا نشده" size="small" />;
        }

        switch (statusLog.status) {
            case 'running':
                return <Chip label="در حال اجرا..." color="warning" size="small" />;
            case 'success':
                return <Chip label="موفق" color="success" size="small" />;
            case 'failed':
                return <Chip label="ناموفق" color="error" size="small" />;
            default:
                return <Chip label={statusLog.status} size="small" />;
        }
    };

    return (
        <Card sx={{ minWidth: 275, mb: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                    {title}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {description}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">وضعیت:</Typography>
                    {getStatusChip()}
                </Box>

                {statusLog?.last_run_finish && (
                    <Typography variant="body2" color="text.secondary"> 
                        آخرین اجرا: {new Date(statusLog.last_run_finish).toLocaleString('fa-IR')}
                    </Typography>
                )}
                {statusLog?.status === 'success' && (
                     <Typography variant="body2" color="text.secondary"> 
                        موارد جدید اضافه شده: {statusLog.items_added}
                    </Typography>
                )}

                {statusLog?.status === 'failed' && statusLog.details && (
                    <Alert severity="error" sx={{ mt: 1, fontSize: '0.8rem' }}>
                        {statusLog.details}
                    </Alert>
                )}

            </CardContent>
            <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                    variant="contained" 
                    onClick={onRun} 
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                    fullWidth
                >
                    {isLoading ? 'در حال اجرا...' : 'شروع فرآیند'}
                </Button>
            </Box>
        </Card>
    );
};

export default CrawlerControlCard;
