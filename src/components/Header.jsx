import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Header = () => {
    const { isAuthenticated, logout, user } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" color="default" elevation={1} sx={{ mb: 4 }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        دستیار ۳۶۰
                    </RouterLink>
                </Typography>
                
                {isAuthenticated && (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button color="inherit" component={RouterLink} to="/">داشبورد</Button>
                        <Button color="inherit" component={RouterLink} to="/financials">مدیریت مالی</Button>
                        <Button color="inherit" component={RouterLink} to="/watchdog">مدیریت دیده‌بان</Button>
                        <Typography sx={{ mx: 2 }}>
                            {user ? `کاربر: ${user.email}` : ''}
                        </Typography>
                        <Button color="inherit" variant="outlined" onClick={handleLogout}>خروج</Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Header;
