import React from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UnloginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: theme.palette.background.paper,
                px: 2
            }}
        >
            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
                {t('unlogin.title')}
            </Typography>
            <Button
                variant="contained"
                size="large"
                onClick={handleLogout}
                sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.common.white,
                    '&:hover': { bgcolor: theme.palette.primary.dark }
                }}
            >
                {t('unlogin.button')}
            </Button>
        </Box>
    );
};

export default UnloginPage;
