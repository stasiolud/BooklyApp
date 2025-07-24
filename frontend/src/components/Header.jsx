import React, {useState, useEffect} from 'react';
import {
    Box,
    Button,
    useTheme,
    Select,
    MenuItem, useMediaQuery
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import SearchField from './SearchField';
import {jwtDecode} from 'jwt-decode';
import {useTranslation} from 'react-i18next';

const Header = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const {i18n, t} = useTranslation();
    const isLoggedIn = Boolean(localStorage.getItem('token'));
    const [searchValue, setSearchValue] = useState('');
    const [myId, setMyId] = useState(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const {sub: email} = jwtDecode(token);
                fetch(`/api/user/by-email?email=${encodeURIComponent(email)}`)
                    .then(res => res.json())
                    .then(data => setMyId(data.id))
                    .catch(() => {
                    });
            } catch {

            }
        }
    }, []);

    const handleSearch = () => {
        const query = searchValue.trim();
        if (query) navigate(`/books?search=${encodeURIComponent(query)}`);
    };

    const changeLanguage = lng => {
        i18n.changeLanguage(lng);
        localStorage.setItem('i18nextLng', lng);
    };

    return (
        <>

            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: theme.zIndex.appBar,
                    bgcolor: theme.palette.background.paper,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.shadows[2],
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1280,
                        mx: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: {xs: 2, md: 3},
                        py: 1,
                    }}
                >

                    <Box
                        component="img"
                        src="/img/Bookly1.png"
                        alt="logo"
                        sx={{height: 40, cursor: 'pointer'}}
                        onClick={() => navigate('/')}
                    />


                    <Box sx={{display: {xs: 'none', md: 'block'}, width: {md: '48%'}}}>
                        <SearchField
                            value={searchValue}
                            onChange={setSearchValue}
                            onSubmit={handleSearch}
                            sx={{width: '100%'}}
                        />
                    </Box>


                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>

                        <Select
                            value={i18n.language}
                            onChange={e => changeLanguage(e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{display: {xs: 'none', md: 'flex'}, height: 36}}
                        >
                            < MenuItem value="pl">PL</MenuItem>
                            <MenuItem value="en">EN</MenuItem>
                        </Select>

                        {isLoggedIn ? (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => myId && navigate(`/user/${myId}`)}
                                    sx={{
                                        borderColor: theme.palette.primary.main,
                                        color: theme.palette.primary.main,
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                            borderColor: theme.palette.primary.main,
                                        },
                                    }}
                                >
                                    {t('header.yourProfile')}
                                </Button>
                                <Button
                                    variant="contained"
                                    disableElevation
                                    onClick={() => navigate('/add-book')}
                                    sx={{
                                        bgcolor: theme.palette.primary.main,
                                        color: theme.palette.common.white,
                                        '&:hover': {bgcolor: theme.palette.primary.main},
                                    }}
                                >
                                    {t('header.listItem')}
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/login')}
                                sx={{
                                    borderColor: theme.palette.primary.main,
                                    color: theme.palette.primary.main,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    '&:hover': {
                                        backgroundColor: 'transparent',
                                        borderColor: theme.palette.primary.main,
                                    },
                                }}
                            >
                                {t('header.auth')}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>


            {isMobile && (
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        pt: 1,
                        bgcolor: theme.palette.background.paper,
                        borderTop: `1px solid ${theme.palette.divider}`
                    }}
                >
                    <Box sx={{flex: 1}}>
                        <SearchField
                            value={searchValue}
                            onChange={setSearchValue}
                            onSubmit={handleSearch}
                            sx={{width: '100%'}}
                        />
                    </Box>
                    <Select
                        value={i18n.language}
                        onChange={e => changeLanguage(e.target.value)}
                        size="small"
                        variant="outlined"
                    >
                        <MenuItem value="pl">PL</MenuItem>
                        <MenuItem value="en">EN</MenuItem>
                    </Select>
                </Box>
            )}
        </>
    )
        ;
};

export default Header;
