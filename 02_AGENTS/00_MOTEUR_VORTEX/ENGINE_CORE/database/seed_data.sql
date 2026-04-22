-- DONNÉES DE TEST : ÉCOSYSTÈME DIGITAL FLUX
-- À exécuter après schema.sql

-- 1. INSERTION CLIENTS MODÈLES
INSERT INTO public.clients (full_name, business_name, email, sector, status, digital_maturity_score)
VALUES 
('Dr. Ahmed Ben Salem', 'Clinique du Nord', 'ahmed.bensalem@clinique.tn', 'medical', 'premium', 85),
('Samia Mansour', 'Pharma Plus', 'contact@pharmaplus.tn', 'medical', 'active', 40);

-- 2. INSERTION FINANCES (CA INITIAL)
INSERT INTO public.finances (client_id, amount, type, category, description)
SELECT id, 2500.00, 'revenue', 'subscription', 'Abonnement MediFlux Premium - Avril 2024'
FROM public.clients WHERE business_name = 'Clinique du Nord';

INSERT INTO public.finances (client_id, amount, type, category, description)
SELECT id, 5000.00, 'revenue', 'dev_project', 'Développement Dashboard Analytique Custom'
FROM public.clients WHERE business_name = 'Pharma Plus';

-- 3. INSERTION R&D (LE PROCHAIN PRODUIT)
INSERT INTO public.innovation_lab (title, problem_identified, solution_architecture, target_sector, tech_stack, impact_roi_potential, status)
VALUES 
('MediScan AI', 'Retard dans le diagnostic radiologique en Tunisie', 'API Vision avec modèle de segmentation local', 'medical', ARRAY['Python', 'FastAPI', 'React'], 9, 'prototype');
