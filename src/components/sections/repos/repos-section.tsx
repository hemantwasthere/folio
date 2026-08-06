import { getPinnedRepos } from "@/lib/github";

import Repos from "./repos";

/**
 * Server half of the code:work section. Sits behind a Suspense boundary in the
 * page so a slow GitHub response streams in late rather than blocking the rest
 * of the document.
 */
export default async function ReposSection() {
  return <Repos repos={await getPinnedRepos()} />;
}
