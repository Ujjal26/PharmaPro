/* eslint-disable no-unused-vars */
import { useState, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addItemToFirestore } from '../slices/inventorySlice'
import { useAuth } from '../user auth/AuthContext'
import './CsvImportExport.css'

function CsvImportExport({ items }) {
  const dispatch = useDispatch()
  const { currentUser } = useAuth()
  const fileInputRef = useRef(null)
  
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)

  // ─── EXPORT LOGIC ───
  const handleExport = () => {
    if (!items || items.length === 0) {
      alert("No inventory data to export.")
      return
    }

    const headers = [
      "Medicine Name", "Category", "Batch ID", "Manufacturer", 
      "Quantity", "Min Stock Level", "Unit Price", "Expiry Date", 
      "Storage Condition", "Notes"
    ]

    const csvRows = []
    csvRows.push(headers.join(','))

    items.forEach(item => {
      // Escape fields that might contain commas
      const row = [
        `"${item.medicineName || ''}"`,
        `"${item.category || ''}"`,
        `"${item.batchId || ''}"`,
        `"${item.manufacturer || ''}"`,
        item.quantity || 0,
        item.minStockLevel || 0,
        item.unitPrice || 0,
        `"${item.expiryDate || ''}"`,
        `"${item.storageCondition || ''}"`,
        `"${item.notes || ''}"`
      ]
      csvRows.push(row.join(','))
    })

    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `pharmapro_inventory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // ─── IMPORT LOGIC ───
  const parseCSVRow = (text) => {
    // Simple regex to parse CSV rows respecting quotes
    const regex = /(".*?"|[^",\s]+)(?=\s*,|\s*$)/g
    let match
    const row = []
    while ((match = regex.exec(text)) !== null) {
      row.push(match[1].replace(/^"|"$/g, '').trim())
    }
    return row
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setImporting(true)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const csvText = event.target.result
      const lines = csvText.split('\n').filter(line => line.trim().length > 0)
      
      if (lines.length <= 1) {
        setImportResult({ error: true, msg: "CSV file is empty or missing data rows." })
        setImporting(false)
        return
      }

      let successCount = 0
      let errorCount = 0

      // Skip header row (i = 1)
      for (let i = 1; i < lines.length; i++) {
        // Simple fallback parsing if regex fails
        const rowData = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || lines[i].split(',')
        const cleanedRow = rowData.map(val => val.replace(/^"|"$/g, '').trim())

        if (cleanedRow.length < 8) {
          errorCount++
          continue
        }

        const [
          medicineName, category, batchId, manufacturer, 
          quantity, minStockLevel, unitPrice, expiryDate, 
          storageCondition = '', notes = ''
        ] = cleanedRow

        // Basic validation
        if (!medicineName || !batchId || isNaN(Number(quantity))) {
          errorCount++
          continue
        }

        const id = `INV-${String(Date.now()).slice(-5)}-${Math.floor(Math.random() * 1000)}`
        
        const newItem = {
          id,
          medicineName,
          category: category || 'Other',
          batchId: batchId.toUpperCase(),
          manufacturer: manufacturer || '',
          quantity: Number(quantity),
          minStockLevel: Number(minStockLevel) || 10,
          unitPrice: Number(unitPrice) || 0,
          expiryDate,
          storageCondition,
          notes
        }

        if (currentUser?.uid) {
          await dispatch(addItemToFirestore({ item: newItem, userId: currentUser.uid }))
          successCount++
        }
      }

      setImportResult({ error: false, msg: `Imported ${successCount} items successfully. ${errorCount > 0 ? `Failed to parse ${errorCount} rows.` : ''}` })
      setImporting(false)
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
    
    reader.onerror = () => {
      setImportResult({ error: true, msg: "Failed to read the file." })
      setImporting(false)
    }

    reader.readAsText(file)
  }

  return (
    <div className="csv-import-export surface-card">
      <div className="csv-header">
        <h3 className="csv-title">Data Management</h3>
        <p className="csv-subtitle">Import batch stock from a spreadsheet or export your current inventory.</p>
      </div>
      
      <div className="csv-actions">
        <button 
          className="csv-btn csv-export-btn" 
          onClick={handleExport}
          title="Download inventory as CSV"
        >
          <span className="csv-icon">⬇</span> Export CSV
        </button>
        
        <button 
          className="csv-btn csv-import-btn" 
          onClick={handleImportClick}
          disabled={importing}
          title="Upload CSV to add/update stock"
        >
          <span className="csv-icon">⬆</span> {importing ? 'Importing...' : 'Import CSV'}
        </button>
        
        <input 
          type="file" 
          accept=".csv" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }}
        />
      </div>

      {importResult && (
        <div className={`csv-result ${importResult.error ? 'csv-error' : 'csv-success'}`}>
          {importResult.msg}
        </div>
      )}
    </div>
  )
}

export default CsvImportExport
