import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const InfoItem = ({ title, value }) => (
    <Grid item xs={12} sm={6}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="body1" fontWeight="medium">{value || 'تکمیل نشده'}</Typography>
    </Grid>
);

const EnterpriseInfoWidget = ({ enterprise }) => {
    const navigate = useNavigate();

    if (!enterprise) {
        return null; // Don't render if no enterprise data is available
    }

    const handleGoToOnboarding = () => {
        navigate('/onboarding');
    };

    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    اطلاعات بنگاه
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <InfoItem title="نام بنگاه" value={enterprise.name} />
                    <InfoItem title="شناسه ملی" value={enterprise.national_id} />
                    <InfoItem title="شماره ثبت" value={enterprise.registration_id} />
                    <InfoItem title="نام مدیرعامل" value={enterprise.ceo_name} />
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outlined" size="small" onClick={handleGoToOnboarding}>
                        تکمیل/ویرایش اطلاعات
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
};

export default EnterpriseInfoWidget;
