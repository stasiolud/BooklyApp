import React, {useEffect, useState} from 'react';
import {
    Box,
    Avatar,
    Typography,
    Button,
    Pagination,
    Paper,
    TextField,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

const BookManagementPage = () => {
    const {t} = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const pageSize = isMobile ? 6 : 10;
    const navigate = useNavigate();

    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('size', pageSize);
        if (searchTerm.trim()) params.append('search', searchTerm.trim());

        fetch(`/api/admin/books?${params.toString()}`, {
            headers: {Authorization: `Bearer ${token}`}
        })
            .then(res => {
                if (!res.ok) throw new Error('No access');
                return res.json();
            })
            .then(data => {
                setBooks(data.content);
                setTotalPages(data.totalPages);
            })
            .catch(() => navigate('/'));
    }, [page, searchTerm, navigate, pageSize]);

    const confirmDelete = (bookId) => {
        setBookToDelete(bookId);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/books/${bookToDelete}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${token}`}
            });
            if (!res.ok) throw new Error(t('bookManagement.dialog.deleteError'));
            setBooks(prev => prev.filter(b => b.id !== bookToDelete));
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleteDialogOpen(false);
            setBookToDelete(null);
        }
    };

    return (
        <Box sx={{maxWidth: 1280, mx: 'auto', mt: 2, px: 2}}>
            <Typography variant="h4" gutterBottom>
                {t('bookManagement.header')}
            </Typography>

            <TextField
                label={t('bookManagement.searchPlaceholder')}
                variant="outlined"
                fullWidth
                sx={{mb: 3}}
                value={searchTerm}
                onChange={e => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                }}
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: 'repeat(2, 1fr)',
                        sm: 'repeat(3, 1fr)',
                        md: 'repeat(5, 1fr)'
                    },
                    gap: 2,
                    mt: 2
                }}
            >
                {books.map(book => (
                    <Paper
                        key={book.id}
                        onClick={() => navigate(`/book/${book.id}`)}
                        sx={{
                            cursor: 'pointer',
                            bgcolor: 'white',
                            borderRadius: 1,
                            overflow: 'hidden',
                            boxShadow: 1,
                            transition: 'transform 0.2s',
                            '&:hover': {transform: 'scale(1.02)'}
                        }}
                    >
                        <Box sx={{display: 'flex', alignItems: 'center', p: 1, gap: 1}}>
                            <Avatar
                                src={book.userProfilePictureUrl || '/img/default_avatar.png'}
                                alt={book.userFirstName}
                                sx={{width: 32, height: 32}}
                            />
                            <Typography
                                variant="body2"
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/user/${book.userId}`);
                                }}
                                sx={{cursor: 'pointer', fontWeight: 'bold'}}
                            >
                                {book.userFirstName}
                            </Typography>
                        </Box>

                        <Box sx={{height: 300, overflow: 'hidden'}}>
                            <img
                                src={book.pictureUrl || '/img/example_book.jpg'}
                                alt={book.title}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    objectPosition: 'center'
                                }}
                            />
                        </Box>

                        <Box sx={{p: 1, flexGrow: 1}}>
                            <Typography variant="subtitle2" noWrap>{book.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {book.bookCondition}
                            </Typography>
                            <Typography variant="body2" color="primary">
                                {t('bookManagement.price', {price: (book.price).toFixed(2)})}
                            </Typography>
                            <Typography variant="caption">
                                {t('bookManagement.priceWithShipping', {price: (book.price + 10).toFixed(2)})}
                            </Typography>
                        </Box>

                        <Box sx={{display: 'flex', gap: 1, p: 1}}>
                            <Button
                                size="small"
                                variant="outlined"
                                fullWidth
                                onClick={e => {
                                    e.stopPropagation();
                                    navigate(`/book/edit/${book.id}`);
                                }}
                            >
                                {t('bookManagement.buttons.edit')}
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                fullWidth
                                onClick={e => {
                                    e.stopPropagation();
                                    confirmDelete(book.id);
                                }}
                            >
                                {t('bookManagement.buttons.delete')}
                            </Button>
                        </Box>
                    </Paper>
                ))}
            </Box>

            {totalPages > 1 && (
                <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={(_, v) => setPage(v - 1)}
                        color="primary"
                    />
                </Box>
            )}

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
            >
                <DialogTitle>{t('bookManagement.dialog.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('bookManagement.dialog.deleteDescription')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        {t('bookManagement.dialog.cancel')}
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        {t('bookManagement.dialog.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BookManagementPage;
