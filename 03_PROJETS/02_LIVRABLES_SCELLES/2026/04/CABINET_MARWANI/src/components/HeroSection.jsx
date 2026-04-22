import React from 'react';

const HeroSection = () => {
  return (
    <section className="px-6 py-12 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Main Hero Card (Large) */}
        <div className="md:col-span-3 h-[500px] bento-card relative group">
          {/* Fallback pattern since cp was restricted, but designed for the AI Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-premium-accent/20 to-transparent z-10" />
          <img 
            src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2070" 
            alt="Cabinet Dentaire Premium"
            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-700" 
          />
          <div className="absolute bottom-0 left-0 p-10 z-20 w-full bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
              L'Excellence Dentaire <br /> au Cœur des Berges du Lac.
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Le cabinet du Dr Marouani Malek allie technologie de pointe et confort absolu pour une expérience de soins inégalée.
            </p>
          </div>
        </div>

        {/* Info Card - Appointment */}
        <div className="bento-card bg-premium-accent p-8 flex flex-col justify-between text-white">
          <div className="text-4xl">📅</div>
          <div>
            <h3 className="text-2xl font-bold mb-2">Prendre RDV</h3>
            <p className="text-white/80 mb-6">Disponibilités en 24h pour les urgences.</p>
            <button className="w-full bg-white text-premium-accent py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-colors">
              Réserver en ligne
            </button>
          </div>
        </div>

        {/* Small Info Card - Contact */}
        <div className="bento-card p-8 flex flex-col justify-between border border-gray-100">
          <div className="text-premium-accent text-3xl font-bold">71 267 588</div>
          <p className="text-premium-muted">Lac Médical Center, Cabinet B3-2</p>
        </div>

        {/* Small Info Card - Specialization */}
        <div className="bento-card col-span-1 md:col-span-2 p-8 flex items-center gap-6 bg-white border border-gray-100">
          <div className="h-16 w-16 bg-premium-accent/10 rounded-full flex items-center justify-center text-premium-accent text-2xl">⚡</div>
          <div>
            <h3 className="text-lg font-bold">Spécialiste Implantologie</h3>
            <p className="text-premium-muted text-sm">Chirurgien Dentiste - Diplômé d'Excellence</p>
          </div>
        </div>

        {/* Small Info Card - Laser */}
        <div className="bento-card p-8 bg-gray-900 text-white">
          <h3 className="font-bold mb-2">Laser & Tech</h3>
          <p className="text-xs text-white/60 uppercase tracking-widest">Innovation 2026</p>
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
