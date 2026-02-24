import React from 'react';
import { TextField, Grid, Typography } from '@mui/material';

const Step1_CompanyInfo = ({ formData, updateFormData }) => {
    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                اطلاعات پایه شرکت
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="name"
                        name="name"
                        label="نام بنگاه / شرکت"
                        fullWidth
                        autoComplete="organization"
                        variant="standard"
                        value={formData.name || ''}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="national_id"
                        name="national_id"
                        label="شناسه ملی"
                        fullWidth
                        variant="standard"
                        value={formData.national_id || ''}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        required
                        id="registration_id"
                        name="registration_id"
                        label="شماره ثبت"
                        fullWidth
                        variant="standard"
                        value={formData.registration_id || ''}
                        onChange={handleChange}
                    />
                </Grid>
                 <Grid item xs={12}>
                    <TextField
                        id="address"
                        name="address"
                        label="آدرس"
                        fullWidth
                        multiline
                        rows={3}
                        variant="standard"
                        value={formData.address || ''}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Step1_CompanyInfo;
