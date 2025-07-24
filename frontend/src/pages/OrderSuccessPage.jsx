import React, {useEffect, useState} from 'react';
import {useSearchParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    CircularProgress,
    useTheme
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const OrderSuccessPage = () => {
    const {t} = useTranslation();
    const theme = useTheme();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const transactionId = searchParams.get('transaction_id');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!transactionId) {
            navigate('/login');
            return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        fetch(`/api/transactions/${transactionId}`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(json => setData(json))
            .catch(() => navigate('/login'))
            .finally(() => setLoading(false));
    }, [transactionId, navigate]);

    if (loading) {
        return (
            <Box sx={{mt: 8, textAlign: 'center'}}>
                <CircularProgress/>
            </Box>
        );
    }
    if (!data) return null;

    const {book, shipment} = data;
    const totalPrice = (book.price + 10).toFixed(2);

    return (
        <Box>
            <Box
                sx={{
                    mt: 2,
                    mb: 2,
                    px: 2,
                    textAlign: 'center'
                }}
            >
                <Typography variant="h4" component="h1">
                    {t('orderSuccess.header')}
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    px: {xs: 2, md: 4},
                    maxWidth: 1280,
                    mx: 'auto'
                }}
            >
                <Paper
                    sx={{
                        display: 'flex',
                        mb: 2,
                        flexDirection: {xs: 'column', md: 'row'},
                        gap: 3,
                        p: 2,
                        bgcolor: '#EFEFEF',
                        borderRadius: 1,
                        alignItems: 'stretch'
                    }}
                >
                    <Box
                        sx={{
                            flex: {xs: '0 0 auto', md: '0 0 12%'},
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Box
                            component="img"
                            src={book.pictureUrl || '/img/example_book.jpg'}
                            alt={book.title}
                            sx={{
                                width: {xs: 150},
                                height: {xs: 200, md: 200},
                                objectFit: 'cover',
                                borderRadius: 1
                            }}
                        />
                    </Box>

                    <Box
                        sx={{
                            flex: {xs: '1 1 100%', md: '1 1 33%'},
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            borderRight: {xs: 'none', md: '1px solid #CCCCCC'},
                            pb: {xs: 2, md: 0}
                        }}
                    >
                        <Typography variant="h6">
                            {t('orderSuccess.section.bookInfo')}
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            <Typography>
                                <b>{t('orderSuccess.field.bookTitle')}</b> {book.title}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.bookCondition')}</b> {book.bookCondition}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.totalPrice')}</b> {totalPrice} zł
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            flex: {xs: '1 1 100%', md: '1 1 40%'},
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                            pt: {xs: 2, md: 0}
                        }}
                    >
                        <Typography variant="h6">
                            {t('orderSuccess.section.shipping')}
                        </Typography>
                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                            <Typography>
                                <b>{t('orderSuccess.field.firstName')}</b> {shipment.firstName}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.lastName')}</b> {shipment.lastName}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.city')}</b> {shipment.city}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.postalCode')}</b> {shipment.postalCode}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.street')}</b> {shipment.street}{' '}
                                {shipment.streetNumber}
                            </Typography>
                            <Typography>
                                <b>{t('orderSuccess.field.apartmentNumber')}</b>{' '}
                                {shipment.apartmentNumber || t('orderSuccess.none')}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};

export default OrderSuccessPage;
