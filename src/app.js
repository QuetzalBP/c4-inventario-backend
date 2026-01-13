import express from "express"
import cors from "cors"
import bcrypt from "bcryptjs"

import sequelize from "./database/db.js"
import User from "./models/User.js"
import Product from "./models/Product.js"

import authRoutes from "./routes/auth.routes.js"
import productsRoutes from "./routes/products.routes.js"
import usersRoutes from "./routes/users.routes.js"

const app = express()

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://TU-FRONTEND.netlify.app"
  ],
  credentials: true
}))
app.use(express.json())

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/products", productsRoutes)
app.use("/api/users", usersRoutes)

app.get("/", (req, res) => {
  res.json({ message: "API C4 Inventario funcionando" })
})

const PORT = process.env.PORT || 3000

async function startServer() {
  try {
    // ⚠️ NUNCA force:true en producción
    await sequelize.sync()

    // Crear admin si no existe
    const admin = await User.findOne({ where: { username: "admin" } })

    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin123", 10)
      await User.create({
        username: "admin",
        password: hashedPassword,
        role: "ADMIN"
      })
      console.log("✅ Admin creado")
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Error al iniciar servidor:", error)
  }
}

startServer()
