const {
  HTTP_STATUS_CREATED, // 201
  HTTP_STATUS_BAD_REQUEST, // 400
  HTTP_STATUS_NOT_FOUND, // 404
  HTTP_STATUS_INTERNAL_SERVER_ERROR, // 500
} = require('http2').constants;

const mongoose = require('mongoose');

const Card = require('../models/card');

const { ValidationError, CastError } = mongoose.Error;

module.exports.getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .then((cards) => res.send({ data: cards }))
    .catch((err) => res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: `На сервере произошла ошибка ${err.name}: ${err.message}` }));
};

module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) return res.send({ data: card });
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные карточки' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) return res.send({ data: card });
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};

module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) return res.send({ data: card });
      return res.status(HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
    })
    .catch((err) => {
      if (err instanceof CastError) {
        res.status(HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятия лайка' });
      } else {
        res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      }
    });
};
