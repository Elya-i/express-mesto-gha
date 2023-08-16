const { HTTP_STATUS_NOT_FOUND } = require('http2').constants;
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');

const app = express();

const {
  PORT = 3000,
  DB_URL = 'mongodb://localhost:27017/mestodb',
} = process.env;

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
}).then(() => {
  console.log('Connected to DB');
});

app.use(express.json());

app.use((req, res, next) => {
  req.user = {
    _id: '64d61b6e3eb6c689f5919188',
  };

  next();
});

app.use(helmet());

app.use('/cards', cardRouter);
app.use('/users', userRouter);

app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

app.use('*', (req, res) => {
  res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Запрашиваемая страница не найдена' });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
