import React, { useState, useEffect } from 'react';
import { 
    Paper, 
    Typography, 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress, 
    Alert, 
    Link, 
    Tooltip 
} from '@mui/material';
import { getGazetteAnnouncements } from '../../api';
import { useAppContext } from '../../context/AppContext';

const GazetteAnnouncementsWidget = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAppContext();

    useEffect(() => {
        if (!token) return;

        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const data = await getGazetteAnnouncements(token);
                setAnnouncements(data);
            } catch (err) {
                setError('Failed to fetch gazette announcements.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAnnouncements();
    }, [token]);

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>آخرین آگهی‌های روزنامه رسمی</Typography>
            {loading && <CircularProgress sx={{ m: 'auto' }} />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <List dense sx={{ overflow: 'auto' }}>
                    {announcements.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="هیچ آگهی جدیدی یافت نشد." />
                        </ListItem>
                    ) : (
                        announcements.map((item) => (
                            <ListItem key={item.id} divider>
                                <ListItemText
                                    primary={
                                        <Tooltip title={item.title} placement="top-start">
                                            <Typography noWrap>
                                                {item.title}
                                            </Typography>
                                        </Tooltip>
                                    }
                                    secondary={
                                        <>
                                            {`تاریخ: ${item.date} - `}
                                            <Link href={item.source_url} target="_blank" rel="noopener noreferrer">
                                                مشاهده منبع
                                            </Link>
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

export default GazetteAnnouncementsWidget;
