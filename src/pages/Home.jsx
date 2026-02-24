import React, { useState, useEffect } from 'react';
import { Grid, Box, Typography, CircularProgress } from '@mui/material';
import FinancialAlertsWidget from '../components/widgets/FinancialAlertsWidget';
import BrandAlertsWidget from '../components/widgets/BrandAlertsWidget';
import GanttWidget from '../components/widgets/GanttWidget';
import EnterpriseInfoWidget from '../components/widgets/EnterpriseInfoWidget';
import GazetteAnnouncementsWidget from '../components/widgets/GazetteAnnouncementsWidget'; // Import new widget
import TrademarkRegistrationsWidget from '../components/widgets/TrademarkRegistrationsWidget'; // Import new widget
import { useAppContext } from '../context/AppContext.jsx';
import { getMyEnterprise } from '../api';

const Home = () => {
    const { token } = useAppContext();
    const [enterprise, setEnterprise] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchEnterprise = async () => {
            if (token) {
                try {
                    setIsLoading(true);
                    const data = await getMyEnterprise(token);
                    setEnterprise(data);
                } catch (error) {
                    console.error("Failed to fetch enterprise info:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchEnterprise();
    }, [token]);

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>داشبورد</Typography>
            <Grid container spacing={3}>
                {/* Top Row */}
                <Grid item xs={12}>
                    <EnterpriseInfoWidget enterprise={enterprise} />
                </Grid>

                {/* Middle Row - Alerts */}
                <Grid item xs={12} md={6}>
                    <FinancialAlertsWidget />
                </Grid>
                <Grid item xs={12} md={6}>
                    <BrandAlertsWidget enterpriseId={enterprise?.id} />
                </Grid>

                {/* Watchdog Widgets Row */}
                <Grid item xs={12} md={6}>
                    <GazetteAnnouncementsWidget />
                </Grid>
                <Grid item xs={12} md={6}>
                    <TrademarkRegistrationsWidget />
                </Grid>

                {/* Bottom Row - Gantt */}
                <Grid item xs={12}>
                    <GanttWidget enterpriseId={enterprise?.id} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Home;
