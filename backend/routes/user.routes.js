const express = require("express");
const router = express.Router();
const userController = require("../controlers/user.controller");
const { verifyToken,verifyAdmin  } = require("../middlewares/auth.middleware");

// Routes with JWT Protection
router.post("/adduser", verifyToken, verifyAdmin, userController.registerUser);
router.get("/getuser/:id", verifyToken, userController.getUser);
router.put("/updateuser/:id", verifyToken, userController.updateUser);
router.delete("/delete/:id", verifyToken, userController.deleteUser);

module.exports = router;
