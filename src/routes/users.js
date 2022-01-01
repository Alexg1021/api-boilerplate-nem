import express, { Router } from "express";
var router = Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({ title: "Express" });
});

// module.exports = router;

export default router;
