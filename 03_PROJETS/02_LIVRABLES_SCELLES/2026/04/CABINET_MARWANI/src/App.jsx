import React from 'react'
import HeroSection from './components/HeroSection'
import ServicesSection from './components/ServicesSection'

function App() {
  return (
    <div className="min-h-screen">
      {/* Navigation (Simple Elite) */}
      <nav className="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold tracking-tighter">DR. MARWANI MALEK</div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-premium-muted uppercase tracking-widest">
          <a href="#" className="hover:text-premium-accent transition-colors">Expertise</a>
          <a href="#" className="hover:text-premium-accent transition-colors">Services</a>
          <a href="#" className="hover:text-premium-accent transition-colors">Contact</a>
        </div>
      </nav>

      <main>
        <HeroSection />
        <ServicesSection />
      </main>

      {/* Footer Bento */}
      <footer className="px-6 py-20 bg-white border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h4 className="font-bold mb-6 italic">Marwani Dental Studio</h4>
            <p className="text-premium-muted text-sm leading-relaxed">
              Redéfinir le sourire par l'innovation technique et l'approche humaine aux Berges du Lac 2.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-premium-accent">Horaires</h4>
            <ul className="text-premium-muted text-sm space-y-2">
              <li>Lundi - Vendredi : 09:00 - 18:00</li>
              <li>Samedi : 09:00 - 13:00</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-premium-accent">Accès</h4>
            <p className="text-premium-muted text-sm leading-relaxed">
              Lac Médical Center, Cabinet B3-2, Tunis<br />
              Près de la Clinique Hannibal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
