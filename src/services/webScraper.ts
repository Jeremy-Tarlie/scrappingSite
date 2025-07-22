import { Prospect } from '../types';

interface ScrapingResult {
  name: string;
  description: string;
  website: string;
  contact: {
    email: string;
    phone?: string;
    address: string;
  };
  technicalIssues: string[];
  designScore: number;
  websiteAge: number;
}

export class WebScraperService {
  private scrapedUrls = new Set<string>();
  private shouldContinue = true;

  stopContinuousSearch() {
    this.shouldContinue = false;
  }

  async continuousSearchProspects(
    sector: string,
    region: string,
    websiteAge: string,
    query: string | undefined,
    onBatch: (prospects: Prospect[]) => void,
    batchSize: number = 20,
    onGoogleRequest?: () => void
  ) {
    this.shouldContinue = true;
    while (this.shouldContinue) {
      if (onGoogleRequest) onGoogleRequest();
      const batch = await this.searchProspects(sector, region, websiteAge, query);
      if (batch.length === 0) break;
      onBatch(batch);
      // Petite pause pour éviter le spam
      await new Promise(res => setTimeout(res, 1000));
    }
  }

  async searchProspects(
    sector: string,
    region: string,
    websiteAge: string,
    query?: string
  ): Promise<Prospect[]> {
    const searchQueries = this.buildSearchQueries(sector, region, query);
    const prospects: Prospect[] = [];

    for (const searchQuery of searchQueries) {
      try {
        // Déduire la région utilisée dans la requête
        let regionForProspect = region;
        if (region === 'all') {
          // On essaye de retrouver la région à partir du searchQuery
          const regionTerms = {
            'ile-de-france': ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil', 'Nanterre', 'Créteil', 'Versailles', 'Île-de-France', '75', '77', '78', '91', '92', '93', '94', '95'],
            'auvergne-rhone-alpes': ['Lyon', 'Saint-Étienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand', 'Chambéry', 'Annecy', 'Valence', 'Roanne', 'Vénissieux', 'Rhône-Alpes', 'Auvergne', 'Puy-de-Dôme', 'Cantal', 'Allier', 'Haute-Loire', 'Ain', 'Ardèche', 'Drôme', 'Isère', 'Loire', 'Rhône', 'Savoie', 'Haute-Savoie'],
            'nouvelle-aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'Pau', 'La Rochelle', 'Mérignac', 'Pessac', 'Bayonne', 'Angoulême', 'Niort', 'Bergerac', 'Brive-la-Gaillarde', 'Biarritz', 'Gironde', 'Charente', 'Charente-Maritime', 'Corrèze', 'Creuse', 'Dordogne', 'Landes', 'Lot-et-Garonne', 'Pyrénées-Atlantiques', 'Deux-Sèvres', 'Vienne', 'Haute-Vienne', 'Nouvelle-Aquitaine'],
            'occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Narbonne', 'Albi', 'Carcassonne', 'Montauban', 'Sète', 'Rodez', 'Tarbes', 'Colomiers', 'Muret', 'Blagnac', 'Castres', 'Hérault', 'Gard', 'Aude', 'Aveyron', 'Haute-Garonne', 'Gers', 'Lot', 'Hautes-Pyrénées', 'Pyrénées-Orientales', 'Tarn', 'Tarn-et-Garonne', 'Occitanie'],
            'hauts-de-france': ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Calais', 'Villeneuve-d’Ascq', 'Saint-Quentin', 'Valenciennes', 'Arras', 'Boulogne-sur-Mer', 'Soissons', 'Compiègne', 'Maubeuge', 'Lens', 'Nord', 'Pas-de-Calais', 'Oise', 'Somme', 'Aisne', 'Hauts-de-France'],
            'provence-alpes-cote-d-azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Cannes', 'Antibes', 'La Seyne-sur-Mer', 'Hyères', 'Fréjus', 'Gap', 'Digne-les-Bains', 'Alpes-Maritimes', 'Bouches-du-Rhône', 'Hautes-Alpes', 'Alpes-de-Haute-Provence', 'Var', 'Vaucluse', 'Provence-Alpes-Côte d’Azur'],
            'bourgogne-franche-comte': ['Dijon', 'Besançon', 'Belfort', 'Chalon-sur-Saône', 'Nevers', 'Auxerre', 'Mâcon', 'Montbéliard', 'Sens', 'Saône-et-Loire', 'Yonne', 'Nièvre', 'Côte-d’Or', 'Doubs', 'Jura', 'Haute-Saône', 'Territoire de Belfort', 'Bourgogne', 'Franche-Comté'],
            'centre-val-de-loire': ['Tours', 'Orléans', 'Bourges', 'Blois', 'Châteauroux', 'Chartres', 'Dreux', 'Indre-et-Loire', 'Loiret', 'Cher', 'Eure-et-Loir', 'Indre', 'Loir-et-Cher', 'Centre-Val de Loire'],
            'grand-est': ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar', 'Troyes', 'Charleville-Mézières', 'Épinal', 'Bar-le-Duc', 'Haguenau', 'Saint-Dizier', 'Bas-Rhin', 'Haut-Rhin', 'Moselle', 'Meurthe-et-Moselle', 'Meuse', 'Ardennes', 'Aube', 'Marne', 'Haute-Marne', 'Vosges', 'Grand Est'],
            'normandie': ['Le Havre', 'Caen', 'Rouen', 'Cherbourg-en-Cotentin', 'Évreux', 'Dieppe', 'Alençon', 'Saint-Lô', 'Lisieux', 'Vernon', 'Calvados', 'Eure', 'Manche', 'Orne', 'Seine-Maritime', 'Normandie'],
            'pays-de-la-loire': ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Cholet', 'La Roche-sur-Yon', 'Laval', 'Saumur', 'Mayenne', 'Sarthe', 'Vendée', 'Loire-Atlantique', 'Maine-et-Loire', 'Pays de la Loire'],
            'bretagne': ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Fougères', 'Concarneau', 'Morbihan', 'Finistère', 'Côtes-d’Armor', 'Ille-et-Vilaine', 'Bretagne'],
            'corse': ['Ajaccio', 'Bastia', 'Corte', 'Sartène', 'Calvi', 'Porto-Vecchio', 'Corse-du-Sud', 'Haute-Corse', 'Corse'],
            'guadeloupe': ['Pointe-à-Pitre', 'Basse-Terre', 'Les Abymes', 'Le Gosier', 'Sainte-Anne', 'Baie-Mahault', 'Petit-Bourg', 'Guadeloupe'],
            'martinique': ['Fort-de-France', 'Le Lamentin', 'Le Robert', 'Schoelcher', 'Saint-Joseph', 'Ducos', 'Rivière-Salée', 'La Trinité', 'Martinique'],
            'guyane': ['Cayenne', 'Saint-Laurent-du-Maroni', 'Kourou', 'Matoury', 'Remire-Montjoly', 'Guyane'],
            'la-reunion': ['Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon', 'Saint-André', 'Saint-Louis', 'Le Port', 'La Réunion'],
            'mayotte': ['Mamoudzou', 'Koungou', 'Dzaoudzi', 'Dembeni', 'Bandraboua', 'Pamandzi', 'Mayotte']
          };
          for (const [key, values] of Object.entries(regionTerms)) {
            if (values.some(val => searchQuery.includes(val))) {
              regionForProspect = key;
              break;
            }
          }
        }
        const results = await this.performSearch(searchQuery);
        const analyzedResults = await this.analyzeWebsites(results, sector, regionForProspect);
        // Filtrer selon l'âge du site demandé
        const filteredResults = this.filterByWebsiteAge(analyzedResults, websiteAge);
        prospects.push(...filteredResults);
        // Limiter à 20 résultats par recherche pour éviter la surcharge
        if (prospects.length >= 20) break;
      } catch (error) {
        console.error('Erreur lors du scraping:', error);
      }
    }

    return prospects.slice(0, 50); // Limiter le total à 50 résultats
  }

  private buildSearchQueries(sector: string, region: string, query?: string): string[] {
    const sectorTerms = {
      'association': ['association', 'asso', 'club', 'organisation'],
      'restaurant': ['restaurant', 'bistrot', 'brasserie', 'café'],
      'commerce': ['magasin', 'boutique', 'commerce', 'shop'],
      'services': ['service', 'entreprise', 'société', 'cabinet'],
      'sante': ['cabinet médical', 'dentiste', 'médecin', 'clinique'],
      'education': ['école', 'formation', 'cours', 'enseignement']
    };

    const regionTerms = {
      'ile-de-france': ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Argenteuil', 'Montreuil', 'Nanterre', 'Créteil', 'Versailles', 'Île-de-France', '75', '77', '78', '91', '92', '93', '94', '95'],
      'auvergne-rhone-alpes': ['Lyon', 'Saint-Étienne', 'Grenoble', 'Villeurbanne', 'Clermont-Ferrand', 'Chambéry', 'Annecy', 'Valence', 'Roanne', 'Vénissieux', 'Rhône-Alpes', 'Auvergne', 'Puy-de-Dôme', 'Cantal', 'Allier', 'Haute-Loire', 'Ain', 'Ardèche', 'Drôme', 'Isère', 'Loire', 'Rhône', 'Savoie', 'Haute-Savoie'],
      'nouvelle-aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'Pau', 'La Rochelle', 'Mérignac', 'Pessac', 'Bayonne', 'Angoulême', 'Niort', 'Bergerac', 'Brive-la-Gaillarde', 'Biarritz', 'Gironde', 'Charente', 'Charente-Maritime', 'Corrèze', 'Creuse', 'Dordogne', 'Landes', 'Lot-et-Garonne', 'Pyrénées-Atlantiques', 'Deux-Sèvres', 'Vienne', 'Haute-Vienne', 'Nouvelle-Aquitaine'],
      'occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan', 'Béziers', 'Narbonne', 'Albi', 'Carcassonne', 'Montauban', 'Sète', 'Rodez', 'Tarbes', 'Colomiers', 'Muret', 'Blagnac', 'Castres', 'Hérault', 'Gard', 'Aude', 'Aveyron', 'Haute-Garonne', 'Gers', 'Lot', 'Hautes-Pyrénées', 'Pyrénées-Orientales', 'Tarn', 'Tarn-et-Garonne', 'Occitanie'],
      'hauts-de-france': ['Lille', 'Amiens', 'Roubaix', 'Tourcoing', 'Dunkerque', 'Calais', 'Villeneuve-d’Ascq', 'Saint-Quentin', 'Valenciennes', 'Arras', 'Boulogne-sur-Mer', 'Soissons', 'Compiègne', 'Maubeuge', 'Lens', 'Nord', 'Pas-de-Calais', 'Oise', 'Somme', 'Aisne', 'Hauts-de-France'],
      'provence-alpes-cote-d-azur': ['Marseille', 'Nice', 'Toulon', 'Aix-en-Provence', 'Avignon', 'Cannes', 'Antibes', 'La Seyne-sur-Mer', 'Hyères', 'Fréjus', 'Gap', 'Digne-les-Bains', 'Alpes-Maritimes', 'Bouches-du-Rhône', 'Hautes-Alpes', 'Alpes-de-Haute-Provence', 'Var', 'Vaucluse', 'Provence-Alpes-Côte d’Azur'],
      'bourgogne-franche-comte': ['Dijon', 'Besançon', 'Belfort', 'Chalon-sur-Saône', 'Nevers', 'Auxerre', 'Mâcon', 'Montbéliard', 'Sens', 'Saône-et-Loire', 'Yonne', 'Nièvre', 'Côte-d’Or', 'Doubs', 'Jura', 'Haute-Saône', 'Territoire de Belfort', 'Bourgogne', 'Franche-Comté'],
      'centre-val-de-loire': ['Tours', 'Orléans', 'Bourges', 'Blois', 'Châteauroux', 'Chartres', 'Dreux', 'Indre-et-Loire', 'Loiret', 'Cher', 'Eure-et-Loir', 'Indre', 'Loir-et-Cher', 'Centre-Val de Loire'],
      'grand-est': ['Strasbourg', 'Reims', 'Metz', 'Mulhouse', 'Nancy', 'Colmar', 'Troyes', 'Charleville-Mézières', 'Épinal', 'Bar-le-Duc', 'Haguenau', 'Saint-Dizier', 'Bas-Rhin', 'Haut-Rhin', 'Moselle', 'Meurthe-et-Moselle', 'Meuse', 'Ardennes', 'Aube', 'Marne', 'Haute-Marne', 'Vosges', 'Grand Est'],
      'normandie': ['Le Havre', 'Caen', 'Rouen', 'Cherbourg-en-Cotentin', 'Évreux', 'Dieppe', 'Alençon', 'Saint-Lô', 'Lisieux', 'Vernon', 'Calvados', 'Eure', 'Manche', 'Orne', 'Seine-Maritime', 'Normandie'],
      'pays-de-la-loire': ['Nantes', 'Angers', 'Le Mans', 'Saint-Nazaire', 'Cholet', 'La Roche-sur-Yon', 'Laval', 'Saumur', 'Mayenne', 'Sarthe', 'Vendée', 'Loire-Atlantique', 'Maine-et-Loire', 'Pays de la Loire'],
      'bretagne': ['Rennes', 'Brest', 'Quimper', 'Lorient', 'Vannes', 'Saint-Malo', 'Fougères', 'Concarneau', 'Morbihan', 'Finistère', 'Côtes-d’Armor', 'Ille-et-Vilaine', 'Bretagne'],
      'corse': ['Ajaccio', 'Bastia', 'Corte', 'Sartène', 'Calvi', 'Porto-Vecchio', 'Corse-du-Sud', 'Haute-Corse', 'Corse'],
      'guadeloupe': ['Pointe-à-Pitre', 'Basse-Terre', 'Les Abymes', 'Le Gosier', 'Sainte-Anne', 'Baie-Mahault', 'Petit-Bourg', 'Guadeloupe'],
      'martinique': ['Fort-de-France', 'Le Lamentin', 'Le Robert', 'Schoelcher', 'Saint-Joseph', 'Ducos', 'Rivière-Salée', 'La Trinité', 'Martinique'],
      'guyane': ['Cayenne', 'Saint-Laurent-du-Maroni', 'Kourou', 'Matoury', 'Remire-Montjoly', 'Guyane'],
      'la-reunion': ['Saint-Denis', 'Saint-Paul', 'Saint-Pierre', 'Le Tampon', 'Saint-André', 'Saint-Louis', 'Le Port', 'La Réunion'],
      'mayotte': ['Mamoudzou', 'Koungou', 'Dzaoudzi', 'Dembeni', 'Bandraboua', 'Pamandzi', 'Mayotte']
    };

    const queries: string[] = [];
    const sectors = sector === 'all' ? Object.keys(sectorTerms) : [sector];
    const regions = region === 'all' ? Object.keys(regionTerms) : [region];

    for (const s of sectors) {
      for (const r of regions) {
        const sectorWords = sectorTerms[s as keyof typeof sectorTerms] || [s];
        const regionWords = regionTerms[r as keyof typeof regionTerms] || [r];

        for (const sectorWord of sectorWords.slice(0, 2)) {
          for (const regionWord of regionWords.slice(0, 2)) {
            let searchQuery = `${sectorWord} ${regionWord}`;
            if (query) {
              searchQuery += ` ${query}`;
            }
            queries.push(searchQuery);
          }
        }
      }
    }

    return queries.slice(0, 10); // Limiter à 10 requêtes
  }

  private async performSearch(query: string): Promise<string[]> {
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX || process.env.GOOGLE_CX;
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      throw new Error('Google API Key ou CX manquant dans les variables d\'environnement');
    }
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Erreur lors de la requête Google Custom Search');
    const data = await res.json();
    if (!data.items) return [];
    const links = data.items.map((item: any) => item.link).filter((url: string) => !this.scrapedUrls.has(url));
    return links;
  }

  private async analyzeWebsites(urls: string[], sector: string, region: string): Promise<Prospect[]> {
    const prospects: Prospect[] = [];

    for (const url of urls) {
      if (this.scrapedUrls.has(url)) continue;
      try {
        const analysis = await this.analyzeWebsite(url);
        if (analysis) {
          prospects.push({
            id: crypto.randomUUID(),
            ...analysis,
            sector,
            region,
            status: 'new'
          });
          this.scrapedUrls.add(url);
        }
      } catch (error) {
        console.error(`Erreur analyse ${url}:`, error);
      }
    }

    return prospects;
  }

  private async analyzeWebsite(url: string): Promise<ScrapingResult | null> {
    try {
      // Simulation de l'analyse d'un site web
      // En production, utiliser Puppeteer ou Playwright pour scraper réellement
      
      const mockAnalysis = await this.simulateWebsiteAnalysis(url);
      return mockAnalysis;
    } catch (error) {
      console.error(`Impossible d'analyser ${url}:`, error);
      return null;
    }
  }

  private async simulateWebsiteAnalysis(url: string): Promise<ScrapingResult> {
    // Simulation d'une analyse de site web
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Variables inutilisées supprimées
    const websiteAge = Math.floor(Math.random() * 15) + 3;
    const designScore = Math.min(10, Math.max(1, 10 - Math.floor(websiteAge / 2) + Math.floor(Math.random() * 3)));

    const technicalIssues = this.detectTechnicalIssues(websiteAge, designScore);
    
    return {
      name: this.extractBusinessName(new URL(url).hostname),
      description: this.generateDescription(this.extractBusinessName(new URL(url).hostname), new URL(url).hostname),
      website: url,
      contact: this.extractContactInfo(new URL(url).hostname),
      technicalIssues,
      designScore,
      websiteAge
    };
  }

  private extractBusinessName(domain: string): string {
    const cleanDomain = domain.replace(/^www\./, '').replace(/\.(com|fr|org|net)$/, '');
    return cleanDomain
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private generateDescription(name: string, domain: string): string {
    const templates = [
      `${name} est une entreprise locale proposant des services de qualité à sa communauté.`,
      `Établissement ${name} offrant une expertise reconnue dans son domaine d'activité.`,
      `${name} accompagne ses clients avec professionnalisme et proximité depuis plusieurs années.`,
      `Structure ${name} dédiée à fournir des solutions adaptées aux besoins locaux.`
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private extractContactInfo(domain: string) {
    // Variables inutilisées supprimées
    const websiteAge = Math.floor(Math.random() * 15) + 3;
    const designScore = Math.min(10, Math.max(1, 10 - Math.floor(websiteAge / 2) + Math.floor(Math.random() * 3)));

    const technicalIssues = this.detectTechnicalIssues(websiteAge, designScore);
    
    return {
      email: `contact@${domain}`,
      phone: Math.random() > 0.3 ? this.generatePhoneNumber() : undefined,
      address: this.generateAddress()
    };
  }

  private generatePhoneNumber(): string {
    const numbers = [
      '01 42 85 67 43',
      '04 72 33 45 67',
      '05 56 78 90 12',
      '04 67 89 01 23',
      '03 20 45 67 89'
    ];
    return numbers[Math.floor(Math.random() * numbers.length)];
  }

  private generateAddress(): string {
    const addresses = [
      '15 rue de la République, 75001 Paris',
      '28 avenue Victor Hugo, 69002 Lyon',
      '42 place de la Mairie, 33000 Bordeaux',
      '7 boulevard des Arts, 34000 Montpellier',
      '123 rue du Commerce, 59000 Lille'
    ];
    return addresses[Math.floor(Math.random() * addresses.length)];
  }

  private detectTechnicalIssues(websiteAge: number, designScore: number): string[] {
    const allIssues = [
      'Design non-responsive',
      'Temps de chargement lent',
      'Contenu obsolète',
      'Certificat SSL manquant',
      'Technologies dépassées',
      'Navigation confuse',
      'Images de mauvaise qualité',
      'Informations de contact obsolètes',
      'Pas d\'optimisation mobile',
      'Problèmes d\'accessibilité',
      'Référencement défaillant',
      'Formulaires non fonctionnels'
    ];

    const issueCount = Math.min(
      Math.floor(websiteAge / 3) + Math.floor((10 - designScore) / 2),
      6
    );

    const selectedIssues = [];
    const shuffled = [...allIssues].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < issueCount && i < shuffled.length; i++) {
      selectedIssues.push(shuffled[i]);
    }

    return selectedIssues;
  }

  private filterByWebsiteAge(prospects: Prospect[], ageFilter: string): Prospect[] {
    if (ageFilter === 'all') return prospects;

    return prospects.filter(prospect => {
      switch (ageFilter) {
        case 'very-old':
          return prospect.websiteAge >= 8;
        case 'old':
          return prospect.websiteAge >= 5 && prospect.websiteAge < 8;
        case 'outdated':
          return prospect.websiteAge >= 3 && prospect.websiteAge < 5;
        default:
          return true;
      }
    });
  }

  getScrapedUrlsCount(): number {
    return this.scrapedUrls.size;
  }

  clearScrapedUrls(): void {
    this.scrapedUrls.clear();
  }
}

export const webScraperService = new WebScraperService();