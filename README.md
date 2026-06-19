# Food Costing Web App

A modern web-based food costing system with dynamic pricing and real-time calculations.

## Quick Start

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Open browser to http://localhost:3000
```

## Features

- **Tab 1: Raw Materials**
  - Edit prices directly in the table
  - Add new ingredients with form
  - Search and filter
  - Shows 249 ingredients

- **Tab 2: Items Summary**
  - View all 42 starter items
  - Auto-calculated min/max costs
  - Click any item to view details
  - Stats cards with averages

- **Tab 3: Item Detail**
  - Full ingredient breakdown
  - Quantities and costs
  - Cooking loss information
  - Back button to return to list

## How It Works

1. Raw material prices are stored in Tab 1
2. When you edit a price, the app recalculates all item costs
3. Tab 2 shows updated costs immediately
4. Tab 3 shows ingredient-level breakdown with current prices

## Tech Stack

- React 18
- Vite (fast dev server & build)
- Pure CSS (no framework)
- JSON data files (no database needed yet)

## Deployment

### Option 1: Netlify (Recommended)
```bash
npm run build
# Drag 'dist' folder to netlify.com/drop
```

### Option 2: Vercel
```bash
npm run build
npx vercel --prod
```

### Option 3: GitHub Pages
```bash
npm run build
# Push 'dist' folder to gh-pages branch
```

## Adding Persistence

Currently, data resets on page refresh. To add persistence:

**Easy (localStorage):**
```javascript
// Save on price change
localStorage.setItem('rawMaterials', JSON.stringify(rawMaterials))

// Load on mount
const saved = localStorage.getItem('rawMaterials')
if (saved) setRawMaterials(JSON.parse(saved))
```

**Better (Backend):**
- Add Node.js/Express backend
- PostgreSQL or MySQL database
- REST API for CRUD operations

## File Structure

```
web-app/
├── src/
│   ├── components/
│   │   ├── RawMaterialsTab.jsx
│   │   ├── ItemsSummaryTab.jsx
│   │   └── ItemDetailTab.jsx
│   ├── data/
│   │   ├── rawMaterials.json (249 ingredients)
│   │   └── itemsData.json (42 items)
│   ├── App.jsx (main app with state)
│   ├── main.jsx (entry point)
│   └── index.css (styles)
├── index.html
├── package.json
└── vite.config.js
```

## Data Updates

If you regenerate CSV data, run:

```bash
cd ../
python3 export_to_json.py
```

This exports fresh JSON files to `web-app/src/data/`.
