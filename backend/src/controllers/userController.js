const User = require("../models/users");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// Generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  })
}

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })

    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    })

    if (user) {
      // Generate tokens
      const token = generateToken(user._id)
      const refreshToken = generateRefreshToken(user._id)

      // Save refresh token to user
      user.refresh_token = refreshToken
      await user.save()

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        refreshToken,
      })
    } else {
      res.status(400).json({ message: "Invalid user data" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // Generate tokens
      const token = generateToken(user._id)
      const refreshToken = generateRefreshToken(user._id)

      // Save refresh token to user
      user.refresh_token = refreshToken
      await user.save()

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token,
        refreshToken,
      })
    } else {
      res.status(401).json({ message: "Invalid email or password" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -refresh_token")

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user profile (không bao gồm password)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.address = req.body.address || user.address
      user.phone_no = req.body.phone_no || user.phone_no
      user.date_of_birth = req.body.date_of_birth || user.date_of_birth
      user.driving_license = req.body.driving_license || user.driving_license
      user.national_id_no = req.body.national_id_no || user.national_id_no

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        phone_no: updatedUser.phone_no,
        date_of_birth: updatedUser.date_of_birth,
        driving_license: updatedUser.driving_license,
        national_id_no: updatedUser.national_id_no,
        token: generateToken(updatedUser._id),
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
const changeUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Refresh token
// @route   POST /api/users/refresh-token
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" })
    }

    const user = await User.findOne({ refresh_token: refreshToken })

    if (!user) {
      return res.status(403).json({ message: "Invalid refresh token" })
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
      if (err || user._id.toString() !== decoded.id) {
        return res.status(403).json({ message: "Invalid refresh token" })
      }

      const newAccessToken = generateToken(user._id)
      res.json({ token: newAccessToken })
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Logout user / clear refresh token
// @route   POST /api/users/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (user) {
      user.refresh_token = null
      await user.save()
      res.json({ message: "Logged out successfully" })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -refresh_token")
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Delete user account
// @route   DELETE /users/deleteaccount
// @access  Private
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Không cần kiểm tra quyền admin, chỉ cần xóa tài khoản của người dùng hiện tại
    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refresh_token")

    if (user) {
      res.json(user)
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// @desc    Update user (admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.role_id = req.body.role_id || user.role_id

      const updatedUser = await user.save()

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role_id: updatedUser.role_id,
      })
    } else {
      res.status(404).json({ message: "User not found" })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
const getAllUserSignUpInWeek = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const users = await User.find({
      created_at: { $gte: sevenDaysAgo }
    }).select('_id username');

    res.status(200).json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get all user sign up in week error:', error);
    res.status(500).json({
      message: 'Không thể lấy danh sách người dùng đăng kí trong tuần',
      error: error.message
    });
  }
}
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('_id username')
      .sort({ created_at: -1 });

    res.status(200).json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Không thể lấy danh sách người dùng',
      error: error.message
    });
  }
};

const changeUserPasswordByEmail = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password_hashed = hashedPassword;
    await user.save();

    // Revoke all refresh tokens
    user.refresh_tokens = [];
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  refreshToken,
  logoutUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getAllUserSignUpInWeek,
  getAllUsers,
  changeUserPasswordByEmail,
}
