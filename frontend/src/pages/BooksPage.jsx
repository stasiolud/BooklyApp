import React, {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    Pagination,
    useTheme
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const BooksPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {t} = useTranslation();
    const [searchParams] = useSearchParams();
    const search = searchParams.get('search');

    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const url = new URLSearchParams();
        url.append('page', page);
        url.append('size', 10);
        if (search) url.append('search', search);

        fetch(`/api/books?${url.toString()}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setBooks(data.content || []);
                setTotalPages(data.totalPages || 0);
            })
            .catch(err => {
                console.error(err);
                setBooks([]);
                setTotalPages(0);
            });
    }, [page, search]);

    useEffect(() => {
        setPage(0);
    }, [search]);

    return (
        <Box sx={{width: '95%', maxWidth: 1280, margin: '32px auto'}}>
            <Typography variant="h5" gutterBottom>
                {search
                    ? t('booksPage.searchResults', {search})
                    : t('booksPage.availableBooks')}
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
                                {t('booksPage.price', {price: (book.price).toFixed(2)})}
                            </Typography>
                            <Typography variant="caption">
                                {t('booksPage.priceWithShipping', {price: (book.price + 10).toFixed(2)})}
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
                        onChange={(e, value) => setPage(value - 1)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
};

export default BooksPage;
