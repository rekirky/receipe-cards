# Recipe Cards

A self-hosted web app for managing recipe cards, calculating menu costs, and generating nutrition information panels. View recipes online, download them as PDFs, and cost out dishes by ingredient.

## Features

### Recipe Management
- Browse all recipes in a filterable, searchable grid
- Filter by category — categories are fully customisable via the Admin panel
- View full recipe detail — ingredients, amounts, description, batch yield, storage notes
- Download any recipe as a formatted **landscape A4 PDF**
- Add, edit, and delete recipes directly in the browser
- Seed recipes are included as defaults and can be overridden

### Menu Costing Calculator
- Enter ingredients with pack size, purchase cost, and amount used
- Automatically calculates cost per ingredient, total batch cost, and cost per portion
- Mix units freely — buy in kg, use in grams; buy in litres, use in tablespoons
- **Save** costing sessions and return to update them later
- **Export as PDF** — formatted costing sheet ready to print or share
- **Export as CSV** — open in Excel or Google Sheets

### Nutrition Information Generator
- Enter nutrient values per 100g; per-serving amounts calculate automatically
- Add, remove, and reorder nutrient rows freely
- Live preview of the panel as you type
- **Export as SVG** with a transparent background — ready to place on product packaging

### Admin Panel
- **Logo** — upload a logo to replace the default icon in the navigation bar; set a URL for the logo to link to (useful when embedding in other software)
- **Colours** — choose a theme colour and background colour; each user can set their own preferences per device
- **PDF Options** — toggle printer-friendly mode (white background, greyscale) per device
- **Categories** — add, rename, and delete recipe categories; shared across all devices

---

## Architecture

The app runs as a **Node.js/Express server** that serves both the API and the built React frontend. Data is persisted to JSON files on disk.

| Layer | Technology |
|---|---|
| Frontend | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS with runtime CSS variables for theming |
| PDF generation | @react-pdf/renderer |
| Routing | React Router v6 |
| Backend | Express (Node.js) |
| Storage | JSON files on disk (`/data/`) |

**Storage split:**
- **Server-side** (shared across all devices): recipes, costings, logo, logo link URL, categories
- **Per-device** (localStorage): theme colour, background colour, printer-friendly PDF preference

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

# Start the development server (Vite frontend + Express API)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server proxies `/api` requests to the Express server running on port 3000.

### Build for production

```bash
npm run build
node server/index.js
```

The Express server serves the built frontend from `dist/` and the API from `/api/*`. The app will be available at **http://localhost:3000**.

---

## Docker

A `Dockerfile` and `docker-compose.yml` are included. The multi-stage build compiles the frontend and packages it with the Express server into a single image.

### Quick start

```bash
docker compose up -d
```

The app will be available at **http://localhost:2347**.

### Recommended `docker-compose.yml`

The volume mount is required for data to persist across container updates:

```yaml
services:
  recipe-cards:
    image: ghcr.io/rekirky/receipe-cards:latest
    ports:
      - "2347:3000"
    volumes:
      - recipe-data:/data
    restart: unless-stopped

  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --interval 300 recipe-cards
    restart: unless-stopped

volumes:
  recipe-data:
```

[Watchtower](https://containrrr.dev/watchtower/) is optional — it automatically pulls and redeploys updated images from the registry every 5 minutes.

### Auto-deployment via GitHub Actions

Pushing to `main` triggers a GitHub Actions workflow that builds and publishes a new image to the GitHub Container Registry (`ghcr.io`). If Watchtower is running, it will pick up the new image automatically.

No secrets setup is required — the workflow uses the built-in `GITHUB_TOKEN`.

### Change the port

Edit the `ports` line in `docker-compose.yml`:

```yaml
ports:
  - "YOUR_PORT:3000"
```

---

## Customising Default Recipes

Seed recipes (shown before any user-created ones) are defined in `server/store.js`. Edit the `SEED_RECIPES` array following the existing format:

```js
{
  id: 'your-recipe-id',       // unique URL slug
  name: 'Recipe Name',
  category: 'your-category',  // must match a category id in DEFAULT_SETTINGS
  tagline: 'Short description',
  description: 'Longer notes...',
  ingredients: [
    { name: 'Ingredient', amount: 30, unit: 'g' },
    { name: 'Another',    amount: 20, unit: 'g', notes: 'optional note' },
  ],
  yieldAmount: 50,
  yieldUnit: 'g',
  storageNotes: 'Optional storage instructions.',
}
```

Seed recipes are written to `recipes.json` only on first run (when no data file exists). To reset to defaults, delete `/data/recipes.json` and restart the server.

---

## Data

All data is stored as JSON files in the `/data/` directory (configurable via the `DATA_DIR` environment variable):

| File | Contents |
|---|---|
| `recipes.json` | All recipes (seed + user-created) |
| `costings.json` | Saved costing sessions |
| `settings.json` | Logo, logo link URL, categories |

Per-device preferences (theme colour, background colour, printer-friendly PDF) are stored in browser `localStorage` and never sent to the server.

---

## Tech Stack

- [Vite](https://vitejs.dev/) + [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) with CSS custom properties for runtime theming
- [@react-pdf/renderer](https://react-pdf.org/) — PDF generation
- [React Router v6](https://reactrouter.com/) — client-side routing
- [Express](https://expressjs.com/) — API server and static file serving
- [sharp](https://sharp.pixelplumbing.com/) — icon generation (dev dependency)

## License

MIT
