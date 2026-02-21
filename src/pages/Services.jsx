import { Grid, Card, CardContent, Typography, CardActionArea } from '@mui/material';

const services = [
  { title: 'مدیریت حسابداری و مالی', description: 'ثبت اسناد، گزارشات مالی، حقوق و دستمزد.' },
  { title: 'امور مالیاتی و بیمه', description: 'ارسال اظهارنامه، پیگیری امور بیمه تامین اجتماعی.' },
  { title: 'خدمات گمرکی و بازرگانی', description: 'ترخیص کالا، ثبت سفارش، امور واردات و صادرات.' },
  { title: 'مشاوره کسب و کار', description: 'ارائه راهکارهای استراتژیک برای رشد کسب و کار شما.' },
];

function Services() {
  return (
    <Grid container spacing={3}>
      {services.map((service, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {service.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {service.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export default Services;
