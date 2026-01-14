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

// Crear producto (solo ADMIN) - CON VALIDACIÓN DE DATOS
router.post("/", auth(["ADMIN"]), async (req, res) => {
  try {
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

    // Generar ID único
    const productId = generateProductId()
    
    // Obtener usuario del middleware de autenticación
    const createdBy = req.user?.username || req.user?.email || 'admin'

    // 🔧 LIMPIAR Y VALIDAR DATOS
    const cleanData = {
      productId,
      name,
      description: description || null,
      brand: brand || null,
      model: model || null,
      serialNumber: serialNumber || null,
      status: status || 'Bodega',
      quantity: quantity ? parseInt(quantity) : 0,
      // 👇 CONVERTIR STRINGS VACÍOS A NULL PARA CAMPOS NUMÉRICOS
      price: price && price !== '' && price !== 'NaN' ? parseFloat(price) : null,
      category: category && category !== '' ? category : null,
      notes: notes || null,
      location: location || null,
      // 👇 VALIDAR FECHAS
      purchaseDate: purchaseDate && purchaseDate !== 'Invalid date' && purchaseDate !== '' 
        ? new Date(purchaseDate) 
        : null,
      warrantyExpiry: warrantyExpiry && warrantyExpiry !== 'Invalid date' && warrantyExpiry !== '' 
        ? new Date(warrantyExpiry) 
        : null,
      createdBy
    }

    const product = await Product.create(cleanData)

    res.status(201).json(product)
  } catch (error) {
    console.error("Error al crear producto:", error)
    res.status(500).json({ 
      message: "Error al crear producto", 
      error: error.message 
    })
  }
})

// Actualizar producto (solo ADMIN) - CON VALIDACIÓN
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

    // Obtener usuario que está actualizando
    const updatedBy = req.user?.username || req.user?.email || 'admin'

    // 🔧 LIMPIAR Y VALIDAR DATOS
    const cleanData = {
      name,
      description: description || null,
      brand: brand || null,
      model: model || null,
      serialNumber: serialNumber || null,
      status: status || 'Bodega',
      quantity: quantity ? parseInt(quantity) : 0,
      price: price && price !== '' && price !== 'NaN' ? parseFloat(price) : null,
      category: category && category !== '' ? category : null,
      notes: notes || null,
      location: location || null,
      purchaseDate: purchaseDate && purchaseDate !== 'Invalid date' && purchaseDate !== '' 
        ? new Date(purchaseDate) 
        : null,
      warrantyExpiry: warrantyExpiry && warrantyExpiry !== 'Invalid date' && warrantyExpiry !== '' 
        ? new Date(warrantyExpiry) 
        : null,
      updatedBy
    }

    await product.update(cleanData)

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