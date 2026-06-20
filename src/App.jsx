import { useState, useMemo } from 'react'
import RawMaterialsTab from './components/RawMaterialsTab'
import ItemsSummaryTab from './components/ItemsSummaryTab'
import ItemDetailTab from './components/ItemDetailTab'
import tier1Data from './data/tier1.json'
import tier2Data from './data/tier2.json'
import recipesData from './data/recipes.json'
import tier3MarketData from './data/tier3_market.json'

function App() {
  const [activeTab, setActiveTab] = useState('raw-materials')
  const [tier1, setTier1] = useState(tier1Data)
  const [tier3Market, setTier3Market] = useState(tier3MarketData)
  const [pricingMode, setPricingMode] = useState('wholesale') // 'wholesale' | 'market'
  const [selectedItem, setSelectedItem] = useState(null)

  const getPrice = useMemo(() => {
    // Build price maps for both pricing modes
    const tier1Map = {}
    tier1.forEach(item => { tier1Map[item.name] = item.price })

    // Market prices from tier3
    const marketMap = tier3Market.market_prices || {}

    // Select active price map based on pricing mode
    const activePriceMap = {}
    Object.keys(tier1Map).forEach(name => {
      activePriceMap[name] = pricingMode === 'market'
        ? (marketMap[name] || tier1Map[name])  // Use market price if available, fallback to wholesale
        : tier1Map[name]
    })

    // Calculate Tier 2 costs using active pricing
    const tier2Costs = {}
    Object.entries(tier2Data).forEach(([name, prep]) => {
      tier2Costs[name] = Object.entries(prep.components).reduce((sum, [component, ratio]) => {
        return sum + (ratio * (activePriceMap[component] || 0))
      }, 0)
    })

    return (ingredientName) => {
      if (activePriceMap[ingredientName] !== undefined) {
        return activePriceMap[ingredientName]
      }
      return tier2Costs[ingredientName] || 0
    }
  }, [tier1, tier3Market, pricingMode])

  // Calculate tier2Costs for display in RawMaterialsTab using current pricing mode
  const tier2Costs = useMemo(() => {
    const costs = {}
    Object.entries(tier2Data).forEach(([name, prep]) => {
      costs[name] = Object.entries(prep.components).reduce((sum, [component, ratio]) => {
        return sum + (ratio * getPrice(component))
      }, 0)
    })
    return costs
  }, [getPrice])

  // Separate wholesale price function (always uses tier1)
  const getWholesalePrice = useMemo(() => {
    const tier1Map = {}
    tier1.forEach(item => { tier1Map[item.name] = item.price })

    const t2Costs = {}
    Object.entries(tier2Data).forEach(([name, prep]) => {
      t2Costs[name] = Object.entries(prep.components).reduce((sum, [comp, ratio]) => {
        return sum + (ratio * (tier1Map[comp] || 0))
      }, 0)
    })

    return (ingredientName) => {
      if (tier1Map[ingredientName] !== undefined) return tier1Map[ingredientName]
      return t2Costs[ingredientName] || 0
    }
  }, [tier1])

  // Separate market price function (always uses tier3)
  const getMarketPrice = useMemo(() => {
    const tier1Map = {}
    tier1.forEach(item => { tier1Map[item.name] = item.price })
    const marketMap = tier3Market.market_prices || {}

    const activeMap = {}
    Object.keys(tier1Map).forEach(name => {
      activeMap[name] = marketMap[name] || tier1Map[name]
    })

    const t2Costs = {}
    Object.entries(tier2Data).forEach(([name, prep]) => {
      t2Costs[name] = Object.entries(prep.components).reduce((sum, [comp, ratio]) => {
        return sum + (ratio * (activeMap[comp] || 0))
      }, 0)
    })

    return (ingredientName) => {
      if (activeMap[ingredientName] !== undefined) return activeMap[ingredientName]
      return t2Costs[ingredientName] || 0
    }
  }, [tier1, tier3Market])

  const updatePrice = (id, newPrice) => {
    setTier1(prev => prev.map(item =>
      item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
    ))
  }

  const updateMarketPrice = (name, newPrice) => {
    setTier3Market(prev => ({
      ...prev,
      market_prices: {
        ...prev.market_prices,
        [name]: parseFloat(newPrice) || 0
      }
    }))
  }

  const handleItemSelect = (item) => {
    setSelectedItem(item)
    setActiveTab('item-detail')
  }

  return (
    <div className="app">
      <h1>Food Costing System</h1>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'raw-materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('raw-materials')}
        >
          1. Raw Materials
        </button>
        <button
          className={`tab-button ${activeTab === 'items-summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('items-summary')}
        >
          2. Items Summary
        </button>
        <button
          className={`tab-button ${activeTab === 'item-detail' ? 'active' : ''}`}
          onClick={() => setActiveTab('item-detail')}
          disabled={!selectedItem}
        >
          3. Item Detail
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'raw-materials' && (
          <RawMaterialsTab
            tier1={tier1}
            tier2={tier2Data}
            tier2Costs={tier2Costs}
            tier3Market={tier3Market}
            pricingMode={pricingMode}
            setPricingMode={setPricingMode}
            onUpdatePrice={updatePrice}
            onUpdateMarketPrice={updateMarketPrice}
          />
        )}
        {activeTab === 'items-summary' && (
          <ItemsSummaryTab
            recipes={recipesData}
            getWholesalePrice={getWholesalePrice}
            getMarketPrice={getMarketPrice}
            pricingMode={pricingMode}
            setPricingMode={setPricingMode}
            onItemSelect={handleItemSelect}
          />
        )}
        {activeTab === 'item-detail' && selectedItem && (
          <ItemDetailTab
            item={selectedItem}
            getWholesalePrice={getWholesalePrice}
            getMarketPrice={getMarketPrice}
            pricingMode={pricingMode}
            setPricingMode={setPricingMode}
            onBack={() => { setSelectedItem(null); setActiveTab('items-summary') }}
          />
        )}
      </div>
    </div>
  )
}

export default App
