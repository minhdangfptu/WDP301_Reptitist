const express = require("express")
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  changeUserPassword, // Thêm endpoint mới
  refreshToken,
  logoutUser,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} = require("../controllers/userController")
const { protect, admin } = require("../middleware/auth")

const router = express.Router()

// Public routes
router.post("/", registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshToken)

// Protected routes
router.get("/profile", protect, getUserProfile)
router.put("/profile", protect, updateUserProfile)
router.put("/change-password", protect, changeUserPassword)
router.delete("/users/deleteaccount", protect, deleteUser);
router.post("/logout", protect, logoutUser)

// Admin routes
router.get("/", protect, admin, getUsers)
router.delete("/:id", protect, admin, deleteUser)
router.get("/:id", protect, admin, getUserById)
router.put("/:id", protect, admin, updateUser)

module.exports = router

console.log("User routes updated with change-password endpoint!")