import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Typography,
    Avatar,
    Pagination,
    useTheme
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const HomePage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();

    const [user, setUser] = useState(null);
    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const {sub: email} = jwtDecode(token);
            fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`)
                .then(res => res.ok ? res.json() : null)
                .then(data => setUser(data))
                .catch(() => setUser(null));
        } catch {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        fetch(`/api/books?page=${page}&size=10`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                if (data && Array.isArray(data.content)) {
                    setBooks(data.content);
                    setTotalPages(data.totalPages);
                } else {
                    setBooks([]);
                    setTotalPages(0);
                }
            })
            .catch(() => {
                setBooks([]);
                setTotalPages(0);
            });
    }, [page]);

    return (
        <>

            <Box
                sx={{
                    height: 600,
                    backgroundImage: "url('/img/reading_woman.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: {xs: 1, md: 0}
                }}
            >
                <Box
                    sx={{
                        width: '95%',
                        maxWidth: 1280,
                        display: 'flex',
                        justifyContent: {xs: 'center', md: 'flex-start'}
                    }}
                >
                    <Box
                        sx={{
                            width: 360,
                            height: 240,
                            backgroundColor: 'white',
                            borderRadius: 2,
                            p: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
                        <Typography variant="h5">
                            {t('home.banner.title')}
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                backgroundColor: '#D9BA8C',
                                color: 'white',
                                fontSize: {xs: '0.75rem', sm: '0.875rem'}
                            }}
                            onClick={() => navigate(user ? '/add-book' : '/register')}
                        >
                            {user
                                ? t('home.banner.primaryButton.loggedIn')
                                : t('home.banner.primaryButton.loggedOut')}
                        </Button>
                        <Button
                            onClick={() => navigate('/info')}
                            sx={{alignSelf: 'flex-start', color: '#D9BA8C'}}
                        >
                            {t('home.banner.secondaryButton')}
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Box
                sx={{
                    width: '95%',
                    maxWidth: 1280,
                    m: '18px auto',
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    gap: 2
                }}
            >
                <CourageBox
                    background="/img/hand_book.png"
                    title={t('home.promo.new.title')}
                    subtitle={t('home.promo.new.subtitle')}
                    buttonLabel={
                        user
                            ? t('home.promo.new.button.loggedIn')
                            : t('home.promo.new.button.loggedOut')
                    }
                    onClick={() => navigate(user ? '/add-book' : '/register')}
                    dark
                />
                <CourageBox
                    background="/img/stack_of_books.png"
                    title={t('home.promo.browse.title')}
                    subtitle={t('home.promo.browse.subtitle')}
                    buttonLabel={t('home.promo.browse.button')}
                    onClick={() => navigate('/books')}
                    light
                />
            </Box>

            <Box sx={{width: '95%', maxWidth: 1280, m: '32px auto'}}>
                <Typography variant="h5" gutterBottom>
                    {t('home.availableBooks')}
                </Typography>

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
                        <Box
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

                            <Box sx={{p: 1}}>
                                <Typography variant="subtitle2" noWrap>
                                    {book.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {book.bookCondition}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    {(book.price).toFixed(2)} {t('home.currency')}
                                </Typography>
                                <Typography variant="caption">
                                    {(book.price + 10).toFixed(2)} {t('home.shippingSuffix')}
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
        </>
    );
};

const CourageBox = ({
                        background,
                        title,
                        subtitle,
                        buttonLabel,
                        onClick,
                        dark,
                        light
                    }) => (
    <Box
        sx={{
            flex: 1,
            height: {xs: 600, md: 300},
            backgroundImage: `url(${background})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: light ? '#EFEFEF' : '#D9BA8C',
            borderRadius: 2,
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: light ? 'black' : 'white'
        }}
    >
        <Box>
            <Typography variant="h6" sx={{maxWidth: '50%'}}>
                {title}
            </Typography>
            <Typography variant="subtitle1" sx={{maxWidth: '50%'}}>
                {subtitle}
            </Typography>
        </Box>
        <Button
            variant="contained"
            onClick={onClick}
            sx={{
                backgroundColor: light ? '#D9BA8C' : 'white',
                color: light ? 'white' : 'black',
                width: {xs: '100%', sm: '60%'},
                maxWidth: {xs: '100%', sm: '45%'},
                fontSize: {xs: '0.75rem', sm: '0.875rem'},
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
        >
            {buttonLabel}
        </Button>
    </Box>
);

export default HomePage;
