import React, { useEffect, useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    useTheme,
    Snackbar,
    Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import { useTranslation } from 'react-i18next';

const EditBookPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        title: '',
        description: '',
        bookCondition: '',
        authorName: '',
        price: '',
        file: null
    });
    const [fileName, setFileName] = useState(t('editBook.noFileChosen'));
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const [bookData, setBookData] = useState(null);
    const [ownBook, setOwnBook] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [checkedAuth, setCheckedAuth] = useState(false);

    useEffect(() => {
        fetch(`/api/books/${id}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setBookData(data);
                setForm({
                    title: data.title,
                    description: data.description,
                    bookCondition: data.bookCondition,
                    authorName: data.authorName,
                    price: data.price.toString().replace('.', ','),
                    file: null
                });
            })
            .catch(() => navigate('/'));
    }, [id, navigate]);

    useEffect(() => {
        if (!bookData) return;
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            navigate('/');
            return;
        }
        const roles = decoded.roles || [];
        const email = decoded.sub;
        setIsAdmin(roles.includes('ROLE_ADMIN'));

        fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`)
            .then(res => res.json())
            .then(({ id: myId }) => {
                const ownerMatch = myId === bookData.userId;
                setOwnBook(ownerMatch);
                setCheckedAuth(true);
                if (!roles.includes('ROLE_ADMIN') && !ownerMatch) {
                    navigate('/');
                }
            })
            .catch(() => navigate('/'));
    }, [bookData, navigate]);

    const validate = () => {
        const e = {};
        if (!form.title.trim()) {
            e.title = t('editBook.errors.titleRequired');
        }
        if (!form.description.trim()) {
            e.description = t('editBook.errors.descriptionRequired');
        }
        if (!form.bookCondition.trim()) {
            e.bookCondition = t('editBook.errors.conditionRequired');
        }
        if (!form.authorName.trim()) {
            e.authorName = t('editBook.errors.authorRequired');
        }
        const price = form.price.trim().replace(',', '.');
        if (!price) {
            e.price = t('editBook.errors.priceRequired');
        } else if (isNaN(price) || Number(price) <= 0) {
            e.price = t('editBook.errors.priceInvalid');
        } else {
            const dec = price.split('.')[1];
            if (dec && dec.length > 2) {
                e.price = t('editBook.errors.pricePrecision');
            }
        }
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const eObj = validate();
        if (Object.keys(eObj).length) {
            setErrors(eObj);
            return;
        }
        setErrors({});

        const data = new FormData();
        data.append('title', form.title);
        data.append('description', form.description);
        data.append('bookCondition', form.bookCondition);
        data.append('authorName', form.authorName);
        data.append('price', form.price.trim().replace(',', '.'));
        if (form.file) data.append('file', form.file);

        try {
            const res = await fetch(`/api/books/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });
            if (!res.ok) throw new Error(await res.text());
            setSnackbar({ open: true, message: t('editBook.snackbar.success'), severity: 'success' });
            navigate(`/book/${id}`);
        } catch {
            setSnackbar({ open: true, message: t('editBook.snackbar.error'), severity: 'error' });
        }
    };

    if (!checkedAuth || !bookData) return null;

    return (
        <Box sx={{
            bgcolor: theme.palette.background.paper,
            minHeight: {
                xs: `calc(100vh - ${theme.spacing(14)})`,
                md: `calc(100vh - ${theme.spacing(8)})`
            },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2
        }}>
            <Box sx={{ maxWidth: 600, width: '100%' }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('editBook.header')}
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
                        <TextField
                            label={t('editBook.fields.title')}
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            error={!!errors.title}
                            helperText={errors.title}
                            fullWidth
                        />
                        <TextField
                            label={t('editBook.fields.description')}
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            error={!!errors.description}
                            helperText={errors.description}
                            fullWidth
                            multiline
                            minRows={4}
                        />
                        <TextField
                            label={t('editBook.fields.condition')}
                            value={form.bookCondition}
                            onChange={e => setForm({ ...form, bookCondition: e.target.value })}
                            error={!!errors.bookCondition}
                            helperText={errors.bookCondition}
                            fullWidth
                        />
                        <TextField
                            label={t('editBook.fields.author')}
                            value={form.authorName}
                            onChange={e => setForm({ ...form, authorName: e.target.value })}
                            error={!!errors.authorName}
                            helperText={errors.authorName}
                            fullWidth
                        />
                        <TextField
                            label={t('editBook.fields.price')}
                            value={form.price}
                            onChange={e => setForm({ ...form, price: e.target.value })}
                            error={!!errors.price}
                            helperText={errors.price}
                            fullWidth
                        />

                        <Box>
                            <Button variant="outlined" component="label" fullWidth>
                                {t('editBook.buttons.chooseNewPhoto')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0] ?? null;
                                        setForm({ ...form, file });
                                        setFileName(file ? file.name : t('editBook.noFileChosen'));
                                    }}
                                />
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                {fileName}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button type="submit" variant="contained" sx={{
                                bgcolor: theme.palette.primary.main,
                                color: theme.palette.common.white,
                                '&:hover': { bgcolor: theme.palette.primary.main }
                            }}>
                                {t('editBook.buttons.saveChanges')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditBookPage;
