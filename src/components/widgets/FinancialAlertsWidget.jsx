import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, CircularProgress, Alert, Chip } from '@mui/material';
import { getFinancialAlerts } from '../../api';
import { useAppContext } from '../../context/AppContext';

const FinancialAlertsWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAppContext();

    useEffect(() => {
        if (!token) return;

        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const data = await getFinancialAlerts(token);
                setAlerts(data);
            } catch (err) {
                setError('Failed to fetch financial alerts.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, [token]);

    const getPriorityChip = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return <Chip label="High" color="error" size="small" />;
            case 'medium':
                return <Chip label="Medium" color="warning" size="small" />;
            case 'low':
                return <Chip label="Low" color="info" size="small" />;
            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>هشدارهای مالی</Typography>
            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <List dense>
                    {alerts.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="هیچ هشدار مالی جدیدی وجود ندارد." />
                        </ListItem>
                    ) : (
                        alerts.map((alert) => (
                            <ListItem key={alert.alert_id} alignItems="flex-start" divider>
                                <ListItemText
                                    primary={
                                        <React.Fragment>
                                            {getPriorityChip(alert.priority)}
                                            <Typography component="span" variant="body1" sx={{ display: 'inline', ml: 1 }}>
                                                {alert.title}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                    secondary={alert.summary}
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            )}
        </Paper>
    );
};

export default FinancialAlertsWidget;
