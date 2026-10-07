/** Resolve public assets for both local development and repository-subpath hosting. */
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`
