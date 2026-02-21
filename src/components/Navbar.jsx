import { Link } from 'react-router-dom';
import { Button } from '@mui/material';
import NotificationCenter from './NotificationCenter';

function Navbar() {
  return (
    <nav>
      <Button color="inherit" component={Link} to="/">خانه</Button>
      <Button color="inherit" component={Link} to="/accounting">حسابداری</Button>
      <Button color="inherit" component={Link} to="/gov-port">درگاه دولت</Button>
      <Button color="inherit" component={Link} to="/competitors">تحلیل رقبا</Button>
      <Button color="inherit" component={Link} to="/keyword-monitoring">پایش بازار</Button>
      <Button color="inherit" component={Link} to="/customers">مشتریان</Button>
      <Button color="inherit" component={Link} to="/employees">کارمندان</Button>
      <Button color="inherit" component={Link} to="/reports">گزارش‌ها</Button>
      <Button color="inherit" component={Link} to="/services">خدمات</Button>
      <NotificationCenter />
    </nav>
  );
}

export default Navbar;
