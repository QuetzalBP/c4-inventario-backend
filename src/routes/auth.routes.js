// backend/src/routes/auth.routes.js
import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/config.js"

const router = Router()

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ where: { username } })
    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ message: "Credenciales inválidas" })
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email || null
      }
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error interno del servidor" })
  }
})

export default router
