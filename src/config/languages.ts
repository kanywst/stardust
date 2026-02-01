export interface Language {
  name: string;
  color: string; // Hex color for the card accent
  query: string; // GitHub search query param (e.g. language:rust)
  icon?: string; // Optional icon name (Lucide)
}

export const languages: Language[] = [
  { name: 'Rust', color: '#dea584', query: 'language:rust' },
  { name: 'TypeScript', color: '#3178c6', query: 'language:typescript' },
  { name: 'Python', color: '#3572A5', query: 'language:python' },
  { name: 'Go', color: '#00ADD8', query: 'language:go' },
  { name: 'Mojo', color: '#ff5c5c', query: 'language:mojo' }, // 2026 AI trend
  { name: 'Swift', color: '#F05138', query: 'language:swift' },
  { name: 'Kotlin', color: '#A97BFF', query: 'language:kotlin' },
  { name: 'JavaScript', color: '#f1e05a', query: 'language:javascript' },
  { name: 'C++', color: '#f34b7d', query: 'language:cpp' },
  { name: 'Zig', color: '#ec915c', query: 'language:zig' },
];
