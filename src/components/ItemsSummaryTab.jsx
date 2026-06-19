import { useState, useMemo } from 'react'
import uomConfig from '../data/uom_config.json'

function ItemsSummaryTab({ recipes, getPrice, onItemSelect }) {
  const [searchTerm, setSearchTerm] = useState('')

  const itemsWithCosts = useMemo(() => {
    return recipes.map(item => {
      let minCost = 0
      let maxCost = 0
      item.ingredients.forEach(ing => {
        const price = getPrice(ing.name)
        minCost += ing.min_qty * price
        maxCost += ing.max_qty * price
      })

      // Get UOM config for this item
      const uom = uomConfig[item.name] || { display_uom: "KG", pieces_per_kg: null }

      // Calculate display price based on UOM
      let displayMinCost = minCost
      let displayMaxCost = maxCost
      let displayUnit = "KG"
      let perPieceMin = null
      let perPieceMax = null

      if (uom.display_uom === "PCS" && uom.pieces_per_kg) {
        // For piece-based items, calculate per-piece cost
        displayMinCost = minCost / uom.pieces_per_kg
        displayMaxCost = maxCost / uom.pieces_per_kg
        displayUnit = uom.pieces_per_kg === 1 ? "PC" : `${uom.pieces_per_kg} PCS`

        // Also calculate per 1 piece
        perPieceMin = minCost / uom.pieces_per_kg
        perPieceMax = maxCost / uom.pieces_per_kg
      }

      return {
        ...item,
        minCost,
        maxCost,
        displayMinCost,
        displayMaxCost,
        displayUnit,
        perPieceMin,
        perPieceMax,
        hasPieces: uom.display_uom === "PCS"
      }
    })
  }, [recipes, getPrice])

  const filtered = itemsWithCosts.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const avgMin = filtered.length > 0
    ? filtered.reduce((s, i) => s + i.minCost, 0) / filtered.length : 0
  const avgMax = filtered.length > 0
    ? filtered.reduce((s, i) => s + i.maxCost, 0) / filtered.length : 0

  return (
    <div>
      <h2>Items Summary ({recipes.length} Starters)</h2>
      <p className="subtitle">Click any item to view detailed breakdown</p>

      <input
        type="text"
        className="search-box"
        placeholder="Search items..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th className="number-right">Min Price</th>
              <th className="number-right">Max Price</th>
              <th className="number-right">UOM</th>
              <th className="number-right">Per 1 PC</th>
              <th className="number-right">Cooking Loss</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.name} className="item-row" onClick={() => onItemSelect(item)}>
                <td>{item.name}</td>
                <td className="number-right cost-highlight">₹{item.displayMinCost.toFixed(2)}</td>
                <td className="number-right cost-highlight">₹{item.displayMaxCost.toFixed(2)}</td>
                <td className="number-right uom-badge">{item.displayUnit}</td>
                <td className="number-right per-piece-cost">
                  {item.hasPieces ? `₹${item.perPieceMin.toFixed(2)} - ₹${item.perPieceMax.toFixed(2)}` : '-'}
                </td>
                <td className="number-right">{item.cooking_loss_percent}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{recipes.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Min Cost</div>
          <div className="stat-value">₹{avgMin.toFixed(0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Max Cost</div>
          <div className="stat-value">₹{avgMax.toFixed(0)}</div>
        </div>
      </div>
    </div>
  )
}

export default ItemsSummaryTab
