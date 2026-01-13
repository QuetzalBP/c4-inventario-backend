// middleware/auth.js
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/config.js"
import User from "../models/User.js" // Importa el modelo User

export default (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1]
      if (!token) {
        return res.status(401).json({ message: "Token no proporcionado" })
      }

      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET)
      
      // Buscar usuario en la base de datos
      const user = await User.findByPk(decoded.id)
      
      if (!user) {
        return res.status(401).json({ message: "Usuario no encontrado" })
      }

      // Verificar roles si se especifican
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "No tienes permisos" })
      }

      // Agregar usuario a la request
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role
      }
      
      next()
    } catch (error) {
      console.error("Error de autenticación:", error)
      
      if (error.name === "JsonWebTokenError") {
        return res.status(403).json({ message: "Token inválido" })
      }
      
      if (error.name === "TokenExpiredError") {
        return res.status(403).json({ message: "Token expirado" })
      }
      
      return res.status(500).json({ message: "Error de autenticación" })
    }
  }
}