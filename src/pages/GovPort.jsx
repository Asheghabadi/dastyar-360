import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl, InputLabel, Chip, Menu
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';

const getInitialStatuses = (deadlines) => {
  const savedStatuses = localStorage.getItem('deadlineStatuses');
  const statuses = savedStatuses ? JSON.parse(savedStatuses) : {};
  // Ensure all deadlines have a default status
  deadlines.forEach(d => {
    if (!statuses[d.id]) {
      statuses[d.id] = 'انجام نشده';
    }
  });
  return statuses;
};

function GovPort() {
  const [deadlines, setDeadlines] = useState([]);
  const [statuses, setStatuses] = useState({});
  const [filter, setFilter] = useState('همه');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDeadlineId, setSelectedDeadlineId] = useState(null);

  useEffect(() => {
    fetch('/gov-deadlines.json')
      .then(response => response.json())
      .then(data => {
        const processedData = data.map(d => ({
          ...d,
          daysRemaining: Math.ceil((new Date(d.date) - new Date()) / (1000 * 60 * 60 * 24))
        }));
        setDeadlines(processedData);
        setStatuses(getInitialStatuses(processedData));
      });
  }, []);

  useEffect(() => {
    if (Object.keys(statuses).length > 0) {
        localStorage.setItem('deadlineStatuses', JSON.stringify(statuses));
    }
  }, [statuses]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget);
    setSelectedDeadlineId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDeadlineId(null);
  };

  const handleStatusChange = (newStatus) => {
    setStatuses(prev => ({ ...prev, [selectedDeadlineId]: newStatus }));
    handleMenuClose();
  };

  const filteredDeadlines = useMemo(() => {
    if (filter === 'همه') return deadlines;
    return deadlines.filter(d => d.category === filter);
  }, [deadlines, filter]);

  const getStatusChipColor = (status) => {
    switch (status) {
      case 'انجام شده':
        return 'success';
      case 'در حال بررسی':
        return 'warning';
      case 'انجام نشده':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>درگاه دولت - مدیریت تعهدات</Typography>
      
      <FormControl sx={{ mb: 2, minWidth: 200 }}>
        <InputLabel>فیلتر بر اساس دسته</InputLabel>
        <Select value={filter} label="فیلتر بر اساس دسته" onChange={handleFilterChange}>
          <MenuItem value="همه">همه</MenuItem>
          <MenuItem value="مالیات">مالیات</MenuItem>
          <MenuItem value="بیمه">بیمه</MenuItem>
          <MenuItem value="مجوزها">مجوزها</MenuItem>
        </Select>
      </FormControl>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>عنوان تعهد</TableCell>
              <TableCell>دسته</TableCell>
              <TableCell>تاریخ سررسید</TableCell>
              <TableCell>روزهای باقی‌مانده</TableCell>
              <TableCell>وضعیت</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDeadlines.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.title}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{new Date(row.date).toLocaleDateString('fa-IR')}</TableCell>
                <TableCell>{row.daysRemaining > 0 ? `${row.daysRemaining}` : 'پایان یافته'}</TableCell>
                <TableCell>
                  <Chip label={statuses[row.id]} color={getStatusChipColor(statuses[row.id])} size="small" />
                </TableCell>
                <TableCell align="center">
                  <IconButton aria-label="actions" size="small" onClick={(e) => handleMenuClick(e, row.id)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleStatusChange('انجام نشده')}>انجام نشده</MenuItem>
        <MenuItem onClick={() => handleStatusChange('در حال بررسی')}>در حال بررسی</MenuItem>
        <MenuItem onClick={() => handleStatusChange('انجام شده')}>انجام شده</MenuItem>
      </Menu>
    </Box>
  );
}

export default GovPort;
