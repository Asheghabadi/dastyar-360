import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

const Step2_DirectorsInfo = ({ formData, updateFormData }) => {

    const handleChange = (e) => {
        updateFormData({ [e.target.name]: e.target.value });
    };

    return (
        <React.Fragment>
            <Typography variant="h6" gutterBottom>
                اطلاعات مدیرعامل
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="ceo_name"
                        name="ceo_name"
                        label="نام و نام خانوادگی مدیرعامل"
                        fullWidth
                        variant="standard"
                        value={formData.ceo_name || ''}
                        onChange={handleChange}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        required
                        id="ceo_national_id"
                        name="ceo_national_id"
                        label="کد ملی مدیرعامل"
                        fullWidth
                        variant="standard"
                        value={formData.ceo_national_id || ''}
                        onChange={handleChange}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};

export default Step2_DirectorsInfo;
