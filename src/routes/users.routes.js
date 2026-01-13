import express from "express"
import bcrypt from "bcryptjs"
import User from "../models/User.js"
import auth from "../middleware/auth.js"

const router = express.Router()

// Obtener todos los usuarios (solo ADMIN)
router.get("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    })
    res.json(users)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message })
  }
})

// Crear usuario (solo ADMIN)
router.post("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const { username, password, role } = req.body

    // Validar que el usuario no exista
    const existingUser = await User.findOne({ where: { username } })
    if (existingUser) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || "USER"
    })

    // Retornar sin la contraseña
    const { password: _, ...userWithoutPassword } = user.toJSON()
    res.status(201).json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ message: "Error al crear usuario", error: error.message })
  }
})

// Actualizar usuario (solo ADMIN)
router.put("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params
    const { username, password, role } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // Preparar datos de actualización
    const updateData = { username, role }
    
    // Si hay nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    await user.update(updateData)

    const { password: _, ...userWithoutPassword } = user.toJSON()
    res.json(userWithoutPassword)
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar usuario", error: error.message })
  }
})

// Eliminar usuario (solo ADMIN)
router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" })
    }

    // No permitir eliminar el último admin
    if (user.role === "ADMIN") {
      const adminCount = await User.count({ where: { role: "ADMIN" } })
      if (adminCount <= 1) {
        return res.status(400).json({ message: "No puedes eliminar el último administrador" })
      }
    }

    await user.destroy()
    res.json({ message: "Usuario eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar usuario", error: error.message })
  }
})

export default router