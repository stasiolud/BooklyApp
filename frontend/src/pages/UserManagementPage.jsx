import React, { useEffect, useState } from 'react';
import {
    Box,
    Avatar,
    Typography,
    Button,
    Pagination,
    Paper,
    TextField,
    useTheme,
    useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const UserManagementPage = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const pageSize = isMobile ? 2 : 8;
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', pageSize);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        fetch(`/api/admin/users?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) throw new Error('No access');
                return res.json();
            })
            .then(data => {
                setUsers(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(() => navigate('/'));
    }, [page, searchTerm, navigate, pageSize]);

    return (
        <Box sx={{ maxWidth: 1280, mx: 'auto', mt: 4, px: 2 }}>
            <Typography variant="h4" gutterBottom>
                {t('userManagement.header')}
            </Typography>

            <TextField
                label={t('userManagement.searchPlaceholder')}
                variant="outlined"
                fullWidth
                sx={{ mb: 3 }}
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1,1fr)', sm: 'repeat(2,1fr)', md: 'repeat(4,1fr)' },
                    gap: 2
                }}
            >
                {users.map(u => (
                    <Paper
                        key={u.id}
                        onClick={() => navigate(`/user/${u.id}`)}
                        sx={{
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 4 }
                        }}
                    >
                        <Box>
                            <Avatar
                                src={u.profilePictureUrl}
                                alt={`${u.firstName} ${u.lastName}`}
                                sx={{ width: 64, height: 64, mb: 1, mx: 'auto' }}
                            />
                            <Typography variant="h6">
                                {u.firstName} {u.lastName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {u.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('userManagement.rating', { rating: u.rating })}{' '}
                                {t('userManagement.balance', { balance: u.balance })}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    mb: 2,
                                    minHeight: 48,
                                    overflow: 'hidden',
                                    display: '-webkit-box',
                                    WebkitBoxOrient: 'vertical',
                                    WebkitLineClamp: 3
                                }}
                            >
                                {u.description}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={e => { e.stopPropagation(); navigate(`/user/${u.id}/edit`); }}
                                sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'white',
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                {t('userManagement.buttons.editProfile')}
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={e => { e.stopPropagation(); navigate(`/user/${u.id}/history`); }}
                                sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'white',
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                {t('userManagement.buttons.history')}
                            </Button>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, v) => setPage(v - 1)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default UserManagementPage;
