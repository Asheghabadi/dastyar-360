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
import { getTrademarkRegistrations } from '../../api';
import { useAppContext } from '../../context/AppContext';

const TrademarkRegistrationsWidget = () => {
    const [trademarks, setTrademarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { token } = useAppContext();

    useEffect(() => {
        if (!token) return;

        const fetchTrademarks = async () => {
            try {
                setLoading(true);
                const data = await getTrademarkRegistrations(token);
                setTrademarks(data);
            } catch (err) {
                setError('Failed to fetch trademark registrations.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTrademarks();
    }, [token]);

    return (
        <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>آخرین علائم تجاری ثبت شده</Typography>
            {loading && <CircularProgress sx={{ m: 'auto' }} />}
            {error && <Alert severity="error">{error}</Alert>}
            {!loading && !error && (
                <List dense sx={{ overflow: 'auto' }}>
                    {trademarks.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="هیچ علامت تجاری جدیدی یافت نشد." />
                        </ListItem>
                    ) : (
                        trademarks.map((item) => (
                            <ListItem key={item.id} divider>
                                <ListItemText
                                    primary={
                                        <Tooltip title={item.name} placement="top-start">
                                            <Typography noWrap>
                                                {item.name}
                                            </Typography>
                                        </Tooltip>
                                    }
                                    secondary={
                                        <>
                                            {`مالک: ${item.owner_name} - `}
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

export default TrademarkRegistrationsWidget;
