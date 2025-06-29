const express = require("express")
const {
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
  getAllUsers,
  getAllUserSignUpInWeek,
  changeUserPasswordByEmail
} = require("../controllers/userController")
// const { protect, admin } = require("../middleware/authMiddleware")

const router = express.Router()

// Public routes
router.post("/", registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshToken)
router.get("/signup-in-week", getAllUserSignUpInWeek)
router.get("/all-users", getAllUsers)
router.post("/change-password-by-email", changeUserPasswordByEmail)

// Protected routes
// router.get("/profile", protect, getUserProfile)
// router.put("/profile", protect, updateUserProfile)
// router.put("/change-password", protect, changeUserPassword)
// router.delete("/users/deleteaccount", protect, deleteUser);
// router.post("/logout", protect, logoutUser)

// // Admin routes
// router.get("/", protect, admin, getUsers)
// router.delete("/:id", protect, admin, deleteUser)
// router.get("/:id", protect, admin, getUserById)
// router.put("/:id", protect, admin, updateUser)

module.exports = router

console.log("User routes updated with change-password endpoint!")