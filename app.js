const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const { errors } = require('celebrate');
const cookieParser = require('cookie-parser');

const cardRouter = require('./routes/cards');
const userRouter = require('./routes/users');
const { createUser, loginUser } = require('./controllers/users');

const auth = require('./middlewares/auth');
const errorHandler = require('./middlewares/error-handler');
const limiter = require('./middlewares/express-rate-limit');
const NotFoundError = require('./utils/errors/NotFoundError');
const { validateLoginUser, validateCreateUser } = require('./utils/validation/requestValidation');

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

app.use(cors());
app.use(limiter);
app.use(helmet());

app.use(express.json());

app.use(cookieParser());

app.post('/signup', validateCreateUser, createUser);
app.post('/signin', validateLoginUser, loginUser);

app.use(auth);

app.use('/cards', cardRouter);
app.use('/users', userRouter);

app.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемая страница не найдена'));
});

app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
