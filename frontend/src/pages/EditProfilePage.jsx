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
import {useNavigate, useParams} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const EditProfilePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {id: paramId} = useParams();
    const {t} = useTranslation();

    const [currentUserId, setCurrentUserId] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        description: '',
        balance: '',
        rating: '',
        file: null
    });
    const [fileName, setFileName] = useState(t('editProfile.noFileChosen'));
    const [errors, setErrors] = useState({});
    const [snackbar, setSnackbar] = useState({open: false, message: '', severity: 'success'});

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');
        let decoded;
        try {
            decoded = jwtDecode(token);
        } catch {
            return navigate('/login');
        }
        const {sub: email, roles = []} = decoded;
        setIsAdmin(roles.includes('ROLE_ADMIN'));

        fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(u => setCurrentUserId(u.id))
            .catch(() => navigate('/'));
    }, [navigate]);

    useEffect(() => {
        if (currentUserId === null) return;
        const isOwner = currentUserId.toString() === paramId;
        if (!isOwner && !isAdmin) navigate('/');
    }, [currentUserId, paramId, isAdmin, navigate]);

    useEffect(() => {
        fetch(`/api/user/${paramId}`)
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(u => {
                setForm({
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    description: u.description,
                    balance: u.balance.toString(),
                    rating: u.rating.toString(),
                    file: null
                });
            })
            .catch(() => navigate('/'));
    }, [paramId, navigate]);

    const validate = () => {
        const errs = {};

        if (!form.description.trim()) {
            errs.description = t('editProfile.errors.descriptionRequired');
        }

        if (isAdmin) {
            const namePattern = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,29}(?:[ -][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]{1,29})*$/;

            if (!form.firstName.trim()) {
                errs.firstName = t('editProfile.errors.firstNameRequired');
            } else if (!namePattern.test(form.firstName)) {
                errs.firstName = t('editProfile.errors.firstNameInvalid');
            }

            if (!form.lastName.trim()) {
                errs.lastName = t('editProfile.errors.lastNameRequired');
            } else if (!namePattern.test(form.lastName)) {
                errs.lastName = t('editProfile.errors.lastNameInvalid');
            }

            const bal = parseFloat(form.balance.replace(',', '.'));
            if (isNaN(bal)) {
                errs.balance = t('editProfile.errors.balanceNumeric');
            } else if (bal < 0) {
                errs.balance = t('editProfile.errors.balanceNonNegative');
            }

            const rat = Number(form.rating);
            if (!Number.isInteger(rat)) {
                errs.rating = t('editProfile.errors.ratingInteger');
            } else if (rat < 0) {
                errs.rating = t('editProfile.errors.ratingNonNegative');
            }
        }

        return errs;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const eObj = validate();
        if (Object.keys(eObj).length) return setErrors(eObj);
        setErrors({});

        const data = new FormData();
        if (isAdmin) {
            data.append('firstName', form.firstName);
            data.append('lastName', form.lastName);
            data.append('balance', form.balance);
            data.append('rating', form.rating);
        }
        data.append('description', form.description);
        if (form.file) data.append('file', form.file);

        try {
            const res = await fetch(`/api/user/${paramId}`, {
                method: 'PUT',
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`},
                body: data
            });
            if (!res.ok) {
                const txt = await res.text();
                throw new Error(txt || t('editProfile.snackbar.error'));
            }
            setSnackbar({open: true, message: t('editProfile.snackbar.success'), severity: 'success'});
            navigate(`/user/${paramId}`);
        } catch (err) {
            setSnackbar({open: true, message: t('editProfile.snackbar.error'), severity: 'error'});
        }
    };

    if (currentUserId === null || form.description === undefined) return null;

    return (
        <Box
            sx={{
                bgcolor: theme.palette.background.paper,
                minHeight: {
                    xs: `calc(100vh - ${theme.spacing(16)})`,
                    md: `calc(100vh - ${theme.spacing(8)})`
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2
            }}
        >
            <Box sx={{maxWidth: 600, width: '100%'}}>
                <Paper elevation={3} sx={{p: 4}}>
                    <Typography variant="h5" gutterBottom>
                        {t('editProfile.header')}
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{display: 'flex', flexDirection: 'column', gap: 3, mt: 2}}
                    >
                        {isAdmin && (
                            <>
                                <TextField
                                    label={t('editProfile.fields.firstName')}
                                    fullWidth
                                    value={form.firstName}
                                    onChange={e => setForm({...form, firstName: e.target.value})}
                                    error={!!errors.firstName}
                                    helperText={errors.firstName}
                                />
                                <TextField
                                    label={t('editProfile.fields.lastName')}
                                    fullWidth
                                    value={form.lastName}
                                    onChange={e => setForm({...form, lastName: e.target.value})}
                                    error={!!errors.lastName}
                                    helperText={errors.lastName}
                                />
                                <TextField
                                    label={t('editProfile.fields.balance')}
                                    fullWidth
                                    value={form.balance}
                                    onChange={e => setForm({...form, balance: e.target.value})}
                                    error={!!errors.balance}
                                    helperText={errors.balance}
                                />
                                <TextField
                                    label={t('editProfile.fields.rating')}
                                    fullWidth
                                    value={form.rating}
                                    onChange={e => setForm({...form, rating: e.target.value})}
                                    error={!!errors.rating}
                                    helperText={errors.rating}
                                />
                            </>
                        )}
                        <TextField
                            label={t('editProfile.fields.description')}
                            fullWidth
                            multiline
                            minRows={4}
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                        <Box>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{textTransform: 'none'}}
                            >
                                {t('editProfile.buttons.changePhoto')}
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={e => {
                                        const f = e.target.files?.[0] || null;
                                        setForm({...form, file: f});
                                        setFileName(f ? f.name : t('editProfile.noFileChosen'));
                                    }}
                                />
                            </Button>
                            <Typography variant="body2" color="text.secondary" sx={{mt: 1}}>
                                {fileName}
                            </Typography>
                        </Box>
                        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.common.white
                                }}
                            >
                                {t('editProfile.buttons.save')}
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
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({...snackbar, open: false})}
                    sx={{width: '100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EditProfilePage;
