const {
  HTTP_STATUS_CREATED, // 201
  HTTP_STATUS_BAD_REQUEST, // 400
  HTTP_STATUS_NOT_FOUND, // 404
  HTTP_STATUS_INTERNAL_SERVER_ERROR, // 500
} = require('http2').constants;

const mongoose = require('mongoose');

const User = require('../models/user');

const { ValidationError, CastError } = mongoose.Error;

module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((err) => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `На сервере произошла ошибка ${err.name}: ${err.message}` }));
};

module.exports.getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail(new Error('NotValidId'))
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан некорректный _id пользователя' });
      } else if (err.message === 'NotValidId') {
        res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(HTTP_STATUS_CREATED).send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.updateUser = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { name, about }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
