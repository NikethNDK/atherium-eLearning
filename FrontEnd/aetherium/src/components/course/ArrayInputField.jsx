"use client"

import { useState } from "react"
import { X } from "lucide-react"

const ArrayInputField = ({ label, items, onAdd, onRemove, placeholder, maxItems = 8, error }) => {
  const [newItem, setNewItem] = useState("")

  const handleAdd = () => {
    if (newItem.trim() && items.length < maxItems) {
      onAdd(newItem.trim())
      setNewItem("")
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAdd()
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium text-gray-700">
          {label} ({items.length}/{maxItems})
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!newItem.trim() || items.length >= maxItems}
          className="text-orange-500 hover:text-orange-600 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Add new
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{String(index + 1).padStart(2, "0")}</span>
            <input
              type="text"
              value={item}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <span className="text-xs text-gray-500">{item.length}/120</span>
            <button type="button" onClick={() => onRemove(index)} className="text-red-500 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        ))}

        {items.length < maxItems && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">{String(items.length + 1).padStart(2, "0")}</span>
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={placeholder}
              maxLength={120}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              onKeyPress={handleKeyPress}
            />
            <span className="text-xs text-gray-500">{newItem.length}/120</span>
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  )
}

export default ArrayInputField
