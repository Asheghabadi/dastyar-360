import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material';
import Navbar from './Navbar';
import GlobalSearch from './GlobalSearch';

function Layout({ children }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            دستیار ۳۶۰
          </Typography>
          <Navbar />
          <Box sx={{ flexGrow: 1 }} />
          <GlobalSearch />
        </Toolbar>
      </AppBar>
      <Container component="main" sx={{ mt: 4 }}>
        {children}
      </Container>
    </>
  );
}

export default Layout;
