const express = require('express');
const { sync, getMe } = require('../controllers/auth');
const { protect } = require('../middleware/auth');
const { auth } = require('express-oauth2-jwt-bearer');

const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

const router = express.Router();

router.post('/sync', jwtCheck, sync);
router.get('/me', protect, getMe);

module.exports = router;
