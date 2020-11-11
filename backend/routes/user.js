const express = require('express');

const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
  User.findOne({ email: req.body.email })
    .populate('expertise')
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: 'Email não cadastrado.',
        });
      }
      return res.status(200).json(user.toJSON());
    });
});

router.post('/update', async (req, res, next) => {
  await User.findOneAndUpdate(
    { email: req.body.user.email },
    req.body.user,
    function (err) {
      if (err)
        return res.status(500).json({
          message: 'Erro ao atualizar usuário!',
          error: err,
        });
      return res.status(200).json({
        message: 'Usuário Atualizado!',
      });
    }
  );
});

router.post('/all', async (req, res) => {
  users = await User.find({}).populate('expertise');
  return res.status(200).json(users);
});

module.exports = router;
