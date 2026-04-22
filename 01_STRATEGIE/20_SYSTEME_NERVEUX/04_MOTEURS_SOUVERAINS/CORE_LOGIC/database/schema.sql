-- ##########################################
-- DB ARCHITECTURE : DIGITAL FLUX CORE v1.0
-- AUTHOR : DIGITAL ARCHITECT ELITE
-- STACK : SUPABASE / POSTGRESQL
-- ##########################################

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SECTEURS D'ACTIVITÉ (Silos) - Vérification d'existence
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sector_type') THEN
        CREATE TYPE sector_type AS ENUM ('medical', 'immobilier', 'ecommerce', 'education', 'hotel');
    END IF;
END $$;

-- 2. TABLE CLIENTS (Premium)
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    business_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    sector sector_type DEFAULT 'medical',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'prospect', 'premium')),
    total_lifetime_value DECIMAL(12, 2) DEFAULT 0,
    digital_maturity_score INTEGER DEFAULT 0, -- Calculé par l'Agent R&D
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLE FINANCES (Intelligence Comptable)
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'TND',
    type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
    category TEXT CHECK (category IN ('subscription', 'dev_project', 'consulting', 'marketing', 'hosting')),
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    invoice_url TEXT, -- Lien vers le stockage Cloud
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABLE R&D INNOVATION (Graph d'idées)
CREATE TABLE IF NOT EXISTS public.innovation_lab (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    problem_identified TEXT,
    solution_architecture TEXT,
    target_sector sector_type,
    tech_stack TEXT[], -- Array de technologies (ex: ['React', 'Supabase'])
    impact_roi_potential INTEGER DEFAULT 0, -- Score de 1 à 10
    status TEXT DEFAULT 'ideation' CHECK (status IN ('ideation', 'prototype', 'mvp', 'production')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔒 SÉCURITÉ : ROW LEVEL SECURITY (RLS)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.innovation_lab ENABLE ROW LEVEL SECURITY;

-- POLITIQUE : SEUL L'ORCHESTRATEUR (VOUS) A ACCÈS
-- On nettoie d'abord les anciennes politiques
DROP POLICY IF EXISTS "Full access to authenticated orchestrator" ON public.clients;
DROP POLICY IF EXISTS "Full access to authenticated orchestrator" ON public.finances;
DROP POLICY IF EXISTS "Full access to authenticated orchestrator" ON public.innovation_lab;

-- On recrée proprement
CREATE POLICY "Full access to authenticated orchestrator" 
ON public.clients FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Full access to authenticated orchestrator" 
ON public.finances FOR ALL 
USING (auth.role() = 'authenticated');

CREATE POLICY "Full access to authenticated orchestrator" 
ON public.innovation_lab FOR ALL 
USING (auth.role() = 'authenticated');

-- INDEXATION POUR PERFORMANCE (Zero Waterfall)
DROP INDEX IF EXISTS idx_clients_sector;
DROP INDEX IF EXISTS idx_finances_client;
DROP INDEX IF EXISTS idx_innovation_status;

CREATE INDEX idx_clients_sector ON public.clients(sector);
CREATE INDEX idx_finances_client ON public.finances(client_id);
CREATE INDEX idx_innovation_status ON public.innovation_lab(status);
-- ##########################################
-- ⚡️ ACTIVATION DU TEMPS RÉEL (REALTIME)
-- ##########################################

-- On active le temps réel pour les tables stratégiques
BEGIN;
  -- Supprimer la publication si elle existe déjà (pour réinitialisation)
  DROP PUBLICATION IF EXISTS supabase_realtime;
  
  -- Créer la publication pour le temps réel
  CREATE PUBLICATION supabase_realtime FOR TABLE 
    public.clients, 
    public.finances, 
    public.innovation_lab;
COMMIT;

-- 5. TABLE AUDIT LOGS (Synchronisation 360°)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'OPEN', 'EDIT', 'MOVE', 'FINISH'
    file_path TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation Realtime pour Audit
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access to audit" ON public.audit_logs FOR ALL USING (auth.role() = 'authenticated');
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
