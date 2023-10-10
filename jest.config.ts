import type {Config} from 'jest';

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  preset: 'ts-jest', // Utiliser ts-jest pour prendre en charge TypeScript
  testEnvironment: 'node', // Exécuter les tests dans l'environnement Node.js
  testMatch: ['**/*.spec.ts'], // Modèle de fichiers de test
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // Extensions de fichiers à prendre en charge
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json', // Chemin vers le fichier de configuration TypeScript
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

export default config;
