import React, {useState} from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    useTheme,
    Alert
} from '@mui/material';
import {useNavigate, Link as RouterLink} from 'react-router-dom';
import Link from '@mui/material/Link';
import {useTranslation} from 'react-i18next';
import i18n from "i18next";

const RegisterPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errors = {};
        const namePattern = /^[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+(?:[ -][A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+)*$/;

        if (!firstName.trim()) {
            errors.firstName = t('validation.firstNameRequired');
        } else if (!namePattern.test(firstName)) {
            errors.firstName = t('validation.firstNameInvalid');
        }

        if (!lastName.trim()) {
            errors.lastName = t('validation.lastNameRequired');
        } else if (!namePattern.test(lastName)) {
            errors.lastName = t('validation.lastNameInvalid');
        }

        const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!email) {
            errors.email = t('validation.emailRequired');
        } else if (!emailRegex.test(email)) {
            errors.email = t('validation.emailInvalid');
        }

        if (!password) {
            errors.password = t('validation.passwordRequired');
        } else if (password.length < 6) {
            errors.password = t('validation.passwordMin');
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = t('validation.confirmPasswordMismatch');
        }

        return errors;
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setServerError('');
        const errors = validate();
        if (Object.keys(errors).length) {
            setFormErrors(errors);
            return;
        }
        setFormErrors({});
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Language': i18n.language
                },
                body: JSON.stringify({firstName, lastName, email, password})
            });

            const data = await res.json();
            if (!res.ok) {
                setServerError(data.message || t('error.registration'));
            } else {
                navigate('/register-success');
            }
        } catch {
            setServerError(t('error.network'));
        } finally {
            setLoading(false);
        }
    };


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
                <Typography variant="h5" sx={{mb: 2}}>
                    {t('register.title')}
                </Typography>

                {serverError && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {serverError}
                    </Alert>
                )}

                <Box
                    component="form"
                    noValidate
                    onInvalidCapture={e => e.preventDefault()}
                    onSubmit={handleSubmit}
                    sx={{width: '100%'}}
                >
                    <TextField
                        label={t('register.firstNameLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        error={!!formErrors.firstName}
                        helperText={formErrors.firstName}
                    />
                    <TextField
                        label={t('register.lastNameLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        error={!!formErrors.lastName}
                        helperText={formErrors.lastName}
                    />
                    <TextField
                        label={t('register.emailLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                    />
                    <TextField
                        label={t('register.passwordLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        error={!!formErrors.password}
                        helperText={formErrors.password}
                    />
                    <TextField
                        label={t('register.confirmPasswordLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        error={!!formErrors.confirmPassword}
                        helperText={formErrors.confirmPassword}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        disabled={loading}
                        sx={{
                            mt: 3,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.common.white
                        }}
                    >
                        {loading ? t('register.loading') : t('register.submit')}
                    </Button>
                </Box>

                <Typography variant="body2" sx={{mt: 3}}>
                    {t('register.haveAccount')}{' '}
                    <Link
                        component={RouterLink}
                        to="/login"
                        underline="hover"
                        sx={{color: theme.palette.primary.main}}
                    >
                        {t('register.login')}
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default RegisterPage;
