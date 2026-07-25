/**
 * File: inventoryMetrics.js
 * Description: Utility functions for calculating inventory metrics such as
 * days until expiry, stock percentages, and determining stock status.
 */

/**
 * Calculates the number of days until the given expiry date.
 * 
 * @param {string|Date} expiryDate - The expiry date of the item.
 * @returns {number} The number of days remaining.
 */
export const getDaysUntilExpiry = (expiryDate) => {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const msInDay = 1000 * 60 * 60 * 24
  return Math.ceil((expiry - today) / msInDay)
}


/**
 * Calculates the current stock level as a percentage of a target maximum
 * (assumed to be twice the minimum stock level for display purposes).
 * 
 * @param {Object} item - The inventory item.
 * @returns {number} The calculated stock percentage (0-100).
 */
export const getStockPercent = (item) => {
  const denominator = item.minStockLevel * 2
  if (!denominator) {
    return 0
  }
  return Math.max(0, Math.min(100, Math.round((item.quantity / denominator) * 100)))
}


/**
 * Determines the current status of an inventory item based on its expiry date
 * and stock level.
 * 
 * @param {Object} item - The inventory item.
 * @returns {string} Status string ('Expired', 'Near Expiry', 'Low Stock', or 'In Stock').
 */
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

/**
 * Maps a stock status string to a UI semantic tone category.
 * 
 * @param {string} status - The status string from getInventoryStatus.
 * @returns {string} The semantic tone ('critical', 'warning', or 'success').
 */
export const getStatusTone = (status) => {
  if (status === 'Expired') {
    return 'critical'
  }

  if (status === 'Near Expiry' || status === 'Low Stock') {
    return 'warning'
  }

  return 'success'
}
