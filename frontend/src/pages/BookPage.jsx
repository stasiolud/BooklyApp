import React, {useEffect, useState} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    useTheme,
    Pagination,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const BookPage = () => {
    const {t} = useTranslation();
    const {id} = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const [book, setBook] = useState(null);
    const [otherBooks, setOtherBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [ownBook, setOwnBook] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        fetch(`/api/books/${id}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(setBook)
            .catch(() => navigate('/'));
    }, [id, navigate]);

    useEffect(() => {
        if (book && book.available === false) {
            navigate('/');
        }
    }, [book, navigate]);

    useEffect(() => {
        if (!book?.userId) return;

        fetch(`/api/books?userId=${book.userId}&page=${page}&size=10`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setOtherBooks(data.content || []);
                setTotalPages(data.totalPages || 0);
            })
            .catch(() => {
                setOtherBooks([]);
                setTotalPages(0);
            });

        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const roles = decoded.roles || [];
                setIsAdmin(roles.includes('ROLE_ADMIN'));
                fetch(`/api/user/by-email?email=${encodeURIComponent(decoded.sub)}`)
                    .then(res => res.json())
                    .then(({id: myId}) => {
                        setOwnBook(myId === book.userId);
                    });
            } catch {
                setOwnBook(false);
                setIsAdmin(false);
            }
        } else {
            setOwnBook(false);
            setIsAdmin(false);
        }
    }, [book, page]);

    if (!book) return null;

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/books/${book.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!res.ok) throw new Error(t('bookPage.dialog.deleteError'));
            navigate(`/user/${book.userId}`);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleBuyNow = () => {
        if (!localStorage.getItem('token')) {
            navigate('/login');
        } else {
            navigate(`/order/${book.id}`);
        }
    };
    return (
        <>
            <Box
                sx={{
                    maxWidth: 960,
                    mx: 'auto',
                    mt: 2,
                    px: 2,
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    gap: 2
                }}
            >
                <Box
                    component="img"
                    src={book.pictureUrl || '/img/example_book.jpg'}
                    alt={book.title}
                    sx={{
                        width: {xs: '100%', md: 400},
                        height: {xs: 'auto', md: 600},
                        objectFit: 'cover',
                        borderRadius: 1
                    }}
                />

                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        bgcolor: '#EFEFEF',
                        height: {xs: 'auto', md: 600},
                        justifyContent: 'space-between'
                    }}
                >
                    <Box>
                        <Box
                            sx={{
                                bgcolor: '#EFEFEF',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                borderBottom: '1px solid #cccccc'
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                {book.title}
                            </Typography>
                            <Typography variant="body2">
                                {book.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('bookPage.addedBy')}{' '}
                                <Box
                                    component="span"
                                    sx={{color: '#D9BA8C', cursor: 'pointer'}}
                                    onClick={() => navigate(`/user/${book.userId}`)}
                                >
                                    {book.userFirstName}
                                </Box>
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                bgcolor: '#EFEFEF',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                borderBottom: '1px solid #cccccc'
                            }}
                        >
                            <Typography variant="body2">
                                {t('bookPage.price', {price: (book.price).toFixed(2)})}
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                                {t('bookPage.priceWithShipping', {price: (book.price + 10).toFixed(2)})}
                            </Typography>
                            <Typography variant="body2" sx={{color: '#D9BA8C'}}>
                                {t('bookPage.protectionIncluded')}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                bgcolor: '#EFEFEF',
                                p: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                borderBottom: '1px solid #cccccc'
                            }}
                        >
                            <Typography variant="body2">
                                <strong>{t('bookPage.field.author')}:</strong> {book.authorName}
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                bgcolor: '#EFEFEF',
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                        >
                            <Typography variant="body2">
                                {t('bookPage.shippingLabel')}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                                {t('bookPage.shippingFrom', {price: 10})}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{p: 2, display: 'flex', flexDirection: 'column', gap: 1}}>
                        {ownBook || isAdmin ? (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate(`/book/edit/${book.id}`)}
                                    sx={{
                                        fontSize: '16px',
                                        width: '100%',
                                        borderColor: '#D9BA8C',
                                        color: '#D9BA8C',
                                        '&:hover': {
                                            borderColor: '#D9BA8C',
                                            backgroundColor: 'rgba(217,186,140,0.1)'
                                        }
                                    }}
                                >
                                    {t('bookPage.buttons.edit')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => setDeleteDialogOpen(true)}
                                    sx={{fontSize: '16px', width: '100%'}}
                                >
                                    {t('bookPage.buttons.delete')}
                                </Button>
                            </>
                        ) : ownBook === false ? (
                            <Button
                                variant="contained"
                                disableElevation
                                onClick={handleBuyNow}
                                sx={{
                                    backgroundColor: '#D9BA8C',
                                    fontSize: '16px',
                                    width: '100%',
                                    color: 'white',
                                    '&:hover': {bgcolor: '#D9BA8C'}
                                }}
                            >
                                {t('bookPage.buttons.buyNow')}
                            </Button>
                        ) : null}
                    </Box>

                    <Box sx={{bgcolor: '#EFEFEF', p: 2, borderRadius: 1}}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {t('bookPage.protectionFeeTitle')}
                        </Typography>
                        <Typography variant="body2">
                            {t('bookPage.protectionFeeDescription')}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{maxWidth: 1280, mx: 'auto', mt: 4, mb: 4, px: 2}}>
                <Typography variant="h5" gutterBottom>
                    {t('bookPage.otherBooksTitle', {name: book.userFirstName})}
                </Typography>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)'},
                        gap: 2,
                        mt: 2
                    }}
                >
                    {otherBooks.map(b => (
                        <Box
                            key={b.id}
                            onClick={() => navigate(`/book/${b.id}`)}
                            sx={{
                                cursor: 'pointer',
                                bgcolor: 'white',
                                borderRadius: 1,
                                overflow: 'hidden',
                                boxShadow: 1
                            }}
                        >
                            <Box sx={{height: 300, overflow: 'hidden'}}>
                                <img
                                    src={b.pictureUrl || '/img/example_book.jpg'}
                                    alt={b.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center'
                                    }}
                                />
                            </Box>
                            <Box sx={{p: 1}}>
                                <Typography variant="subtitle2" noWrap>
                                    {b.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {b.bookCondition}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    {t('bookPage.price', {price: (b.price).toFixed(2)})}
                                </Typography>
                                <Typography variant="caption">
                                    {t('bookPage.priceWithShipping', {price: (b.price + 10).toFixed(2)})}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
                {totalPages > 1 && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                        <Pagination
                            count={totalPages}
                            page={page + 1}
                            onChange={(_, value) => setPage(value - 1)}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>{t('bookPage.dialog.deleteTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('bookPage.dialog.deleteDescription')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        {t('bookPage.buttons.cancel')}
                    </Button>
                    <Button onClick={handleDelete} color="error">
                        {t('bookPage.buttons.delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BookPage;
