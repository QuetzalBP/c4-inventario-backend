// backend/src/routes/products.routes.js
import express from "express"
import Product from "../models/Product.js"
import auth from "../middleware/auth.js"
const router = express.Router()

// Función para generar ID de producto (si la necesitas)
function generateProductId() {
  return `PROD-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase()
}

// Obtener todos los productos (requiere autenticación)
router.get("/", auth(), async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['createdAt', 'DESC']]
    })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener productos", error: error.message })
  }
})

// Obtener un producto por ID
router.get("/:id", auth(), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error: error.message })
  }
})

// Obtener producto por productId (código único)
router.get("/code/:productId", auth(), async (req, res) => {
  try {
    const product = await Product.findOne({ where: { productId: req.params.productId } })
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ message: "Error al obtener producto", error: error.message })
  }
})

// Crear producto (solo ADMIN) - CON USUARIO
router.post("/", auth(["ADMIN"]), async (req, res) => {
  try {
    const { 
      name, 
      description, 
      brand, 
      model, 
      serialNumber, 
      status = 'Bodega', 
      quantity = 1,
      price, 
      category,
      notes,
      location,
      purchaseDate,
      warrantyExpiry
    } = req.body

    // Generar ID único si no se proporciona
    const productId = generateProductId()
    
    // === AGREGADO: Obtener usuario del middleware de autenticación ===
    // Asumiendo que tu middleware `auth` agrega req.user
    const createdBy = req.user?.username || req.user?.email || 'admin'

    const product = await Product.create({
      productId,
      name,
      description,
      brand,
      model,
      serialNumber,
      status,
      quantity,
      price,
      category,
      notes,
      location,
      purchaseDate,
      warrantyExpiry,
      createdBy // ← Guardar quién creó el producto
    })

    res.status(201).json(product)
  } catch (error) {
    console.error("Error al crear producto:", error)
    res.status(500).json({ 
      message: "Error al crear producto", 
      error: error.message 
    })
  }
})

// Actualizar producto (solo ADMIN) - CON USUARIO
router.put("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    const { 
      name, 
      description, 
      brand, 
      model, 
      serialNumber, 
      status, 
      quantity,
      price, 
      category,
      notes,
      location,
      purchaseDate,
      warrantyExpiry
    } = req.body
    
    // Validación de unicidad (opcional)
    if (name !== product.name || brand !== product.brand || 
        model !== product.model || serialNumber !== product.serialNumber) {
      // Tu lógica de validación aquí...
    }

    // === AGREGADO: Obtener usuario que está actualizando ===
    const updatedBy = req.user?.username || req.user?.email || 'admin'

    await product.update({
      name,
      description,
      brand,
      model,
      serialNumber,
      status,
      quantity,
      price,
      category,
      notes,
      location,
      purchaseDate,
      warrantyExpiry,
      updatedBy // ← Guardar quién actualizó el producto
    })

    res.json(product)
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    res.status(500).json({ 
      message: "Error al actualizar producto", 
      error: error.message 
    })
  }
})

// Eliminar producto (solo ADMIN) - OPCIONAL: Registrar quién eliminó
router.delete("/:id", auth(["ADMIN"]), async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }

    // Opcional: Registrar quién eliminó antes de eliminar
    // Podrías guardar esto en una tabla de auditoría
    const deletedBy = req.user?.username || req.user?.email || 'admin'
    console.log(`Producto ${product.productId} eliminado por: ${deletedBy}`)

    await product.destroy()
    res.json({ message: "Producto eliminado" })
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar producto", error: error.message })
  }
})

export default router