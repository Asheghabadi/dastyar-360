import React, { useState, useEffect } from 'react';
import { 
    Paper, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress, 
    Alert, 
    Chip, 
    Link 
} from '@mui/material';
import { getBrandAlerts } from '../../api';
import { useAppContext } from '../../context/AppContext';

const BrandAlertsWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAppContext();

    useEffect(() => {
        if (!token) return;

        const fetchAlerts = async () => {
            try {
                setLoading(true);
                const data = await getBrandAlerts(token);
                setAlerts(data);
            } catch (err) {
                setError('Failed to fetch brand alerts.');
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
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>هشدارهای برند (تشابه علائم تجاری)</Typography>
            {loading && <CircularProgress sx={{ m: 'auto' }} />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <List dense sx={{ overflow: 'auto' }}>
                    {alerts.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="هیچ هشدار جدیدی در مورد تشابه علائم تجاری یافت نشد." />
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
                                    secondary={
                                        <>
                                            {alert.summary}
                                            {alert.details?.source_url && 
                                                <>
                                                    {' - '}
                                                    <Link href={alert.details.source_url} target="_blank" rel="noopener noreferrer">
                                                        مشاهده منبع
                                                    </Link>
                                                </>
                                            }
                                        </>
                                    }
                                />
                            </ListItem>
                        ))
                    )}
                </List>
            )}
        </Paper>
    );
};

export default BrandAlertsWidget;
