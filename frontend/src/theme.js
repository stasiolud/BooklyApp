import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#D9BA8C',
        },
        secondary: {
            main: '#6b5b4d',
        },
        background: {
            default: 'white',
        },
    },
    typography: {
        fontFamily: 'Montserrat, sans-serif',
    },
});

export default theme;
