import { Sequelize } from "sequelize"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let sequelize

if (process.env.DATABASE_URL) {
  // 🚀 PRODUCCIÓN: PostgreSQL en Render
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    },
    logging: false
  })
  console.log("🐘 Usando PostgreSQL")
} else {
  // 💻 DESARROLLO: SQLite local
  const dbPath = path.join(__dirname, "../../database.sqlite")
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: dbPath,
    logging: false
  })
  console.log("📁 Usando SQLite")
}

export default sequelize
