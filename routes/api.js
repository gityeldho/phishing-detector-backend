const express = require("express");
const router = express.Router();
const modelController = require("../controllers/modelController");

router.post("/check-url", modelController.detectPhishing);

module.exports = router;
