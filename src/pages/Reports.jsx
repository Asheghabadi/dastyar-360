import { useState, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Button, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

function Reports() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: 'همه',
    category: 'همه'
  });
  const [reportData, setReportData] = useState(null);

  const transactions = useMemo(() => JSON.parse(localStorage.getItem('transactions') || '[]'), []);
  const categories = useMemo(() => ['همه', ...new Set(transactions.map(t => t.category))], [transactions]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = () => {
    let filtered = transactions;

    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    if (filters.type !== 'همه') {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    if (filters.category !== 'همه') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    const totalIncome = filtered.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = filtered.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0);

    const categoryData = filtered
      .filter(t => t.amount < 0) // Only expenses for pie chart
      .reduce((acc, t) => {
        const category = t.category || 'بدون دسته';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    const pieData = Object.keys(categoryData).map(key => ({ name: key, value: categoryData[key] }));

    setReportData({
      totalIncome,
      totalExpense,
      netProfit: totalIncome + totalExpense,
      pieData
    });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>گزارش‌گیری پیشرفته</Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>فیلترهای گزارش</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="startDate"
              label="تاریخ شروع"
              type="date"
              fullWidth
              value={filters.startDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              name="endDate"
              label="تاریخ پایان"
              type="date"
              fullWidth
              value={filters.endDate}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>نوع تراکنش</InputLabel>
              <Select name="type" value={filters.type} label="نوع تراکنش" onChange={handleFilterChange}>
                <MenuItem value="همه">همه</MenuItem>
                <MenuItem value="درآمد">درآمد</MenuItem>
                <MenuItem value="هزینه">هزینه</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>دسته‌بندی</InputLabel>
              <Select name="category" value={filters.category} label="دسته‌بندی" onChange={handleFilterChange}>
                {categories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sx={{ textAlign: 'left' }}>
            <Button variant="contained" onClick={generateReport}>ایجاد گزارش</Button>
          </Grid>
        </Grid>
      </Paper>

      {reportData && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>نتایج گزارش</Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6">خلاصه مالی</Typography>
              <Typography>درآمد کل: {reportData.totalIncome.toLocaleString()} تومان</Typography>
              <Typography>هزینه کل: {Math.abs(reportData.totalExpense).toLocaleString()} تومان</Typography>
              <Typography variant="h6" sx={{ mt: 1, color: reportData.netProfit >= 0 ? 'success.main' : 'error.main' }}>
                سود/زیان خالص: {reportData.netProfit.toLocaleString()} تومان
              </Typography>
            </Grid>
            <Grid item xs={12} md={8} sx={{ height: 300 }}>
              <Typography variant="h6">نمودار شکست هزینه‌ها</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} تومان`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default Reports;
