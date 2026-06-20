function PricingModeToggle({ pricingMode, setPricingMode }) {
  return (
    <div className="pricing-toggle">
      <label className={pricingMode === 'wholesale' ? 'active' : ''}>
        <input
          type="radio"
          value="wholesale"
          checked={pricingMode === 'wholesale'}
          onChange={() => setPricingMode('wholesale')}
        />
        <span>💰 Wholesale Pricing</span>
      </label>
      <label className={pricingMode === 'market' ? 'active' : ''}>
        <input
          type="radio"
          value="market"
          checked={pricingMode === 'market'}
          onChange={() => setPricingMode('market')}
        />
        <span>🛒 Market Pricing</span>
      </label>
    </div>
  )
}

export default PricingModeToggle
