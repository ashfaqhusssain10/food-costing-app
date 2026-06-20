import { useState, useMemo } from 'react'
import uomConfig from '../data/uom_config.json'
import PricingModeToggle from './PricingModeToggle'

function ItemsSummaryTab({ recipes, getWholesalePrice, getMarketPrice, pricingMode, setPricingMode, onItemSelect }) {
  const [searchTerm, setSearchTerm] = useState('')

  const showMarket = pricingMode === 'market'

  const itemsWithCosts = useMemo(() => {
    return recipes.map(item => {
      let wMinCost = 0, wMaxCost = 0
      let mMinCost = 0, mMaxCost = 0

      item.ingredients.forEach(ing => {
        const wPrice = getWholesalePrice(ing.name)
        const mPrice = getMarketPrice(ing.name)
        wMinCost += ing.min_qty * wPrice
        wMaxCost += ing.max_qty * wPrice
        mMinCost += ing.min_qty * mPrice
        mMaxCost += ing.max_qty * mPrice
      })

      const uom = uomConfig[item.name] || { display_uom: "KG", pieces_per_kg: null }

      let displayUnit = "KG"
      let perPieceMin = null
      let perPieceMax = null

      if (uom.display_uom === "PCS" && uom.pieces_per_kg) {
        displayUnit = uom.pieces_per_kg === 1 ? "PC" : `${uom.pieces_per_kg} PCS`
        perPieceMin = wMinCost / uom.pieces_per_kg
        perPieceMax = wMaxCost / uom.pieces_per_kg
      }

      return {
        ...item,
        wMinCost,
        wMaxCost,
        mMinCost,
        mMaxCost,
        displayUnit,
        perPieceMin,
        perPieceMax,
        hasPieces: uom.display_uom === "PCS"
      }
    })
  }, [recipes, getWholesalePrice, getMarketPrice])

  const filtered = itemsWithCosts.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2>Items Summary ({recipes.length} Starters)</h2>
      <p className="subtitle">Click any item to view detailed breakdown</p>

      <PricingModeToggle pricingMode={pricingMode} setPricingMode={setPricingMode} />

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
              {showMarket ? (
                <>
                  <th className="number-right">Min (W)</th>
                  <th className="number-right">Max (W)</th>
                  <th className="number-right">Min (M)</th>
                  <th className="number-right">Max (M)</th>
                </>
              ) : (
                <>
                  <th className="number-right">Min Price</th>
                  <th className="number-right">Max Price</th>
                </>
              )}
              <th className="number-right">UOM</th>
              <th className="number-right">Per 1 PC</th>
              <th className="number-right">Loss %</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.name} className="item-row" onClick={() => onItemSelect(item)}>
                <td>{item.name}</td>
                {showMarket ? (
                  <>
                    <td className="number-right cost-highlight">₹{item.wMinCost.toFixed(0)}</td>
                    <td className="number-right cost-highlight">₹{item.wMaxCost.toFixed(0)}</td>
                    <td className="number-right market-cost">₹{item.mMinCost.toFixed(0)}</td>
                    <td className="number-right market-cost">₹{item.mMaxCost.toFixed(0)}</td>
                  </>
                ) : (
                  <>
                    <td className="number-right cost-highlight">₹{item.wMinCost.toFixed(0)}</td>
                    <td className="number-right cost-highlight">₹{item.wMaxCost.toFixed(0)}</td>
                  </>
                )}
                <td className="number-right uom-badge">{item.displayUnit}</td>
                <td className="number-right per-piece-cost">
                  {item.hasPieces ? `₹${item.perPieceMin.toFixed(2)}` : '-'}
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
          <div className="stat-label">Avg Wholesale</div>
          <div className="stat-value">₹{filtered.length > 0 ? (filtered.reduce((s, i) => s + i.wMinCost, 0) / filtered.length).toFixed(0) : 0}</div>
        </div>
        {showMarket && (
          <div className="stat-card">
            <div className="stat-label">Avg Market</div>
            <div className="stat-value">₹{filtered.length > 0 ? (filtered.reduce((s, i) => s + i.mMinCost, 0) / filtered.length).toFixed(0) : 0}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemsSummaryTab
