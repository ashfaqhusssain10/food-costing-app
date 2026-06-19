import { useState, useMemo } from 'react'

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
      return { ...item, minCost, maxCost }
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
              <th className="number-right">Min Cost (₹)</th>
              <th className="number-right">Max Cost (₹)</th>
              <th className="number-right">Cooking Loss</th>
              <th>Output</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.name} className="item-row" onClick={() => onItemSelect(item)}>
                <td>{item.name}</td>
                <td className="number-right cost-highlight">₹{item.minCost.toFixed(2)}</td>
                <td className="number-right cost-highlight">₹{item.maxCost.toFixed(2)}</td>
                <td className="number-right">{item.cooking_loss_percent}%</td>
                <td>1 kg</td>
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
