export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  topics: string[];
}

export interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GithubRepo[];
}
