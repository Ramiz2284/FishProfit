# Fish Profit - Copilot Instructions

## Project Overview

**Tech Stack:** React 19 + Vite 7 + Tailwind CSS 4 + ESLint 9  
**Domain:** Fishing business profit calculator with batch tracking and monthly cost analysis

Fish Profit is a single-page React application for calculating profitability of fish catches (batches). All state persists to localStorage under key `fish_batches_v1`.

## Architecture & Data Flow

### Single Monolithic Component

- **[src/App.jsx](src/App.jsx)** - 500+ line single component handling:
  - Batch management (add/update/remove catch batches)
  - Sales tracking (add/remove individual sales per batch)
  - Monthly operating costs (rent, ads, other)
  - Three-view tab UI: "Партии" (batches), "Продажи" (sales), and "Месяц" (monthly)
  - Profit calculations and margin analysis

### Core Data Model

```javascript
// Batch object structure
{
  id: crypto.randomUUID(),
  date: YYYY-MM-DD,
  purchaseCost: number,        // Закупка (purchase cost in lira)
  outputKg: number,            // Выход (output in kg) - для справки
  pricePerKg: number,          // Цена/кг (selling price) - используется если нет продаж
  discount: 0-1,               // Applied as percentage (legacy)
  electricity/water/fuel/packaging: number,  // Variable costs
  sales: [                     // Массив отдельных продаж
    { id, gramsAmount, totalPrice, dateTime }
  ]
}

// Monthly costs object
{ rent: number, ads: number, other: number }
```

### Revenue Calculation (Smart)

- **If sales exist:** Sum all individual sales: `sum(totalPrice)`
- **If no sales:** Use legacy formula: `outputKg * pricePerKg * (1 - discount)`
- **Profit:** `revenue - purchaseCost - (electricity + water + fuel + packaging)`
- **Margin:** `profit / revenue`
- **Net Profit:** `sum(batch profits) - monthly costs`

## Development Workflow

### Essential Commands

```bash
npm run dev      # Vite dev server with HMR (port 5173)
npm run build    # Production build → dist/
npm run preview  # Preview built app locally
npm run lint     # ESLint check on all .js/.jsx files
```

### Styling & Tailwind

- **Framework:** Tailwind CSS 4 with responsive utilities
- **Responsive:** Mobile-first using `sm:` breakpoint (640px)
- **Color scheme:** Blue accent, slate neutrals, red/green status indicators
- **Key components:** Sticky nav bar, grid layouts for input forms, conditional background colors

## Code Patterns in App.jsx

### State Management

```javascript
const [batches, setBatches] = useState(loadBatches())     // Batch array from localStorage
const [monthlyCosts, setMonthlyCosts] = useState({...})   // Monthly costs object
const [view, setView] = useState('batches')              // Tab view: 'batches' | 'month'

// Persist batches to localStorage on every change
useEffect(() => { saveBatches(batches) }, [batches])
```

### CRUD Operations

**Batches:**

- `addBatch()` - Creates new batch with UUID, today's date, empty sales array
- `updateBatch(id, field, value)` - Updates single batch field (auto-converts to number)
- `removeBatch(id)` - Filters out batch by id

**Sales (per batch):**

- `addSale(batchId, gramsAmount, totalPrice)` - Appends sale to batch.sales array
- `removeSale(batchId, saleId)` - Removes specific sale from batch
- **Key:** Avoid direct mutations; use spread/map for immutability

### Calculation Functions (Pure Functions)

```javascript
function calcBatch(batch)       // Returns {revenue, profit, margin, minPriceForMargin}
                                // Smart revenue: sales array sum OR legacy formula
function loadBatches()          // localStorage parsing with error handling
function saveBatches(batches)   // JSON.stringify to localStorage
```

### Form Input Pattern

All inputs follow this pattern with proper state binding and number conversion:

```jsx
<input
	type='number'
	value={b.fieldName}
	onChange={e => updateBatch(b.id, 'fieldName', e.target.value)}
	className='border border-slate-300 rounded-lg p-2 ...'
/>
```

### Conditional Styling (Red/Yellow/Green Status)

```jsx
className={`${
  profit < 0 ? 'bg-red-50'
  : profit < threshold ? 'bg-yellow-50'
  : 'bg-green-50'
}`}
```

## Important Notes

- **Cyrillic labels:** UI is fully in Russian (labels, button text, placeholder names)
- **Discount handling:** Stored as decimal 0-1, but displayed as percentage (multiplied by 100 in UI)
- **Sales tracking:** Individual sales (gramsAmount × pricePerGram) provide detailed revenue tracking; legacy formula used as fallback if no sales entered
- **Responsive:** Mobile layout with `sm:` breakpoint for tablet/desktop adjustments
- **No backend:** All data persists via localStorage only
- **Component growth:** Now 500+ lines; future refactor into components recommended

## Deployment

- Build with `npm run build` → creates `dist/` directory
- Vercel.json exists for deployment configuration
