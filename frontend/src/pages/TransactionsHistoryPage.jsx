import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    useTheme,
    Pagination
} from '@mui/material';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const TransactionsHistoryPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const {id: userIdParam} = useParams();
    const pageSize = 3;

    const [isAdmin, setIsAdmin] = useState(false);
    const [bought, setBought] = useState([]);
    const [boughtPage, setBoughtPage] = useState(0);
    const [boughtTotalPages, setBoughtTotalPages] = useState(0);

    const [sold, setSold] = useState([]);
    const [soldPage, setSoldPage] = useState(0);
    const [soldTotalPages, setSoldTotalPages] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            navigate('/login');
            return;
        }
        const {roles = []} = decoded;
        const admin = roles.includes('ROLE_ADMIN');
        setIsAdmin(admin);

        if (userIdParam && !admin) {
            navigate('/');
        }
    }, [userIdParam, navigate]);

    const fetchList = useCallback((endpoint, page, setList, setTotal) => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
            page: page.toString(),
            size: pageSize.toString()
        });
        if (isAdmin && userIdParam) {
            params.append('userId', userIdParam);
        }

        fetch(`${endpoint}?${params.toString()}`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                setList(data.content);
                setTotal(data.totalPages);
            })
            .catch(() => navigate('/login'));
    }, [isAdmin, userIdParam, navigate]);

    useEffect(() => {
        fetchList('/api/transactions/bought', boughtPage, setBought, setBoughtTotalPages);
    }, [boughtPage, fetchList]);

    useEffect(() => {
        fetchList('/api/transactions/sold', soldPage, setSold, setSoldTotalPages);
    }, [soldPage, fetchList]);

    const renderTxCard = tx => {
        const totalPrice = (parseFloat(tx.book.price) + 10).toFixed(2);
        return (
            <Paper
                key={tx.id}
                sx={{
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    gap: 3,
                    p: 2,
                    bgcolor: '#EFEFEF',
                    borderRadius: 1,
                    alignItems: 'stretch',
                    mb: 2
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
                        src={tx.book.pictureUrl || '/img/example_book.jpg'}
                        alt={tx.book.title}
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
                        {t('transactionsPage.section.bookInfo')}
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Typography>
                            <b>{t('transactionsPage.field.bookTitle')}</b> {tx.book.title}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.bookCondition')}</b> {tx.book.bookCondition}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.priceWithShipping')}</b> {totalPrice} zł
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.date')}</b>{' '}
                            {new Date(tx.timestamp).toLocaleDateString('pl-PL')}
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
                        {t('transactionsPage.section.shipping')}
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
                        <Typography>
                            <b>{t('transactionsPage.field.firstName')}</b> {tx.shipment.firstName}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.lastName')}</b> {tx.shipment.lastName}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.city')}</b> {tx.shipment.city}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.postalCode')}</b> {tx.shipment.postalCode}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.street')}</b> {tx.shipment.street}{' '}
                            {tx.shipment.streetNumber}
                        </Typography>
                        <Typography>
                            <b>{t('transactionsPage.field.apartment')}</b>{' '}
                            {tx.shipment.apartmentNumber || t('transactionsPage.none')}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{maxWidth: 1280, mx: 'auto', mt: 4, mb: 2, px: 2}}>
            <Typography variant="h5" gutterBottom>
                {userIdParam
                    ? t('transactionsPage.boughtTitleForUser', {userId: userIdParam})
                    : t('transactionsPage.boughtTitle')}
            </Typography>
            {bought.length
                ? bought.map(renderTxCard)
                : <Typography color="text.secondary">{t('transactionsPage.noBought')}</Typography>
            }
            {boughtTotalPages > 1 && (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                    <Pagination
                        count={boughtTotalPages}
                        page={boughtPage + 1}
                        onChange={(_, v) => setBoughtPage(v - 1)}
                        color="primary"
                    />
                </Box>
            )}

            <Typography variant="h5" gutterBottom sx={{mt: 6}}>
                {userIdParam
                    ? t('transactionsPage.soldTitleForUser', {userId: userIdParam})
                    : t('transactionsPage.soldTitle')}
            </Typography>
            {sold.length
                ? sold.map(renderTxCard)
                : <Typography color="text.secondary">{t('transactionsPage.noSold')}</Typography>
            }
            {soldTotalPages > 1 && (
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 2}}>
                    <Pagination
                        count={soldTotalPages}
                        page={soldPage + 1}
                        onChange={(_, v) => setSoldPage(v - 1)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default TransactionsHistoryPage;
