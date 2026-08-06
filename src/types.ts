/**
 * Discord/Lanyard payload shapes are not redeclared here — `react-use-lanyard`
 * ships its own (`LanyardData`), and keeping a hand-rolled copy in sync with the
 * websocket contract is how they drift apart.
 */

export interface Repo {
  owner: string;
  repo: string;
  link: string;
  description: string;
  website: string;
  language: string;
  languageColor: string;
  stars: string;
  forks: string;
}
