import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    useTheme
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const OrderPage = () => {
    const {t} = useTranslation();
    const theme = useTheme();
    const {bookId} = useParams();
    const navigate = useNavigate();

    const [book, setBook] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        postalCode: '',
        street: '',
        streetNumber: '',
        apartmentNumber: '',
        cardNumber: '',
        expirationDate: '',
        cvc: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetch(`/api/books/${bookId}`)
            .then(res => (res.ok ? res.json() : Promise.reject()))
            .then(data => setBook(data))
            .catch(() => navigate('/'));
    }, [bookId, navigate]);

    useEffect(() => {
        if (book && book.available === false) {
            navigate('/');
        }
    }, [book, navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }

        fetch('/api/user/me', {headers: {Authorization: `Bearer ${token}`}})
            .then(res => (res.ok ? res.json() : Promise.reject()))
            .then(me =>
                setFormData(prev => ({
                    ...prev,
                    firstName: me.firstName || '',
                    lastName: me.lastName || '',
                    email: me.email || ''
                }))
            )
            .catch(() => {
            });
    }, []);

    const handleChange = e => {
        const {name, value} = e.target;
        let newValue = value;
        if (name === 'postalCode') {
            const digits = newValue.replace(/\D/g, '').slice(0, 5);
            newValue = digits.length > 2
                ? `${digits.slice(0, 2)}-${digits.slice(2)}`
                : digits;
        } else if (name === 'cardNumber') {
            const digits = newValue.replace(/\D/g, '').slice(0, 16);
            newValue = digits.replace(/(.{4})/g, '$1 ').trim();
        } else if (name === 'expirationDate') {
            const digits = newValue.replace(/\D/g, '').slice(0, 4);
            newValue = digits.length > 2
                ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                : digits;
        }
        setFormData(prev => ({...prev, [name]: newValue}));
        setErrors(prev => ({...prev, [name]: ''}));
    };

    const validateForm = () => {
        const errs = {};
        if (!formData.firstName.trim()) errs.firstName = t('orderPage.errors.firstName');
        if (!formData.lastName.trim()) errs.lastName = t('orderPage.errors.lastName');
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) errs.email = t('orderPage.errors.email');
        if (!/^\d{9,15}$/.test(formData.phone)) errs.phone = t('orderPage.errors.phone');
        if (!formData.city.trim()) errs.city = t('orderPage.errors.city');
        if (!/^[0-9]{2}-[0-9]{3}$/.test(formData.postalCode)) errs.postalCode = t('orderPage.errors.postalCode');
        if (!formData.street.trim()) errs.street = t('orderPage.errors.street');
        if (!formData.streetNumber.trim()) errs.streetNumber = t('orderPage.errors.streetNumber');

        const ccDigits = formData.cardNumber.replace(/\s/g, '');
        if (!/^\d{16}$/.test(ccDigits)) errs.cardNumber = t('orderPage.errors.cardNumber');

        const expDigits = formData.expirationDate.replace(/\D/g, '');
        if (expDigits.length !== 4) {
            errs.expirationDate = t('orderPage.errors.expirationDate');
        } else {
            const month = parseInt(expDigits.slice(0, 2), 10);
            if (month < 1 || month > 12) {
                errs.expirationDate = t('orderPage.errors.expirationDate');
            }
        }

        if (!/^\d{3,4}$/.test(formData.cvc)) errs.cvc = t('orderPage.errors.cvc');

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validateForm()) return;

        const payload = {
            bookId: parseInt(bookId, 10),
            shipment: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                city: formData.city,
                postalCode: formData.postalCode,
                street: formData.street,
                streetNumber: formData.streetNumber,
                apartmentNumber: formData.apartmentNumber
            },
            payment: {
                cardNumber: formData.cardNumber.replace(/\s/g, ''),
                expirationDate: formData.expirationDate,
                cvc: formData.cvc
            }
        };

        try {
            const res = await fetch('/api/transactions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(t('orderPage.alert.submitError'));
            const data = await res.json();
            navigate(`/order/success?transaction_id=${data.id}`);
        } catch {
            alert(t('orderPage.alert.submitError'));
        }
    };

    if (!book) return <Typography></Typography>;

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{
                maxWidth: 960,
                mx: 'auto',
                p: 2,
                display: 'flex',
                flexDirection: {xs: 'column', md: 'row'},
                gap: 2,
                alignItems: {md: 'flex-start'}
            }}
        >
            <Paper
                sx={{
                    flex: 1,
                    bgcolor: '#EFEFEF',
                    p: 2,
                    borderRadius: 1,
                    maxWidth: {md: 250}
                }}
            >
                <Typography variant="h6" gutterBottom>
                    {t('orderPage.summary.header')}
                </Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 1,
                        textAlign: 'center'
                    }}
                >
                    <Box
                        component="img"
                        src={book.pictureUrl || '/img/example_book.jpg'}
                        alt={book.title}
                        sx={{width: 200, height: 300, objectFit: 'cover', borderRadius: 1, mb: 1}}
                    />
                    <Typography variant="subtitle1" fontWeight="bold">
                        {book.title}
                    </Typography>
                    <Typography color="text.secondary">
                        {t('orderPage.summary.condition', {condition: book.bookCondition})}
                    </Typography>
                    <Typography sx={{color: '#D9BA8C', fontSize: '1.1rem', fontWeight: 'bold'}}>
                        {t('orderPage.summary.price', {price: (book.price).toFixed(2)})}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                        {t('orderPage.summary.shipping', {price: 10})}
                    </Typography>
                    <Box sx={{mt: 1, pt: 1, borderTop: '1px solid #cccccc'}}>
                        <Typography fontWeight="bold" variant="body1">
                            {t('orderPage.summary.total', {total: (book.price + 10).toFixed(2)})}
                        </Typography>
                    </Box>
                </Box>
            </Paper>

            <Box sx={{flex: 2, display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
                <Paper sx={{bgcolor: '#EFEFEF', p: 2, borderRadius: 1}}>
                    <Typography variant="h6" gutterBottom>
                        {t('orderPage.section.personalInfo')}
                    </Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                        <Box sx={{flex: '1 1 48%'}}>
                            <TextField
                                name="firstName"
                                label={t('orderPage.fields.firstName')}
                                fullWidth
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                            />
                        </Box>
                        <Box sx={{flex: '1 1 48%'}}>
                            <TextField
                                name="lastName"
                                label={t('orderPage.fields.lastName')}
                                fullWidth
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                            />
                        </Box>
                        <Box sx={{flex: '1 1 48%'}}>
                            <TextField
                                name="email"
                                label={t('orderPage.fields.email')}
                                fullWidth
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Box>
                        <Box sx={{flex: '1 1 48%'}}>
                            <TextField
                                name="phone"
                                label={t('orderPage.fields.phone')}
                                fullWidth
                                value={formData.phone}
                                onChange={handleChange}
                                error={!!errors.phone}
                                helperText={errors.phone}
                            />
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{bgcolor: '#EFEFEF', p: 2, borderRadius: 1}}>
                    <Typography variant="h6" gutterBottom>
                        {t('orderPage.section.shippingAddress')}
                    </Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 48%'}}}>
                            <TextField
                                name="city"
                                label={t('orderPage.fields.city')}
                                fullWidth
                                value={formData.city}
                                onChange={handleChange}
                                error={!!errors.city}
                                helperText={errors.city}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 48%'}}}>
                            <TextField
                                name="postalCode"
                                label={t('orderPage.fields.postalCode')}
                                fullWidth
                                value={formData.postalCode}
                                onChange={handleChange}
                                error={!!errors.postalCode}
                                helperText={errors.postalCode}
                                inputProps={{maxLength: 6}}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 31%'}}}>
                            <TextField
                                name="street"
                                label={t('orderPage.fields.street')}
                                fullWidth
                                value={formData.street}
                                onChange={handleChange}
                                error={!!errors.street}
                                helperText={errors.street}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 31%'}}}>
                            <TextField
                                name="streetNumber"
                                label={t('orderPage.fields.streetNumber')}
                                fullWidth
                                value={formData.streetNumber}
                                onChange={handleChange}
                                error={!!errors.streetNumber}
                                helperText={errors.streetNumber}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 31%'}}}>
                            <TextField
                                name="apartmentNumber"
                                label={t('orderPage.fields.apartmentNumber')}
                                fullWidth
                                value={formData.apartmentNumber}
                                onChange={handleChange}
                            />
                        </Box>
                    </Box>
                </Paper>

                <Paper sx={{bgcolor: '#EFEFEF', p: 2, borderRadius: 1}}>
                    <Typography variant="h6" gutterBottom>
                        {t('orderPage.section.payment')}
                    </Typography>
                    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                        <Box sx={{flex: '1 1 100%'}}>
                            <TextField
                                name="cardNumber"
                                label={t('orderPage.fields.cardNumber')}
                                fullWidth
                                value={formData.cardNumber}
                                onChange={handleChange}
                                error={!!errors.cardNumber}
                                helperText={errors.cardNumber}
                                inputProps={{maxLength: 19}}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 48%'}}}>
                            <TextField
                                name="expirationDate"
                                label={t('orderPage.fields.expirationDate')}
                                fullWidth
                                value={formData.expirationDate}
                                onChange={handleChange}
                                error={!!errors.expirationDate}
                                helperText={errors.expirationDate}
                                inputProps={{maxLength: 5}}
                            />
                        </Box>
                        <Box sx={{flex: {xs: '1 1 100%', sm: '1 1 48%'}}}>
                            <TextField
                                name="cvc"
                                label={t('orderPage.fields.cvc')}
                                fullWidth
                                value={formData.cvc}
                                onChange={handleChange}
                                error={!!errors.cvc}
                                helperText={errors.cvc}
                                inputProps={{maxLength: 4}}
                            />
                        </Box>
                    </Box>
                </Paper>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        fontWeight: 'bold',
                        py: 1.5,
                        borderRadius: 1,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.common.white,
                        '&:hover': {bgcolor: theme.palette.primary.main}
                    }}
                >
                    {t('orderPage.buttons.submit')}
                </Button>
            </Box>
        </Box>
    );
};

export default OrderPage;
