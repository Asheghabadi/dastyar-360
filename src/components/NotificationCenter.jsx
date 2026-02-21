import { useState } from 'react';
import {
  IconButton, Badge, Menu, MenuItem, Typography, Box, Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../hooks/useNotifications.jsx';

function NotificationCenter() {
  const { notifications, markAsRead, unreadCount } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  return (
    <Box>
      <IconButton color="inherit" onClick={handleOpenMenu}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        sx={{ maxHeight: 400, '& .MuiList-root': { width: 350 } }}
      >
        <Typography variant="h6" sx={{ p: 2 }}>
          مرکز اطلاع‌رسانی
        </Typography>
        {notifications.length === 0 ? (
          <MenuItem disabled>هیچ اطلاع‌رسانی جدیدی وجود ندارد.</MenuItem>
        ) : (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id)}
              sx={{ whiteSpace: 'normal', borderBottom: '1px solid #eee' }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <Typography variant="body2">{notification.message}</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notification.date).toLocaleString('fa-IR')}
                  </Typography>
                  {!notification.read && (
                    <Chip label="جدید" color="primary" size="small" />
                  )}
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
}

export default NotificationCenter;
