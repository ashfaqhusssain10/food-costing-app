import { useState, useMemo } from 'react'
import RawMaterialsTab from './components/RawMaterialsTab'
import ItemsSummaryTab from './components/ItemsSummaryTab'
import ItemDetailTab from './components/ItemDetailTab'
import tier1Data from './data/tier1.json'
import tier2Data from './data/tier2.json'
import recipesData from './data/recipes.json'

function App() {
  const [activeTab, setActiveTab] = useState('raw-materials')
  const [tier1, setTier1] = useState(tier1Data)
  const [selectedItem, setSelectedItem] = useState(null)

  const getPrice = useMemo(() => {
    const tier1Map = {}
    tier1.forEach(item => { tier1Map[item.name] = item.price })

    return (ingredientName) => {
      if (tier1Map[ingredientName] !== undefined) {
        return tier1Map[ingredientName]
      }
      const prep = tier2Data[ingredientName]
      if (prep) {
        return Object.entries(prep.components).reduce((sum, [component, ratio]) => {
          return sum + (ratio * (tier1Map[component] || 0))
        }, 0)
      }
      return 0
    }
  }, [tier1])

  const tier2Costs = useMemo(() => {
    const costs = {}
    Object.entries(tier2Data).forEach(([name, prep]) => {
      costs[name] = Object.entries(prep.components).reduce((sum, [component, ratio]) => {
        const t1 = tier1.find(t => t.name === component)
        return sum + (ratio * (t1 ? t1.price : 0))
      }, 0)
    })
    return costs
  }, [tier1])

  const updatePrice = (id, newPrice) => {
    setTier1(prev => prev.map(item =>
      item.id === id ? { ...item, price: parseFloat(newPrice) || 0 } : item
    ))
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
            onUpdatePrice={updatePrice}
          />
        )}
        {activeTab === 'items-summary' && (
          <ItemsSummaryTab
            recipes={recipesData}
            getPrice={getPrice}
            onItemSelect={handleItemSelect}
          />
        )}
        {activeTab === 'item-detail' && selectedItem && (
          <ItemDetailTab
            item={selectedItem}
            getPrice={getPrice}
            onBack={() => { setSelectedItem(null); setActiveTab('items-summary') }}
          />
        )}
      </div>
    </div>
  )
}

export default App
