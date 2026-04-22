# 📊 INVENTAIRE DES TABLES SQL (SUPABASE)
> **OBJET** : Dictionnaire de Données & Schéma Relationnel
> **TECHNOLOGIE** : PostgreSQL / Supabase Realtime

## 1. TABLE : `public.clients` (Table Maîtresse)
Stocke les entités business et leur maturité digitale.

| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique (Clé Primaire). |
| `full_name` | TEXT | Nom complet du contact. |
| `business_name`| TEXT | Nom de l'entreprise ou Clinique. |
| `email` | TEXT | Email (Unique, indexé). |
| `phone` | TEXT | Coordonnées téléphoniques. |
| `sector` | ENUM | Pôle (medical, immobilier, ecommerce, etc). |
| `status` | TEXT | État du client (prospect, active, premium). |
| `total_lifetime_value` | DECIMAL | Somme totale générée (LTV). |
| `digital_maturity_score`| INT | Score 0-100 calculé par l'Agent R&D. |

## 2. TABLE : `public.finances` (Intelligence Cash)
Trace chaque flux monétaire entrant ou sortant.

| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique. |
| `client_id` | UUID | Lien vers la table Clients (Clé Étrangère). |
| `amount` | DECIMAL | Montant de la transaction (en TND). |
| `type` | TEXT | `revenue` (Entrée) ou `expense` (Sortie). |
| `category` | TEXT | subscription, project, consulting, etc. |
| `transaction_date`| DATE | Date réelle de la transaction. |
| `invoice_url` | TEXT | Lien vers le stockage de la facture PDF. |

## 3. TABLE : `public.innovation_lab` (Pipeline R&D)
Incubateur visuel de vos futurs produits.

| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | UUID | Identifiant unique. |
| `title` | TEXT | Nom de l'innovation (ex: MediFlux AI). |
| `tech_stack` | TEXT[] | Liste des technos utilisées (React, Python, etc). |
| `impact_roi_potential`| INT | Score de potentiel financier (1 à 10). |
| `status` | TEXT | ideation, prototype, mvp, production. |

## 🕹️ ACTIVATION DU "DIRECT LIVE"
Ces trois tables sont connectées au flux **`supabase_realtime`**. Cela signifie que dès qu'une ligne est insérée :
1.  Le script `monitor.js` l'affiche dans votre terminal.
2.  Le Dashboard fait "popper" l'indicateur visuel sans que vous ayez besoin de rafraîchir la page.

---
*Ce dictionnaire est la base de votre future IA Prédictive (Capacité à anticiper quel prospect sera le plus rentable).*
