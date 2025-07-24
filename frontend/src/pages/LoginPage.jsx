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
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import Link from '@mui/material/Link';
import {useTranslation} from 'react-i18next';
import i18n from "i18next";

const LoginPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [formErrors, setFormErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errors = {};
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = t('validation.emailRequired');
        } else if (!emailPattern.test(email)) {
            errors.email = t('validation.emailInvalid');
        }
        if (!password) {
            errors.password = t('validation.passwordRequired');
        } else if (password.length < 6) {
            errors.password = t('validation.passwordMin');
        }
        return errors;
    };

    const handleSubmit = async (e) => {
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
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json', 'Accept-Language': i18n.language},
                body: JSON.stringify({email, password})
            });
            const data = await res.json();
            if (!res.ok) {
                setServerError(data.message || t('error.loginFailed'));
            } else {
                localStorage.setItem('token', data.token);
                navigate('/');
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
                    {t('login.title')}
                </Typography>

                {serverError && (
                    <Alert severity="error" sx={{width: '100%', mb: 2}}>
                        {serverError}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    onInvalidCapture={(e) => e.preventDefault()}
                    sx={{width: '100%'}}
                >
                    <TextField
                        label={t('login.emailLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                    />

                    <TextField
                        label={t('login.passwordLabel')}
                        variant="standard"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!formErrors.password}
                        helperText={formErrors.password}
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
                        {loading ? t('login.loading') : t('login.submit')}
                    </Button>
                </Box>

                <Typography variant="body2" sx={{mt: 3}}>
                    {t('login.noAccount')}{' '}
                    <Link
                        component={RouterLink}
                        to="/register"
                        underline="hover"
                        sx={{color: theme.palette.primary.main}}
                    >
                        {t('login.register')}
                    </Link>
                </Typography>
            </Paper>
        </Box>
    );
};

export default LoginPage;
