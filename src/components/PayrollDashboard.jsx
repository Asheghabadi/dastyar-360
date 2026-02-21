import { useMemo } from 'react';
import {
  Grid, Card, CardContent, Typography, Box
} from '@mui/material';

function PayrollDashboard({ transactions, employees }) {

  const payrollStats = useMemo(() => {
    const payrollExpenses = transactions
      .filter(t => t.category === 'حقوق و دستمزد')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const employeeCount = employees.length;

    const averageCostPerEmployee = employeeCount > 0 ? payrollExpenses / employeeCount : 0;

    return {
      payrollExpenses,
      employeeCount,
      averageCostPerEmployee
    };
  }, [transactions, employees]);

  return (
    <Box sx={{ mb: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>داشبورد حقوق و دستمزد</Typography>
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">مجموع هزینه حقوق</Typography>
                        <Typography variant="h4">{payrollStats.payrollExpenses.toLocaleString()} تومان</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">تعداد کارمندان</Typography>
                        <Typography variant="h4">{payrollStats.employeeCount}</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} sm={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" color="text.secondary">میانگین هزینه هر کارمند</Typography>
                        <Typography variant="h4">{Math.round(payrollStats.averageCostPerEmployee).toLocaleString()} تومان</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>
  );
}

export default PayrollDashboard;
