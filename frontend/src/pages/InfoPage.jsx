import React, { useEffect } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Container1280 = ({ children, sx = {} }) => (
    <Box
        sx={{
            maxWidth: 1280,
            mx: 'auto',
            width: '100%',
            px: { xs: 2, md: 3 },
            ...sx,
        }}
    >
        {children}
    </Box>
);

const InfoPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sellSteps = [
        {
            img: '/img/Devices-bro.png',
            title: t('info.sellSteps.step1.title'),
            desc: t('info.sellSteps.step1.desc'),
        },
        {
            img: '/img/Mail-pana.png',
            title: t('info.sellSteps.step2.title'),
            desc: t('info.sellSteps.step2.desc'),
        },
        {
            img: '/img/Cash-Payment-bro.png',
            title: t('info.sellSteps.step3.title'),
            desc: t('info.sellSteps.step3.desc'),
        },
    ];

    const buySteps = [
        {
            img: '/img/Search-rafiki.png',
            title: t('info.buySteps.step1.title'),
            desc: t('info.buySteps.step1.desc'),
        },
        {
            img: '/img/Successful-purchase-bro.png',
            title: t('info.buySteps.step2.title'),
            desc: t('info.buySteps.step2.desc'),
        },
        {
            img: '/img/Absorbed-in-bro.png',
            title: t('info.buySteps.step3.title'),
            desc: t('info.buySteps.step3.desc'),
        },
    ];

    return (
        <Box
            sx={{
                bgcolor: theme.palette.background.paper,
                minHeight: `calc(100vh - ${theme.spacing(8)})`,
            }}
        >
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    height: 400,
                    backgroundImage: 'url(/img/theme.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container1280>
                    <Box sx={{ width: '50%' }}>
                        <Typography
                            variant="h3"
                            color="text.primary"
                            gutterBottom
                            sx={{ fontSize: { md: '2.5rem', lg: '3rem' } }}
                        >
                            {t('info.hero.title')}
                        </Typography>
                        <Typography
                            variant="h6"
                            color="common.white"
                            sx={{ fontSize: { md: '1rem' }, maxWidth: '80%' }}
                        >
                            {t('info.hero.subtitle')}
                        </Typography>
                    </Box>
                </Container1280>
            </Box>

            <Container1280 sx={{ pt: { xs: 2, md: 6 }, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
                <Typography variant="h4" color="text.primary">
                    {t('info.sellSection.title')}
                </Typography>
            </Container1280>

            <Container1280 sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', md: 'space-between' },
                        gap: 4,
                    }}
                >
                    {sellSteps.map((step, i) => (
                        <Box key={i} sx={{ width: 260, textAlign: 'center' }}>
                            <Box component="img" src={step.img} alt={step.title} sx={{ width: '100%', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {step.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {step.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container1280>

            <Container1280 sx={{ textAlign: 'center', py: 4 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate(isLoggedIn ? '/add-book' : '/login')}
                    sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.common.white }}
                >
                    {t('info.sellSection.cta')}
                </Button>
            </Container1280>

            <Container1280 sx={{ pt: 6, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}>
                <Typography variant="h4" color="text.primary">
                    {t('info.buySection.title')}
                </Typography>
            </Container1280>

            <Container1280 sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'center', md: 'space-between' },
                        gap: 4,
                    }}
                >
                    {buySteps.map((step, i) => (
                        <Box key={i} sx={{ width: 260, textAlign: 'center' }}>
                            <Box component="img" src={step.img} alt={step.title} sx={{ width: '100%', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {step.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {step.desc}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Container1280>

            <Container1280 sx={{ textAlign: 'center', py: 4, mb: 6 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/books')}
                    sx={{ bgcolor: theme.palette.primary.main, color: theme.palette.common.white }}
                >
                    {t('info.buySection.cta')}
                </Button>
            </Container1280>
        </Box>
    );
};

export default InfoPage;
