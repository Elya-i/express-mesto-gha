const { HTTP_STATUS_CREATED } = require('http2').constants;

const mongoose = require('mongoose');

const Card = require('../models/card');

const { ValidationError, CastError } = mongoose.Error;

const NotFoundError = require('../utils/errors/NotFoundError'); // 404
const BadRequestError = require('../utils/errors/BadRequestError'); // 400
const ForbiddenError = require('../utils/errors/ForbiddenError'); // 403

module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate()
    .then((cards) => res.send({ data: cards }))
    .catch((err) => next(err));
};

module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;
  const ownerId = req.user._id;

  Card.create({ name, link, owner: ownerId })
    .then((card) => res.status(HTTP_STATUS_CREATED).send({ data: card }))
    .catch((err) => {
      if (err instanceof ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteCard = (req, res, next) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (!card) {
        next(new NotFoundError(`Карточка с указанным _id: ${req.params.cardId} не найдена `));
      }
      if (card.owner.toString() !== req.user._id) {
        next(new ForbiddenError('Отсутствуют права доступа на удаление карточки'));
      }
      return res.send({ message: `Карточка с _id: ${card._id} успешно удалена c сервера` });
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};

module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) return res.send({ data: card });
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
      } else {
        next(err);
      }
    });
};

module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (card) return res.send({ data: card });
      return next(new NotFoundError('Карточка с указанным _id не найдена'));
    })
    .catch((err) => {
      if (err instanceof CastError) {
        next(new BadRequestError('Переданы некорректные данные для снятия лайка'));
      } else {
        next(err);
      }
    });
};
