const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (user) => {
  return jwt.sign(
    { userId: user.userId, email: user.email },
    'portfolio_management_secret_key_2025',
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, riskTolerance, investmentGoals } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      userId: 'USER' + Date.now(),
      name,
      email,
      password: hashedPassword,
      phone,
      riskTolerance,
      investmentGoals,
    });

    // Generate token
    const token = generateToken(user);

    res.status(201).json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      riskTolerance: user.riskTolerance,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      riskTolerance: user.riskTolerance,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('portfolios');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      _id: user._id,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      riskTolerance: user.riskTolerance,
      investmentGoals: user.investmentGoals,
      portfolios: user.portfolios,
      riskProfile: user.getRiskProfile()
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, phone, riskTolerance, investmentGoals } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.updateProfile({
      name: name || user.name,
      phone: phone || user.phone,
      riskTolerance: riskTolerance || user.riskTolerance,
      investmentGoals: investmentGoals || user.investmentGoals
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        riskTolerance: user.riskTolerance,
        investmentGoals: user.investmentGoals
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};