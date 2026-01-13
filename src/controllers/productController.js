// backend/src/controllers/productController.js

// En la función createProduct:
export const createProduct = async (req, res) => {
  try {
    // Asegúrate de que el middleware auth esté agregando req.user
    const userId = req.user?.id || "admin" // Fallback si no hay usuario
    const username = req.user?.username || "admin"
    
    const product = await Product.create({
      ...req.body,
      // AGREGAR ESTO:
      createdBy: username, // ← Usuario que crea
      updatedBy: username, // ← También para la primera vez
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    // Opcional: Crear un registro en Movements
    await Movement.create({
      productId: product.productId,
      productName: product.name,
      movementType: 'Entrada',
      fromStatus: null,
      toStatus: product.status,
      quantity: product.quantity || 1,
      notes: `Producto creado: ${product.name}`,
      location: product.location,
      performedBy: username // ← Usuario que realiza la acción
    })
    
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// En la función updateProduct:
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user?.id || "admin"
    const username = req.user?.username || "admin"
    
    // Obtener el producto antes de actualizar
    const oldProduct = await Product.findByPk(id)
    
    const [updated] = await Product.update(
      {
        ...req.body,
        // AGREGAR ESTO:
        updatedBy: username, // ← Usuario que edita
        updatedAt: new Date()
      },
      { where: { id } }
    )
    
    if (!updated) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    
    // Obtener el producto actualizado
    const updatedProduct = await Product.findByPk(id)
    
    // Registrar el movimiento/auditoría
    if (oldProduct && oldProduct.status !== updatedProduct.status) {
      await Movement.create({
        productId: updatedProduct.productId,
        productName: updatedProduct.name,
        movementType: 'Ajuste',
        fromStatus: oldProduct.status,
        toStatus: updatedProduct.status,
        quantity: updatedProduct.quantity || 1,
        notes: req.body.notes || `Estado cambiado por ${username}`,
        location: updatedProduct.location,
        performedBy: username // ← Usuario que realiza el cambio
      })
    }
    
    res.json(updatedProduct)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

// En la función deleteProduct:
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params
    const username = req.user?.username || "admin"
    
    // Obtener el producto antes de eliminarlo
    const product = await Product.findByPk(id)
    
    if (!product) {
      return res.status(404).json({ message: "Producto no encontrado" })
    }
    
    // Crear registro de eliminación antes de borrar
    await Movement.create({
      productId: product.productId,
      productName: product.name,
      movementType: 'Salida',
      fromStatus: product.status,
      toStatus: 'Eliminado',
      quantity: product.quantity || 1,
      notes: `Producto eliminado por ${username}`,
      location: product.location,
      performedBy: username // ← Usuario que elimina
    })
    
    // Opcional: Si quieres mantener el registro en Movements pero no en Products
    await Product.destroy({ where: { id } })
    
    res.json({ message: "Producto eliminado exitosamente" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}