const express = require("express");
const router = express.Router();
const { handelNewUrl, handelURLRedirect, handelURLHistory, showGrahpData, handelUserSignup, handelUserLogin } = require("../contollers/index");
// making separate router

// making route for adding new url
router.post("/", handelNewUrl)

// making api for getting the getting the originla url
router.get("/:shortId", handelURLRedirect)


// making api for getting the history of api
router.post("/history", handelURLHistory);

// making api for getting the history click graph of api
router.post("/showGraphData", showGrahpData);

// making api for user signup
router.post("/signup", handelUserSignup);

// making api for user login
router.post("/login", handelUserLogin);
// exporting them
module.exports = router;