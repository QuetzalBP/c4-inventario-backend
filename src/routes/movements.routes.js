const express = require("express")
const db = require("../db")
const auth = require("../middleware/auth")
const router = express.Router()

router.get("/", auth(["ADMIN"]), (_, res) => {
  db.all(
    "SELECT * FROM movements ORDER BY timestamp DESC",
    (_, rows) => res.json(rows)
  )
})

module.exports = router
