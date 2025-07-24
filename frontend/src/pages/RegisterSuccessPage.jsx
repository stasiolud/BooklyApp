import React from 'react';
import { Box, Paper, Typography, Button, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const RegisterSuccessPage = () => {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: theme.palette.background.default
            }}
        >
            <Paper
                elevation={6}
                sx={{
                    p: 4,
                    width: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    borderRadius: 2
                }}
            >
                <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                    {t('registerSuccess.title')}
                </Typography>
                <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
                    {t('registerSuccess.message')}
                </Typography>
                <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    fullWidth
                    sx={{
                        color: theme.palette.common.white,
                        bgcolor: theme.palette.primary.main
                    }}
                >
                    {t('registerSuccess.button')}
                </Button>
            </Paper>
        </Box>
    );
};

export default RegisterSuccessPage;
