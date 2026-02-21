import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useSearch } from '../context/SearchContext';

function GlobalSearch() {
  const { searchTerm, setSearchTerm } = useSearch();

  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="جستجو..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      sx={{
        minWidth: '300px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        '& .MuiInputBase-root': {
          color: 'white',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'rgba(255, 255, 255, 0.25)',
        },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: 'white' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

export default GlobalSearch;
