import React from 'react';

const services = [
  {
    title: "Implantologie",
    desc: "Prothèse fixe et amovible sur implant, bridge complet.",
    icon: "🦷",
    color: "bg-blue-50",
    span: "md:col-span-2"
  },
  {
    title: "Chirurgie Laser",
    desc: "Freinectomie et soins sans douleur par laser.",
    icon: "✨",
    color: "bg-purple-50",
    span: "md:col-span-1"
  },
  {
    title: "Dentisterie Esthétique",
    desc: "Blanchiment, Facettes et Couronnes Zircone.",
    icon: "💎",
    color: "bg-emerald-50",
    span: "md:col-span-1"
  },
  {
    title: "Soins Préventifs",
    desc: "Détartrage, traitement des gingivites et caries.",
    icon: "🛡️",
    color: "bg-amber-50",
    span: "md:col-span-2"
  }
];

const ServicesSection = () => {
  return (
    <section className="px-6 py-20 max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-4">Nos Spécialités</h2>
        <p className="text-premium-muted">Une expertise complète pour votre santé bucco-dentaire.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <div 
            key={index} 
            className={`bento-card p-10 flex flex-col justify-between ${service.color} ${service.span}`}
          >
            <div className="text-4xl mb-8">{service.icon}</div>
            <div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-premium-muted text-sm leading-relaxed">{service.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
