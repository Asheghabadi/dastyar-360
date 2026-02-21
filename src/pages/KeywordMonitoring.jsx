import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Typography, Paper, IconButton, Dialog, DialogActions,
  DialogContent, DialogTitle, TextField, Chip, Stack, Card, CardContent, Link, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const getInitialKeywords = () => {
  const savedKeywords = localStorage.getItem('keywords');
  if (savedKeywords) {
    return JSON.parse(savedKeywords);
  }
  return ['هوش مصنوعی', 'رایانش ابری', 'تکنو پیشرو'];
};

function KeywordMonitoring() {
  const [keywords, setKeywords] = useState(getInitialKeywords);
  const [news, setNews] = useState([]);
  const [open, setOpen] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    localStorage.setItem('keywords', JSON.stringify(keywords));
  }, [keywords]);

  useEffect(() => {
    fetch('/market-news.json')
      .then(response => response.json())
      .then(data => setNews(data))
      .catch(error => console.error('Error fetching market news:', error));
  }, []);

  const monitoredNews = useMemo(() => {
    if (keywords.length === 0) return [];
    const lowercasedKeywords = keywords.map(k => k.toLowerCase());
    return news.filter(item => {
      const content = (item.title + ' ' + item.content).toLowerCase();
      return lowercasedKeywords.some(keyword => content.includes(keyword));
    });
  }, [keywords, news]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewKeyword('');
  };

  const handleAddKeyword = () => {
    if (newKeyword && !keywords.includes(newKeyword)) {
      setKeywords([...keywords, newKeyword]);
      enqueueSnackbar('کلمه کلیدی جدید افزوده شد', { variant: 'success' });
      handleClose();
    } else {
      enqueueSnackbar('کلمه کلیدی تکراری یا خالی است', { variant: 'warning' });
    }
  };

  const handleDeleteKeyword = (keywordToDelete) => () => {
    setKeywords((keywords) => keywords.filter((keyword) => keyword !== keywordToDelete));
    enqueueSnackbar('کلمه کلیدی حذف شد', { variant: 'info' });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>پایش کلمات کلیدی در بازار</Typography>
      
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>کلمات کلیدی شما</Typography>
        <Stack direction="row" spacing={1}>
          {keywords.map((keyword) => (
            <Chip key={keyword} label={keyword} onDelete={handleDeleteKeyword(keyword)} />
          ))}
          <IconButton size="small" onClick={handleOpen}><AddIcon /></IconButton>
        </Stack>
      </Paper>

      <Typography variant="h5" sx={{ mb: 2 }}>اخبار و مقالات مرتبط</Typography>
      <Grid container spacing={3}>
        {monitoredNews.length > 0 ? monitoredNews.map(item => (
          <Grid item xs={12} key={item.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {item.source} - {new Date(item.date).toLocaleDateString('fa-IR')}
                </Typography>
                <Typography variant="body1">{item.content}</Typography>
              </CardContent>
            </Card>
          </Grid>
        )) : (
          <Grid item xs={12}>
            <Typography>هیچ خبر مرتبطی با کلمات کلیدی شما یافت نشد.</Typography>
          </Grid>
        )}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>افزودن کلمه کلیدی جدید</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="keyword"
            label="کلمه کلیدی"
            type="text"
            fullWidth
            variant="standard"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>انصراف</Button>
          <Button onClick={handleAddKeyword}>افزودن</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default KeywordMonitoring;
