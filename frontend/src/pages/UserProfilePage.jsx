import React, {useEffect, useState} from 'react';
import {
    Box,
    Avatar,
    Typography,
    Button,
    Pagination,
    useTheme
} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const UserProfilePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {id} = useParams();
    const {t} = useTranslation();

    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [ownProfile, setOwnProfile] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const {sub: email, roles = []} = decoded;
                setIsAdmin(roles.includes('ROLE_ADMIN'));

                fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`)
                    .then(res => res.json())
                    .then(({id: myId}) => {
                        setOwnProfile(myId.toString() === id);
                    });
            } catch {

            }
        }
    }, [id]);


    useEffect(() => {
        fetch(`/api/user/${id}`)
            .then(res => {
                if (!res.ok) throw new Error(t('userProfile.errors.userNotFound'));
                return res.json();
            })
            .then(setUser)
            .catch(() => navigate('/'));
    }, [id, navigate, t]);


    useEffect(() => {
        fetch(`/api/books?userId=${id}&page=${page}&size=10`)
            .then(res => {
                if (!res.ok) throw new Error(t('userProfile.errors.fetchBooks'));
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) {
                    setBooks(data);
                    setTotalPages(1);
                } else {
                    setBooks(data.content || []);
                    setTotalPages(data.totalPages || 0);
                }
            })
            .catch(() => {
                setBooks([]);
                setTotalPages(0);
            });
    }, [id, page, t]);

    if (!user) return null;

    const showPanel = ownProfile || isAdmin;

    return (
        <>
            <Box
                sx={{
                    mt: {xs: 1, md: 6},
                    mx: 'auto',
                    maxWidth: 1280,
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: {xs: 'column', md: 'row'},
                    bgcolor: '#EFEFEF',
                    borderRadius: 1,
                    overflow: 'hidden'
                }}
            >

                <Box
                    sx={{
                        p: 2,
                        borderRight: {xs: 'none', md: `1px solid ${theme.palette.divider}`},
                        borderBottom: {xs: `1px solid ${theme.palette.divider}`, md: 'none'},
                        width: {xs: '100%', md: 260},
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Avatar
                        src={user.profilePictureUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        sx={{width: {xs: 60, md: 200}, height: {xs: 60, md: 200}}}
                    />
                </Box>


                <Box sx={{position: 'relative', flex: 1, p: 3}}>
                    <Typography variant="h4" gutterBottom>
                        {user.firstName} {user.lastName}
                    </Typography>

                    <Typography variant="body1" sx={{mb: 2}}>
                        {t('userProfile.transactions', {count: user.rating})}
                    </Typography>

                    {(ownProfile || isAdmin) && (
                        <Typography variant="body1" sx={{mb: 2}}>
                            {t('userProfile.balance', {balance: user.balance})}
                        </Typography>
                    )}

                    <Typography variant="subtitle1" gutterBottom>
                        {t('userProfile.about')}
                    </Typography>
                    <Typography variant="body2" sx={{mb: 4, maxWidth: 500}}>
                        {user.description}
                    </Typography>


                    {showPanel && (
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 1,
                                flexDirection: {xs: 'row', md: 'column'},
                                position: {xs: 'static', md: 'absolute'},
                                top: {md: 16},
                                right: {md: 16},
                                mt: {xs: 2, md: 0}
                            }}
                        >
                            {ownProfile && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        navigate('/');
                                    }}
                                    sx={{
                                        flex: {xs: 1, md: 'none'},
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.common.white,
                                        '&:hover': {bgcolor: theme.palette.primary.main}
                                    }}
                                >
                                    {t('userProfile.logout')}
                                </Button>
                            )}

                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/user/${id}/edit`)}
                                sx={{
                                    flex: {xs: 1, md: 'none'},
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: 'white',
                                        borderColor: theme.palette.primary.main
                                    }
                                }}
                            >
                                {t('userProfile.editProfile')}
                            </Button>

                            {ownProfile && isAdmin ? (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/user-management')}
                                        sx={{
                                            flex: {xs: 1, md: 'none'},
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                backgroundColor: 'white',
                                                borderColor: theme.palette.primary.main
                                            }
                                        }}
                                    >
                                        {t('userProfile.users')}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => navigate('/book-management')}
                                        sx={{
                                            flex: {xs: 1, md: 'none'},
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                backgroundColor: 'white',
                                                borderColor: theme.palette.primary.main
                                            }
                                        }}
                                    >
                                        {t('userProfile.books')}
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            ownProfile ? navigate('/history') : navigate(`/user/${id}/history`)
                                        }
                                        sx={{
                                            flex: {xs: 1, md: 'none'},
                                            borderColor: theme.palette.primary.main,
                                            color: theme.palette.primary.main,
                                            backgroundColor: 'white',
                                            '&:hover': {
                                                backgroundColor: 'white',
                                                borderColor: theme.palette.primary.main
                                            }
                                        }}
                                    >
                                        {t('userProfile.history')}
                                    </Button>
                                    {ownProfile && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/withdraw')}
                                            sx={{
                                                flex: {xs: 1, md: 'none'},
                                                borderColor: theme.palette.primary.main,
                                                color: theme.palette.primary.main,
                                                backgroundColor: 'white',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                    borderColor: theme.palette.primary.main
                                                }
                                            }}
                                        >
                                            {t('userProfile.withdraw')}
                                        </Button>
                                    )}
                                </>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>


            <Box sx={{maxWidth: 1280, mx: 'auto', mt: 4, mb: 4, px: 2}}>
                <Typography variant="h5" gutterBottom>
                    {t('userProfile.bookSectionTitle', {name: user.firstName})}
                </Typography>

                {books.length === 0 ? (
                    <Typography color="text.secondary">
                        {t('userProfile.noBooks')}
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: {xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)'},
                            gap: 2,
                            mt: 2
                        }}
                    >
                        {books.map(book => (
                            <Box
                                key={book.id}
                                onClick={() => navigate(`/book/${book.id}`)}
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
                                <Box sx={{p: 1}}>
                                    <Typography variant="subtitle2" noWrap>
                                        {book.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {book.bookCondition}
                                    </Typography>
                                    <Typography variant="body2" color="primary">
                                        {t('userProfile.price', {price: book.price})}
                                    </Typography>
                                    <Typography variant="caption">
                                        {t('userProfile.priceWithShipping', {price: (book.price + 10).toFixed(2)})}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}

                {books.length > 0 && totalPages > 1 && (
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 4}}>
                        <Pagination
                            count={totalPages}
                            page={page + 1}
                            onChange={(e, value) => setPage(value - 1)}
                            color="primary"
                        />
                    </Box>
                )}
            </Box>
        </>
    );
};

export default UserProfilePage;
