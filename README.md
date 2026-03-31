# Recipe Cards

A web app for managing spice blend recipe cards and calculating menu costs. View recipes online, download them as PDFs, and cost out dishes by ingredient.

## Features

### Recipe Cards
- Browse all recipes in a filterable grid (dry rubs, seasonings, marinades, etc.)
- View full recipe details — ingredients, amounts, description, storage notes
- Download any recipe as a formatted **A4 PDF**
- Add, edit, and delete your own recipes via a form in the browser
- Built-in recipes are included as defaults — editing one saves a local customised copy

### Menu Costing Calculator
- Enter ingredients with their pack size, purchase cost, and amount used in the recipe
- Automatically calculates the cost per ingredient, total batch cost, and cost per portion
- Mix and match units — buy in kg, use in grams, buy in litres, use in tablespoons
- Visual cost breakdown showing each ingredient's share of the total
- **Save** costing sessions and come back to them later
- **Load** any previously saved session and update it
- **Export as PDF** — formatted costing sheet ready to print or share
- **Export as CSV** — open in Excel or Google Sheets for further analysis

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (included with Node.js)

### Run locally

```bash
# Clone the repository
git clone https://github.com/rekirky/receipe-cards.git
cd receipe-cards

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production

```bash
npm run build
```

The compiled static files will be in the `dist/` folder. These can be served by any static file host (Netlify, Cloudflare Pages, GitHub Pages, nginx, etc.).

---

## Docker

A `Dockerfile` and `docker-compose.yml` are included for running the app in a container.

```bash
# Build and start the container
docker compose up -d --build
```

The app will be available at **http://localhost:2347**

To change the port, edit the `ports` line in `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:80"
```

---

## Adding Recipes

Recipes can be added directly in the browser using the **New Recipe** button on the home page. All changes are saved locally in your browser's storage.

To include recipes as built-in defaults (available before any user customisation), edit `src/data/recipes.ts` and add an entry following the existing format:

```ts
{
  id: 'your-recipe-id',          // unique URL slug
  name: 'Your Recipe Name',
  category: 'dry-rub',           // dry-rub | wet-marinade | injection | finishing-sauce | brine | seasoning
  tagline: 'Short description',
  description: 'Longer usage notes...',
  ingredients: [
    { name: 'Salt', amount: 30, unit: 'g' },
    { name: 'Black Pepper', amount: 20, unit: 'g', notes: 'coarsely cracked' },
  ],
  yieldAmount: 50,
  yieldUnit: 'g',
  storageNotes: 'Store in an airtight jar for up to 6 months.',
},
```

---

## Data & Privacy

All recipe edits and saved costings are stored in your **browser's localStorage**. No data is sent to any server. Clearing your browser data will remove any saved recipes and costings — export anything important first.

---

## Tech Stack

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [@react-pdf/renderer](https://react-pdf.org/) — PDF generation
- [React Router](https://reactrouter.com/) — client-side routing
- [nginx](https://nginx.org/) — static file serving in Docker

## License

MIT
