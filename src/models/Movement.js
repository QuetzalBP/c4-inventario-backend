// backend/src/models/Movement.js
import { DataTypes } from "sequelize"
import sequelize from "../database/db.js"

const Movement = sequelize.define("Movement", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  productId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  productName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  movementType: {
    type: DataTypes.ENUM('Entrada', 'Salida', 'Transferencia', 'Ajuste'),
    allowNull: false
  },
  fromStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  toStatus: {
    type: DataTypes.STRING,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
})

export default Movement