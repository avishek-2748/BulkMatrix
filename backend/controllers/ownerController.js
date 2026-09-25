import User from '../models/User.js';

// @desc    Get current owner profile
// @route   GET /api/owner/profile
// @access  Private
export const getOwnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'Owner not found.' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update owner profile
// @route   PUT /api/owner/profile
// @access  Private
export const updateOwnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.company = req.body.company || user.company;
      user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
      user.address = req.body.address || user.address;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        company: updatedUser.company,
        phoneNumber: updatedUser.phoneNumber,
        address: updatedUser.address,
      });
    } else {
      res.status(404).json({ message: 'Owner not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
