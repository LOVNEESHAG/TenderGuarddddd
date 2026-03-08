const User = require('../models/User');

// @desc    Synchronize Auth0 user with local database
// @route   POST /api/auth/sync
// @access  Private (Needs valid Auth0 Token)
exports.sync = async (req, res) => {
    try {
        console.log('SYNC REQUEST RECEIVED');
        console.log('Auth payload:', req.auth.payload);
        const auth0Id = req.auth.payload.sub;
        
        // Extract email and name from request body
        const { email, name } = req.body;
        console.log('Body:', req.body);
        
        if (!auth0Id) {
            console.log('No auth0id');
            return res.status(400).json({ success: false, error: 'No Auth0 ID found in token payload' });
        }

        console.log('Finding user by Auth0 ID...');
        let user = await User.findOne({ auth0Id });
        console.log('User found by Auth0 ID:', !!user);

        if (!user) {
            // Also check by email to map existing users
            console.log('Checking by email...');
            if (email) {
                user = await User.findOne({ email });
                console.log('User found by email:', !!user);
            }
            
            if (user) {
                console.log('Updating existing user with Auth0 ID');
                user.auth0Id = auth0Id;
                await user.save();
                console.log('User updated');
            } else {
                console.log('Creating new user in Mongo...');
                // Create new user
                user = await User.create({
                    auth0Id,
                    email: email || `${auth0Id}@placeholder.com`,
                    name: name || 'Citizen'
                });
                console.log('New user created successfully');
            }
        }

        console.log('Sync complete, returning user');
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('------- SYNC ERROR TRIGGERED -------');
        console.error('Stack Trace:', err.stack);
        console.error('Error Object:', err);
        res.status(500).json({ success: false, error: 'Server Error during user sync' });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        data: req.user
    });
};
