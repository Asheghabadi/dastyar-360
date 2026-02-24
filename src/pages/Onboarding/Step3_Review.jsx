import React from 'react';
import { Typography, List, ListItem, ListItemText, Grid, Divider } from '@mui/material';

const Step3_Review = ({ formData }) => {
    const { name, national_id, registration_id, address, ceo_name, ceo_national_id } = formData;

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                بازبینی اطلاعات
            </Typography>
            <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="نام بنگاه" secondary={name || 'ثبت نشده'} />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="شناسه ملی" secondary={national_id || 'ثبت نشده'} />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="شماره ثبت" secondary={registration_id || 'ثبت نشده'} />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="آدرس" secondary={address || 'ثبت نشده'} />
                </ListItem>
            </List>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
                مدیرعامل
            </Typography>
            <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="نام و نام خانوادگی" secondary={ceo_name || 'ثبت نشده'} />
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="کد ملی" secondary={ceo_national_id || 'ثبت نشده'} />
                </ListItem>
            </List>
        </React.Fragment>
    );
};

export default Step3_Review;
