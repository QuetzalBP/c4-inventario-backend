module.exports = (date) => {
  if (!date) return null

  const diff = Date.now() - new Date(date)

  const min = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  return {
    minutos: min || null,
    horas: hrs || null,
    dias: days || null,
    semanas: weeks || null,
    meses: months || null,
    años: years || null
  }
}
