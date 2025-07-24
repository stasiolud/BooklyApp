import React, {useState, useEffect} from 'react';
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
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const AddBookPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();

    useEffect(() => {
        if (!localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const [form, setForm] = useState({
        title: '',
        description: '',
        bookCondition: '',
        authorName: '',
        price: '',
        file: null,
    });
    const [fileName, setFileName] = useState(t('addBook.noFileChosen'));
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    const validate = () => {
        const e = {};
        if (!form.title.trim()) {
            e.title = t('addBook.errors.titleRequired');
        }
        if (!form.description.trim()) {
            e.description = t('addBook.errors.descriptionRequired');
        }
        if (!form.bookCondition.trim()) {
            e.bookCondition = t('addBook.errors.conditionRequired');
        }
        if (!form.authorName.trim()) {
            e.authorName = t('addBook.errors.authorRequired');
        }

        const price = form.price.trim().replace(',', '.');
        if (!price) {
            e.price = t('addBook.errors.priceRequired');
        } else if (isNaN(price) || Number(price) <= 0) {
            e.price = t('addBook.errors.priceInvalid');
        } else {
            const dec = price.split('.')[1];
            if (dec && dec.length > 2) {
                e.price = t('addBook.errors.pricePrecision');
            }
        }

        if (!form.file) {
            e.file = t('addBook.errors.fileRequired');
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
        data.append('file', form.file);

        try {
            const res = await fetch('/api/books', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });
            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || t('addBook.snackbar.error'));
            }
            setSnackbar({open: true, message: t('addBook.snackbar.success'), severity: 'success'});
            const {book: createdBook} = await res.json();
            console.log(createdBook.id);
            navigate(`/book/${createdBook.id}`);
        } catch (err) {
            setSnackbar({open: true, message: err.message, severity: 'error'});
        }
    };

    return (
        <Box
            sx={{
                bgcolor: theme.palette.background.paper,
                minHeight: {
                    xs: `calc(100vh - ${theme.spacing(14)})`,
                    md: `calc(100vh - ${theme.spacing(8)})`
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
            }}
        >
            <Box sx={{maxWidth: 600, width: '100%'}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h5" gutterBottom>
                        {t('addBook.header')}
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{display: 'flex', flexDirection: 'column', gap: 3, mt: 2}}
                    >
                        <TextField
                            label={t('addBook.fields.title')}
                            value={form.title}
                            onChange={e => setForm({...form, title: e.target.value})}
                            error={!!errors.title}
                            helperText={errors.title}
                            fullWidth
                        />
                        <TextField
                            label={t('addBook.fields.description')}
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            error={!!errors.description}
                            helperText={errors.description}
                            fullWidth
                            multiline
                            minRows={4}
                            inputProps={{maxLength: 255}}
                        />
                        <TextField
                            label={t('addBook.fields.condition')}
                            value={form.bookCondition}
                            onChange={e => setForm({...form, bookCondition: e.target.value})}
                            error={!!errors.bookCondition}
                            helperText={errors.bookCondition}
                            fullWidth
                        />
                        <TextField
                            label={t('addBook.fields.author')}
                            value={form.authorName}
                            onChange={e => setForm({...form, authorName: e.target.value})}
                            error={!!errors.authorName}
                            helperText={errors.authorName}
                            fullWidth
                        />
                        <TextField
                            label={t('addBook.fields.price')}
                            value={form.price}
                            onChange={e => setForm({...form, price: e.target.value})}
                            error={!!errors.price}
                            helperText={errors.price}
                            fullWidth
                        />

                        <Box>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{
                                    textTransform: 'none',
                                    borderColor: errors.file ? theme.palette.error.main : undefined,
                                    color: errors.file ? theme.palette.error.main : undefined,
                                }}
                            >
                                {t('addBook.buttons.chooseFile')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => {
                                        const file = e.target.files?.[0] ?? null;
                                        setForm({...form, file});
                                        setFileName(file ? file.name : t('addBook.noFileChosen'));
                                    }}
                                />
                            </Button>
                            <Typography
                                variant="body2"
                                color={errors.file ? 'error' : 'text.secondary'}
                                sx={{
                                    mt: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                }}
                            >
                                {fileName}
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.common.white,
                                    '&:hover': {bgcolor: theme.palette.primary.main},
                                }}
                            >
                                {t('addBook.buttons.submit')}
                            </Button>
                        </Box>
                    </Box>
                </Paper>
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({...snackbar, open: false})}
            >
                <Alert
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    severity={snackbar.severity}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AddBookPage;
