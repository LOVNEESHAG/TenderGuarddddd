const { auth } = require('express-oauth2-jwt-bearer');
const User = require('../models/User');

const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  tokenSigningAlg: 'RS256'
});

// Protect routes
exports.protect = async (req, res, next) => {
    jwtCheck(req, res, async (err) => {
        if (err) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }

        try {
            // Find user by Auth0 ID
            let user = await User.findOne({ auth0Id: req.auth.payload.sub });

            if (!user) {
                return res.status(401).json({ success: false, error: 'User profile not synchronized. Please log in again.' });
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
        }
    });
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
