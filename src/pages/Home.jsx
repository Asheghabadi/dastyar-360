import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNotifications } from '../hooks/useNotifications.jsx';

const StatCard = ({ title, value, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" sx={{ color }}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

function Home() {
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    customerCount: 0,
    employeeCount: 0,
    competitorCount: 0,
    monitoredNewsCount: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Fetch all data from localStorage and public files
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const employees = JSON.parse(localStorage.getItem('employees') || '[]');
    const competitors = JSON.parse(localStorage.getItem('competitors') || '[]');
    const keywords = JSON.parse(localStorage.getItem('keywords') || '[]');

    // Calculate financial stats
    const { totalIncome, totalExpense } = transactions.reduce((acc, t) => {
        if (t.amount > 0) {
            acc.totalIncome += t.amount;
        } else {
            acc.totalExpense += t.amount;
        }
        return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    // Prepare chart data
    const monthlyData = transactions.reduce((acc, { date, amount }) => {
      const month = new Date(date).toLocaleString('fa-IR', { month: 'short' });
      if (!acc[month]) {
        acc[month] = { name: month, درآمد: 0, هزینه: 0 };
      }
      if (amount > 0) {
        acc[month]['درآمد'] += amount;
      } else {
        acc[month]['هزینه'] += Math.abs(amount);
      }
      return acc;
    }, {});
    setChartData(Object.values(monthlyData));

    // Fetch news and filter
    fetch('/market-news.json')
      .then(response => response.json())
      .then(newsData => {
        if (keywords.length > 0) {
            const lowercasedKeywords = keywords.map(k => k.toLowerCase());
            const monitoredNews = newsData.filter(item => {
              const content = (item.title + ' ' + item.content).toLowerCase();
              return lowercasedKeywords.some(keyword => content.includes(keyword));
            });
            setStats(prevStats => ({ ...prevStats, monitoredNewsCount: monitoredNews.length }));
        }
      }).catch(error => console.error('Error fetching market news:', error));

    // Fetch deadlines
    fetch('/gov-deadlines.json')
      .then(response => response.json())
      .then(data => {
        const upcoming = data.map(d => ({
          ...d,
          daysRemaining: Math.ceil((new Date(d.date) - new Date()) / (1000 * 60 * 60 * 24))
        })).filter(d => d.daysRemaining >= 0).sort((a, b) => a.daysRemaining - b.daysRemaining);
        setDeadlines(upcoming);

        upcoming.forEach(d => {
            if (d.daysRemaining <= 7) {
                addNotification(
                    `سررسید "${d.title}" نزدیک است! (${d.daysRemaining} روز باقی مانده)`,
                    { variant: 'warning', persistent: true, id: `deadline-${d.id}` }
                );
            }
        });

      }).catch(error => console.error('Error fetching gov deadlines:', error));

    setStats(prevStats => ({
      ...prevStats,
      totalIncome,
      totalExpense,
      netProfit: totalIncome + totalExpense,
      customerCount: customers.length,
      employeeCount: employees.length,
      competitorCount: competitors.length,
    }));

  }, [addNotification]);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>داشبورد جامع دستیار ۳۶۰</Typography>
      <Grid container spacing={3}>
        {/* Stat Cards */}
        <Grid item xs={12} sm={6} md={3}><StatCard title="درآمد کل" value={`${stats.totalIncome.toLocaleString()} تومان`} color="#4caf50" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="هزینه کل" value={`${Math.abs(stats.totalExpense).toLocaleString()} تومان`} color="#f44336" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="سود خالص" value={`${stats.netProfit.toLocaleString()} تومان`} color={stats.netProfit >= 0 ? '#4caf50' : '#f44336'} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="مشتریان" value={stats.customerCount} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="کارمندان" value={stats.employeeCount} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="رقبا" value={stats.competitorCount} /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="اخبار مرتبط" value={stats.monitoredNewsCount} /></Grid>

        {/* Financial Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>روند درآمد و هزینه</Typography>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => new Intl.NumberFormat('fa-IR').format(value)} />
                <Tooltip formatter={(value, name) => [`${value.toLocaleString()} تومان`, name]} />
                <Legend />
                <Line type="monotone" dataKey="درآمد" stroke="#4caf50" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="هزینه" stroke="#f44336" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Compliance Calendar */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 2, height: '400px', overflowY: 'auto' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>تقویم انطباق (مهلت‌های نزدیک)</Typography>
            {deadlines.length > 0 ? deadlines.map(d => (
              <Box key={d.id} sx={{ mb: 2, p: 1.5, border: '1px solid #eee', borderRadius: 2, bgcolor: '#fafafa' }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{d.title}</Typography>
                <Typography variant="body2" color="text.secondary">مهلت: {new Date(d.date).toLocaleDateString('fa-IR')}</Typography>
                <Typography variant="body2" color={d.daysRemaining < 7 ? 'error.main' : 'warning.main'}>
                  {d.daysRemaining > 0 ? `${d.daysRemaining} روز باقی مانده` : 'امروز آخرین مهلت است'}
                </Typography>
              </Box>
            )) : <Typography>مهلت نزدیک وجود ندارد.</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Home;
