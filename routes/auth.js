const { Router } = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { check, validationResult } = require('express-validator');

const { User } = require('../models');

const router = Router();

// /${API_PATH}/auth/signup
router.post(
  '/signup',
  [
    check('email', 'Incorrect email').isEmail(),
    check('password', 'Incorrect password, minimum amount 6 symbols ').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data',
        });
      }

      const {
        email,
        password,
      } = req.body;

      const candidate = await User.findOne({ email });

      if (candidate) {
        return res.status(400).json({ message: 'User already exist' });
      }

      const hashedPwd = await bcrypt.hash(password, 12);
      const user = new User({ email, password: hashedPwd });

      await user.save();

      return res.status(201).json({ message: 'User successfully created' });
    } catch (e) {
      return res.status(500).json({ message: 'Something went wrong, try later again' });
    }
  },
);

// /${API_PATH}/auth/signin
router.post('/signin',
  [
    check('email', 'Incorrect email').normalizeEmail().isEmail(),
    check('password', 'Incorrect password').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Incorrect data',
        });
      }

      const {
        email,
        password,
      } = req.body;

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ message: 'Incorrect user data' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect user data' });
      }

      const token = jwt.sign(
        {
          userId: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
        },
      );

      return res.json({ token });
    } catch (e) {
      return res.status(500).json({ message: 'Something went wrong, try later again' });
    }
});

module.exports = router;
