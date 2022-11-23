const User = require('../models/user');
const async = require('async');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

exports.post_signup = [
  body('username', 'must provide username')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body(
    'password',
    'Password must be at least 6 characters long and contain a lowercase, uppercase, and a number'
  )
    .trim()
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    }),
  body('passcode', 'Must provide correct passcode to create an account')
    .trim()
    .equals(process.env.SECRET_PASSCODE),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res
        .json({
          errors,
        })
        .status(400);
      return;
    }
    // Create new User
    const user = new User({
      username: req.body.username,
      password: bcrypt.hashSync(req.body.password, 8),
    });

    user.save((err, user) => {
      if (err) {
        res
          .json({
            message: err,
          })
          .status(500);
        return;
      } else {
        res
          .json({
            message: 'Successfully registered User',
            user,
          })
          .status(200);
      }
    });
  },
];

exports.post_login = [
  body('username', 'must provide username')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password', 'Must provide password').trim().isLength({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res
        .json({
          errors,
        })
        .status(400);
      return;
    }
    // Search for user
    User.findOne({
      username: req.body.username,
    }).exec((err, user) => {
      if (err) {
        res.json({ err }).status(500);
        return;
      }
      if (!user) {
        return res.json({ message: 'User not found!' }).status(404);
      }

      // Compare passwords
      let passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res
          .json({
            message: 'Invalid Password',
            accessToken: null,
          })
          .status(401);
      }

      let token = jwt.sign({ id: user.id }, process.env.API_SECRET, {
        expiresIn: '1h',
      });

      res.json({
        user,
        message: 'Login Successful',
        accessToken: token,
      });
    });
  },
];
