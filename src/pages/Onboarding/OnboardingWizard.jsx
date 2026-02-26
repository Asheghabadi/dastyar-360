import React, { useState, useEffect } from 'react';
import { Box, Stepper, Step, StepLabel, Button, Typography, Container, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import Step1_CompanyInfo from './Step1_CompanyInfo';
import Step2_DirectorsInfo from './Step2_DirectorsInfo';
import Step3_Review from './Step3_Review';

import { getMyEnterprise, updateMyEnterprise } from '../../api';
import { useAppContext } from '../../context/AppContext';

const steps = ['اطلاعات شرکت', 'اطلاعات مدیران', 'بازبینی نهایی'];

const OnboardingWizard = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState(null); // Initialize as null
    const [isLoading, setIsLoading] = useState(true);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const { token } = useAppContext();

    useEffect(() => {
        const fetchEnterpriseData = async () => {
            if (!token) {
                navigate('/login');
                return;
            }
            try {
                setIsLoading(true);
                const enterpriseData = await getMyEnterprise(token);
                setFormData(enterpriseData);
            } catch (error) {
                enqueueSnackbar(`خطا در دریافت اطلاعات بنگاه: ${error.message}`, { variant: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnterpriseData();
    }, [token, navigate, enqueueSnackbar]);

    const handleNext = async () => {
        if (activeStep === steps.length - 1) {
            try {
                // The payload should match the EnterpriseCreate schema
                const payload = {
                    name: formData.name,
                    national_id: formData.national_id,
                    registration_id: formData.registration_id,
                    scale_name: formData.scale_name || 'Small', // Default if not set
                    ceo_name: formData.ceo_name,
                    ceo_national_id: formData.ceo_national_id,
                    address: formData.address,
                };
                await updateMyEnterprise(payload, token);
                enqueueSnackbar('اطلاعات بنگاه با موفقیت به‌روزرسانی شد!', { variant: 'success' });
                navigate('/'); // Redirect to dashboard
            } catch (error) {
                enqueueSnackbar(`خطا در به‌روزرسانی اطلاعات: ${error.message}`, { variant: 'error' });
            }
        } else {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const updateFormData = (newData) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <Step1_CompanyInfo formData={formData} updateFormData={updateFormData} />;
            case 1:
                return <Step2_DirectorsInfo formData={formData} updateFormData={updateFormData} />;
            case 2:
                return <Step3_Review formData={formData} />;
            default:
                throw new Error('مرحله ناشناخته');
        }
    }

    if (isLoading || !formData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    تکمیل اطلاعات بنگاه
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <React.Fragment>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>
                                بازگشت
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handleNext}
                            sx={{ mt: 3, ml: 1 }}
                        >
                            {activeStep === steps.length - 1 ? 'ثبت نهایی' : 'بعدی'}
                        </Button>
                    </Box>
                </React.Fragment>
            </Paper>
        </Container>
    );
};

export default OnboardingWizard;
