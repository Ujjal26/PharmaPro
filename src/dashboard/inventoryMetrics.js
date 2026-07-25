export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const msInDay = 1000 * 60 * 60 * 24
  return Math.ceil((expiry - today) / msInDay)
}

export const getStockPercent = (item) => {
  const denominator = item.minStockLevel * 2
  if (!denominator) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round((item.quantity / denominator) * 100)))
}

export const getInventoryStatus = (item) => {
  const days = getDaysUntilExpiry(item.expiryDate)

  if (days < 0) {
    return 'Expired'
  }

  if (days <= 30) {
    return 'Near Expiry'
  }

  if (item.quantity <= item.minStockLevel) {
    return 'Low Stock'
  }

  return 'In Stock'
}

export const getStatusTone = (status) => {
  if (status === 'Expired') {
    return 'critical'
  }

  if (status === 'Near Expiry' || status === 'Low Stock') {
    return 'warning'
  }

  return 'success'
}
