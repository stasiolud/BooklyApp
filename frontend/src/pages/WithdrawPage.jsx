import React, {useEffect, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    useTheme,
    Pagination
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const WithdrawPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();

    const [balance, setBalance] = useState(null);
    const [history, setHistory] = useState([]);
    const [accountNumber, setAccountNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [errors, setErrors] = useState({});

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 4;

    const fetchHistory = useCallback(() => {
        const token = localStorage.getItem('token');
        fetch(`/api/withdrawals?page=${page}&size=${pageSize}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => {
                setHistory(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(console.error);
    }, [page]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        fetch('/api/user/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(me => setBalance(me.balance))
            .catch(() => navigate('/'));

        fetchHistory();
    }, [navigate, fetchHistory]);

    const handleSubmit = e => {
        e.preventDefault();
        const errs = {};
        const acct = accountNumber.replace(/\D/g, '');
        const amt = parseFloat(amount.replace(',', '.'));

        if (acct.length !== 26) {
            errs.accountNumber = t('withdraw.errors.accountNumberLength');
        }
        if (isNaN(amt) || amt <= 0) {
            errs.amount = t('withdraw.errors.amountInvalid');
        } else if (amt > balance) {
            errs.amount = t('withdraw.errors.amountExceeds');
        } else {
            const parts = amount.split('.');
            if (parts[1]?.length > 2) {
                errs.amount = t('withdraw.errors.amountPrecision');
            }
        }

        setErrors(errs);
        if (Object.keys(errs).length) return;

        const token = localStorage.getItem('token');
        fetch('/api/withdrawals', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ accountNumber: acct, amount: amt })
        })
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(newW => {
                setBalance(prev => +(prev - amt).toFixed(2));
                setAccountNumber('');
                setAmount('');
                setPage(0);
                fetchHistory();
            })
            .catch(() => alert(t('withdraw.alert.failure')));
    };

    if (balance === null) {
        return <Typography></Typography>;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, mb: 2, px: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
                {t('withdraw.header')}
            </Typography>
            <Typography variant="h6" gutterBottom>
                {t('withdraw.balance', { balance: balance.toFixed(2) })}
            </Typography>

            <Paper sx={{ p: 3, bgcolor: '#EFEFEF', borderRadius: 1, mb: 4 }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                >
                    <TextField
                        label={t('withdraw.fields.accountNumber')}
                        value={accountNumber}
                        onChange={e =>
                            setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 26))
                        }
                        error={!!errors.accountNumber}
                        helperText={errors.accountNumber}
                        inputProps={{ maxLength: 26 }}
                        fullWidth
                    />

                    <TextField
                        label={t('withdraw.fields.amount')}
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        error={!!errors.amount}
                        helperText={errors.amount}
                        fullWidth
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                                '&:hover': { bgcolor: theme.palette.primary.dark }
                            }}
                        >
                            {t('withdraw.buttons.withdraw')}
                        </Button>
                    </Box>
                </Box>
            </Paper>

            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
                {t('withdraw.historyTitle')}
            </Typography>

            {history.map(w => (
                <Paper
                    key={w.id}
                    sx={{ p: 2, bgcolor: '#EFEFEF', borderRadius: 1, mb: 2 }}
                >
                    <Typography>
                        <b>{t('withdraw.history.field.date')}</b>{' '}
                        {new Date(w.timestamp).toLocaleDateString('pl-PL')}
                    </Typography>
                    <Typography>
                        <b>{t('withdraw.history.field.accountNumber')}</b> {w.accountNumber}
                    </Typography>
                    <Typography>
                        <b>{t('withdraw.history.field.amount')}</b> {w.amount.toFixed(2)} zł
                    </Typography>
                </Paper>
            ))}

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, value) => setPage(value - 1)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default WithdrawPage;
