/*
  # Création des tables pour l'application de prospection

  1. Nouvelles Tables
    - `prospects`
      - `id` (uuid, clé primaire)
      - `name` (text, nom de l'entreprise/association)
      - `description` (text, description)
      - `website` (text, URL du site web, unique)
      - `website_age` (integer, âge du site en années)
      - `sector` (text, secteur d'activité)
      - `region` (text, région)
      - `contact_email` (text, email de contact)
      - `contact_phone` (text, téléphone optionnel)
      - `contact_address` (text, adresse)
      - `technical_issues` (text[], problèmes techniques détectés)
      - `design_score` (integer, score de design sur 10)
      - `status` (text, statut du prospect)
      - `notes` (text, notes optionnelles)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `search_history`
      - `id` (uuid, clé primaire)
      - `query` (text, requête de recherche)
      - `filters` (jsonb, filtres appliqués)
      - `results_count` (integer, nombre de résultats)
      - `created_at` (timestamp)

  2. Sécurité
    - Activer RLS sur toutes les tables
    - Politiques pour les utilisateurs authentifiés
*/

-- Table des prospects
CREATE TABLE IF NOT EXISTS prospects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  website text UNIQUE NOT NULL,
  website_age integer NOT NULL DEFAULT 0,
  sector text NOT NULL,
  region text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  contact_address text NOT NULL,
  technical_issues text[] DEFAULT '{}',
  design_score integer NOT NULL DEFAULT 5 CHECK (design_score >= 1 AND design_score <= 10),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'rejected', 'converted')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table de l'historique des recherches
CREATE TABLE IF NOT EXISTS search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query text DEFAULT '',
  filters jsonb NOT NULL DEFAULT '{}',
  results_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour les prospects (accès public pour la démo)
CREATE POLICY "Prospects publics en lecture"
  ON prospects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Prospects publics en écriture"
  ON prospects
  FOR ALL
  TO anon, authenticated
  USING (true);

-- Politiques pour l'historique des recherches
CREATE POLICY "Historique public en lecture"
  ON search_history
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Historique public en écriture"
  ON search_history
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_prospects_website ON prospects(website);
CREATE INDEX IF NOT EXISTS idx_prospects_sector ON prospects(sector);
CREATE INDEX IF NOT EXISTS idx_prospects_region ON prospects(region);
CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);
CREATE INDEX IF NOT EXISTS idx_prospects_website_age ON prospects(website_age);
CREATE INDEX IF NOT EXISTS idx_search_history_created_at ON search_history(created_at);