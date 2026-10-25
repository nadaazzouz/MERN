const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Generate a JWT valid for 24 hours
const generateToken = (id, role) => {
    return jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        {
            expiresIn: '1d'
        }
    );
};

// POST /api/users/register
const registerUser = async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const userExists = await User.findOne({
            email: normalizedEmail
        });

        if (userExists) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Public registration always creates a standard user.
        // An administrator must be assigned separately.
        const user = await User.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            age,
            role: 'user'
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: err.message
            });
        }

        if (err.code === 11000) {
            return res.status(409).json({
                message: 'Email is already registered'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// POST /api/users/login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// GET /api/users/profile
const getUserProfile = async (req, res) => {
    try {
        return res.status(200).json(req.user);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// GET /api/users (Admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        return res.status(200).json(users);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const updatePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Check that both passwords were provided
        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                message: 'Please provide oldPassword and newPassword'
            });
        }

        // Find the authenticated user
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Verify the old password against the stored hash
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: 'Unauthorized: old password is incorrect'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Save the updated user
        await user.save();

        return res.status(200).json({
            message: 'Password updated successfully'
        });

    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        // Only allow valid roles
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({
                message: 'Role must be either user or admin'
            });
        }

        // Find the user whose role should be changed
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        // Update the role
        user.role = role;
        await user.save();

        return res.status(200).json({
            message: 'User role updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid user ID format'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword,
    updateUserRole
};