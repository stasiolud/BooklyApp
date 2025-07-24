import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';

const SearchField = ({ value, onChange, onSubmit, sx = {} }) => {
    const { t } = useTranslation();

    return (
        <form onSubmit={e => { e.preventDefault(); onSubmit(); }}>
            <TextField
                size="small"
                variant="outlined"
                placeholder={t('searchField.placeholder')}
                value={value}
                onChange={e => onChange(e.target.value)}
                fullWidth
                sx={sx}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />
        </form>
    );
};

export default SearchField;
