import { useMemo } from 'react'
import tier2Data from '../data/tier2.json'

function ItemDetailTab({ item, getPrice, onBack }) {
  const { ingredients, totals } = useMemo(() => {
    let minQtySum = 0, maxQtySum = 0, minCostSum = 0, maxCostSum = 0

    const updated = item.ingredients.map(ing => {
      const price = getPrice(ing.name)
      const minCost = ing.min_qty * price
      const maxCost = ing.max_qty * price
      minQtySum += ing.min_qty
      maxQtySum += ing.max_qty
      minCostSum += minCost
      maxCostSum += maxCost

      const isTier2 = tier2Data[ing.name] !== undefined

      return { ...ing, price, minCost, maxCost, isTier2 }
    })

    return {
      ingredients: updated,
      totals: { minQtySum, maxQtySum, minCostSum, maxCostSum }
    }
  }, [item, getPrice])

  return (
    <div>
      <button className="back-button" onClick={onBack}>← Back to Items List</button>

      <h2>Costing: {item.name}</h2>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Min Cost</div>
          <div className="stat-value">₹{totals.minCostSum.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Max Cost</div>
          <div className="stat-value">₹{totals.maxCostSum.toFixed(2)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Cooking Loss</div>
          <div className="stat-value">{item.cooking_loss_percent}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Target Output</div>
          <div className="stat-value">1 kg</div>
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Type</th>
              <th className="number-right">Min Qty (kg)</th>
              <th className="number-right">Max Qty (kg)</th>
              <th className="number-right">Unit Cost (₹/kg)</th>
              <th className="number-right">Min Cost (₹)</th>
              <th className="number-right">Max Cost (₹)</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ing, idx) => (
              <tr key={idx} className={ing.isTier2 ? 'tier2-row' : ''}>
                <td>{ing.name}</td>
                <td><span className={`type-badge ${ing.isTier2 ? 'tier2' : 'tier1'}`}>
                  {ing.isTier2 ? 'In-house' : 'Raw'}
                </span></td>
                <td className="number-right">{ing.min_qty.toFixed(4)}</td>
                <td className="number-right">{ing.max_qty.toFixed(4)}</td>
                <td className="number-right">₹{ing.price.toFixed(2)}</td>
                <td className="number-right">₹{ing.minCost.toFixed(2)}</td>
                <td className="number-right">₹{ing.maxCost.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2"><strong>TOTAL</strong></td>
              <td className="number-right"><strong>{totals.minQtySum.toFixed(3)}</strong></td>
              <td className="number-right"><strong>{totals.maxQtySum.toFixed(3)}</strong></td>
              <td></td>
              <td className="number-right"><strong>₹{totals.minCostSum.toFixed(2)}</strong></td>
              <td className="number-right"><strong>₹{totals.maxCostSum.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="notes-box">
        <strong>Notes:</strong> Costs calculated for 1 kg cooked output.
        Cooking loss: {item.cooking_loss_percent}%.
        Raw input needed: ~{(1 / (1 - item.cooking_loss_percent / 100)).toFixed(3)} kg.
      </div>
    </div>
  )
}

export default ItemDetailTab
