import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SettingsProvider } from './contexts/SettingsContext'
import Header from './components/layout/Header'
import Home from './pages/Home'
import RecipeDetail from './pages/RecipeDetail'
import RecipeEditor from './pages/RecipeEditor'
import Costing from './pages/Costing'
import Admin from './pages/Admin'

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/recipe/new" element={<RecipeEditor />} />
              <Route path="/recipe/:id/edit" element={<RecipeEditor />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/costing" element={<Costing />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <footer className="text-center py-6 text-charcoal-400 text-sm border-t border-charcoal-700">
            © {new Date().getFullYear()} Recipe Cards
          </footer>
        </div>
      </BrowserRouter>
    </SettingsProvider>
  )
}
