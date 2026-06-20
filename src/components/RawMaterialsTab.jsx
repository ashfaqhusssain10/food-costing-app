import { useState } from 'react'
import PricingModeToggle from './PricingModeToggle'

function RawMaterialsTab({ tier1, tier2, tier2Costs, tier3Market, pricingMode, setPricingMode, onUpdatePrice, onUpdateMarketPrice }) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTier1 = tier1.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <h2>Raw Materials (Tier 1 - Purchasable)</h2>
      <p className="subtitle">Edit prices here — all item costs recalculate automatically</p>

      <PricingModeToggle pricingMode={pricingMode} setPricingMode={setPricingMode} />

      <div className="active-pricing-indicator">
        Currently using: <strong>{pricingMode === 'market' ? 'Market' : 'Wholesale'}</strong> prices for calculations
      </div>

      <input
        type="text"
        className="search-box"
        placeholder="Search ingredients or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Category</th>
              <th className="number-right">Wholesale (₹/kg)</th>
              <th className="number-right">Market (₹/kg)</th>
              <th className="number-right">Markup %</th>
            </tr>
          </thead>
          <tbody>
            {filteredTier1.map((item) => {
              const marketPrice = tier3Market.market_prices[item.name] || item.price
              const markup = ((marketPrice / item.price - 1) * 100).toFixed(0)

              return (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><span className="category-badge">{item.category}</span></td>

                  {/* Wholesale Price - Editable */}
                  <td className="editable-cell number-right">
                    <input
                      type="number"
                      step="0.5"
                      value={item.price}
                      onChange={(e) => onUpdatePrice(item.id, e.target.value)}
                    />
                  </td>

                  {/* Market Price - Editable */}
                  <td className="editable-cell number-right">
                    <input
                      type="number"
                      step="0.5"
                      value={marketPrice}
                      onChange={(e) => onUpdateMarketPrice(item.name, e.target.value)}
                    />
                  </td>

                  {/* Markup % - Calculated */}
                  <td className="number-right">
                    <span className={markup > 100 ? 'high-markup' : ''}>
                      {markup}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <h2 className="section-divider">In-House Preparations (Tier 2 - Auto-calculated)</h2>
      <p className="subtitle">Costs derived from Tier 1 raw materials above</p>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Preparation</th>
              <th className="number-right">Cost (₹/kg)</th>
              <th>Components</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(tier2).map(([name, prep]) => (
              <tr key={name}>
                <td><strong>{name}</strong></td>
                <td className="number-right cost-highlight">₹{tier2Costs[name]?.toFixed(2)}</td>
                <td className="components-cell">
                  {Object.entries(prep.components).map(([comp, ratio]) => (
                    <span key={comp} className="component-tag">
                      {comp} ({(ratio * 100).toFixed(0)}%)
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Tier 1 Items</div>
          <div className="stat-value">{tier1.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tier 2 Preparations</div>
          <div className="stat-value">{Object.keys(tier2).length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Showing</div>
          <div className="stat-value">{filteredTier1.length}</div>
        </div>
      </div>
    </div>
  )
}

export default RawMaterialsTab
