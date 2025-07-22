import { Prospect } from '../types';

export const mockProspects: Prospect[] = [
  {
    id: '1',
    name: 'Association Les Amis du Quartier',
    description: 'Association de quartier organisant des événements communautaires et des activités pour les habitants.',
    website: 'https://amis-quartier-exemple.fr',
    websiteAge: 12,
    sector: 'association',
    region: 'ile-de-france',
    contact: {
      email: 'contact@amis-quartier-exemple.fr',
      phone: '01 42 85 67 43',
      address: '15 rue de la Mairie, 75011 Paris'
    },
    technicalIssues: ['Flash Player requis', 'Design non-responsive', 'Contenu obsolète'],
    designScore: 2,
    status: 'new'
  },
  {
    id: '2',
    name: 'Restaurant Le Petit Bistrot',
    description: 'Restaurant familial proposant une cuisine traditionnelle française dans une ambiance chaleureuse.',
    website: 'https://petit-bistrot-exemple.fr',
    websiteAge: 8,
    sector: 'restaurant',
    region: 'auvergne-rhone-alpes',
    contact: {
      email: 'info@petit-bistrot-exemple.fr',
      phone: '04 72 33 45 67',
      address: '28 place de la République, 69002 Lyon'
    },
    technicalIssues: ['Pas de menu en ligne', 'Photos de mauvaise qualité'],
    designScore: 4,
    status: 'contacted'
  },
  {
    id: '3',
    name: 'Cabinet Dentaire Dr. Martin',
    description: 'Cabinet dentaire moderne proposant des soins complets et des traitements esthétiques.',
    website: 'https://cabinet-martin-exemple.fr',
    websiteAge: 6,
    sector: 'sante',
    region: 'nouvelle-aquitaine',
    contact: {
      email: 'secretariat@cabinet-martin-exemple.fr',
      phone: '05 56 78 90 12',
      address: '42 cours Victor Hugo, 33000 Bordeaux'
    },
    technicalIssues: ['Pas de prise de rendez-vous en ligne', 'Certificat SSL expiré'],
    designScore: 5,
    status: 'interested'
  },
  {
    id: '4',
    name: 'École de Musique Harmony',
    description: 'École de musique proposant des cours pour tous âges et tous niveaux, du piano à la guitare.',
    website: 'https://ecole-harmony-exemple.fr',
    websiteAge: 10,
    sector: 'education',
    region: 'occitanie',
    contact: {
      email: 'contact@ecole-harmony-exemple.fr',
      phone: '04 67 89 01 23',
      address: '5 avenue des Arts, 34000 Montpellier'
    },
    technicalIssues: ['Site très lent', 'Informations de contact obsolètes', 'Design daté'],
    designScore: 3,
    status: 'new'
  },
  {
    id: '5',
    name: 'Garage Dupont Auto',
    description: 'Garage automobile familial spécialisé dans la réparation et l\'entretien de tous types de véhicules.',
    website: 'https://garage-dupont-exemple.fr',
    websiteAge: 7,
    sector: 'services',
    region: 'hauts-de-france',
    contact: {
      email: 'contact@garage-dupont-exemple.fr',
      phone: '03 20 45 67 89',
      address: '123 rue de l\'Industrie, 59000 Lille'
    },
    technicalIssues: ['Pas d\'informations sur les tarifs', 'Galerie photos manquante'],
    designScore: 4,
    status: 'rejected'
  },
  {
    id: '6',
    name: 'Librairie Le Coin Lecture',
    description: 'Librairie indépendante proposant un large choix de livres et organisant des événements littéraires.',
    website: 'https://coin-lecture-exemple.fr',
    websiteAge: 9,
    sector: 'commerce',
    region: 'ile-de-france',
    contact: {
      email: 'info@coin-lecture-exemple.fr',
      phone: '01 43 56 78 90',
      address: '67 rue des Livres, 75005 Paris'
    },
    technicalIssues: ['Catalogue en ligne obsolète', 'Pas de commande en ligne'],
    designScore: 3,
    status: 'converted'
  },
  {
    id: '7',
    name: 'Association Solidarité Seniors',
    description: 'Association d\'aide aux personnes âgées proposant des services d\'accompagnement et de soutien.',
    website: 'https://solidarite-seniors-exemple.fr',
    websiteAge: 11,
    sector: 'association',
    region: 'auvergne-rhone-alpes',
    contact: {
      email: 'contact@solidarite-seniors-exemple.fr',
      phone: '04 76 12 34 56',
      address: '89 avenue de la Solidarité, 38000 Grenoble'
    },
    technicalIssues: ['Site non accessible', 'Contenu non mis à jour', 'Problèmes de sécurité'],
    designScore: 2,
    status: 'new'
  },
  {
    id: '8',
    name: 'Boulangerie Artisanale Martin',
    description: 'Boulangerie traditionnelle proposant pains, viennoiseries et pâtisseries faits maison.',
    website: 'https://boulangerie-martin-exemple.fr',
    websiteAge: 5,
    sector: 'commerce',
    region: 'nouvelle-aquitaine',
    contact: {
      email: 'contact@boulangerie-martin-exemple.fr',
      address: '34 place du Marché, 33200 Coutras'
    },
    technicalIssues: ['Horaires non mis à jour', 'Pas de photos des produits'],
    designScore: 6,
    status: 'contacted'
  }
];