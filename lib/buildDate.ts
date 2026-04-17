/**
 * Stable build-time date for sitemap lastmod values.
 * 
 * Using new Date().toISOString() in sitemaps causes the lastmod to change on every request,
 * which Google interprets as a manipulation signal. Instead, we capture the date once at
 * module load time (build/start time) so it remains stable across requests within the same
 * deployment. It only changes when the app is redeployed, which is the correct behavior.
 */
export const BUILD_DATE = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
