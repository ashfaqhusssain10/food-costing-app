import { useMemo } from 'react'
import tier2Data from '../data/tier2.json'
import PricingModeToggle from './PricingModeToggle'

function ItemDetailTab({ item, getWholesalePrice, getMarketPrice, pricingMode, setPricingMode, onBack }) {
  const showMarket = pricingMode === 'market'

  const { ingredients, totals } = useMemo(() => {
    let minQtySum = 0, maxQtySum = 0
    let wMinCostSum = 0, wMaxCostSum = 0
    let mMinCostSum = 0, mMaxCostSum = 0

    const updated = item.ingredients.map(ing => {
      const wPrice = getWholesalePrice(ing.name)
      const mPrice = getMarketPrice(ing.name)
      const wMinCost = ing.min_qty * wPrice
      const wMaxCost = ing.max_qty * wPrice
      const mMinCost = ing.min_qty * mPrice
      const mMaxCost = ing.max_qty * mPrice

      minQtySum += ing.min_qty
      maxQtySum += ing.max_qty
      wMinCostSum += wMinCost
      wMaxCostSum += wMaxCost
      mMinCostSum += mMinCost
      mMaxCostSum += mMaxCost

      const isTier2 = tier2Data[ing.name] !== undefined

      return { ...ing, wPrice, mPrice, wMinCost, wMaxCost, mMinCost, mMaxCost, isTier2 }
    })

    return {
      ingredients: updated,
      totals: { minQtySum, maxQtySum, wMinCostSum, wMaxCostSum, mMinCostSum, mMaxCostSum }
    }
  }, [item, getWholesalePrice, getMarketPrice])

  return (
    <div>
      <button className="back-button" onClick={onBack}>← Back to Items List</button>

      <h2>Costing: {item.name}</h2>

      <PricingModeToggle pricingMode={pricingMode} setPricingMode={setPricingMode} />

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Wholesale Cost</div>
          <div className="stat-value">₹{totals.wMinCostSum.toFixed(0)} - ₹{totals.wMaxCostSum.toFixed(0)}</div>
        </div>
        {showMarket && (
          <div className="stat-card">
            <div className="stat-label">Market Cost</div>
            <div className="stat-value">₹{totals.mMinCostSum.toFixed(0)} - ₹{totals.mMaxCostSum.toFixed(0)}</div>
          </div>
        )}
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
              {showMarket ? (
                <>
                  <th className="number-right">W Price (₹/kg)</th>
                  <th className="number-right">M Price (₹/kg)</th>
                  <th className="number-right">W Cost (₹)</th>
                  <th className="number-right">M Cost (₹)</th>
                </>
              ) : (
                <>
                  <th className="number-right">Price (₹/kg)</th>
                  <th className="number-right">Min Cost (₹)</th>
                  <th className="number-right">Max Cost (₹)</th>
                </>
              )}
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
                {showMarket ? (
                  <>
                    <td className="number-right">₹{ing.wPrice.toFixed(0)}</td>
                    <td className="number-right market-cost">₹{ing.mPrice.toFixed(0)}</td>
                    <td className="number-right">₹{((ing.wMinCost + ing.wMaxCost) / 2).toFixed(2)}</td>
                    <td className="number-right market-cost">₹{((ing.mMinCost + ing.mMaxCost) / 2).toFixed(2)}</td>
                  </>
                ) : (
                  <>
                    <td className="number-right">₹{ing.wPrice.toFixed(2)}</td>
                    <td className="number-right">₹{ing.wMinCost.toFixed(2)}</td>
                    <td className="number-right">₹{ing.wMaxCost.toFixed(2)}</td>
                  </>
                )}
              </tr>
            ))}
            <tr className="total-row">
              <td colSpan="2"><strong>TOTAL</strong></td>
              <td className="number-right"><strong>{totals.minQtySum.toFixed(3)}</strong></td>
              <td className="number-right"><strong>{totals.maxQtySum.toFixed(3)}</strong></td>
              {showMarket ? (
                <>
                  <td></td>
                  <td></td>
                  <td className="number-right"><strong>₹{((totals.wMinCostSum + totals.wMaxCostSum) / 2).toFixed(2)}</strong></td>
                  <td className="number-right market-cost"><strong>₹{((totals.mMinCostSum + totals.mMaxCostSum) / 2).toFixed(2)}</strong></td>
                </>
              ) : (
                <>
                  <td></td>
                  <td className="number-right"><strong>₹{totals.wMinCostSum.toFixed(2)}</strong></td>
                  <td className="number-right"><strong>₹{totals.wMaxCostSum.toFixed(2)}</strong></td>
                </>
              )}
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
