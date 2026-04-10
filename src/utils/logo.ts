const DSE_CDN = 'https://dse.co.tz/storage/securities';

// Track which symbols have already failed .jpg so we don't retry endlessly
const failedJpg = new Set<string>();
const failedPng = new Set<string>();

/**
 * Get company logo URL. Tries DSE CDN first.
 * Usage: <img src={getLogoUrl('CRDB')} onError={handleLogoError} />
 */
export function getLogoUrl(symbol: string, savedLogo?: string): string {
  // If the backend has a cached local path, use it via proxy
  if (savedLogo && savedLogo.startsWith('/logos/')) {
    return savedLogo;
  }

  // If .jpg already failed, try .png
  if (failedJpg.has(symbol)) {
    return `${DSE_CDN}/${symbol}/Logo/${symbol}.png`;
  }

  return `${DSE_CDN}/${symbol}/Logo/${symbol}.jpg`;
}

/**
 * Fallback handler for <img> onError:
 * 1st fail (.jpg) → retry with .png
 * 2nd fail (.png) → show initials fallback
 */
export function handleLogoError(e: React.SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  const src = img.src;

  // Extract symbol from the URL
  const match = src.match(/\/securities\/([^/]+)\/Logo\//);
  const symbol = match?.[1];

  if (symbol && !failedJpg.has(symbol)) {
    // First failure — .jpg didn't work, retry with .png
    failedJpg.add(symbol);
    img.src = `${DSE_CDN}/${symbol}/Logo/${symbol}.png`;
    return;
  }

  if (symbol && !failedPng.has(symbol)) {
    // Second failure — .png didn't work either, try lowercase
    failedPng.add(symbol);
    img.src = `${DSE_CDN}/${symbol}/Logo/${symbol.toLowerCase()}.png`;
    return;
  }

  // All retries exhausted — hide image, show initials fallback
  img.style.display = 'none';
  const fallback = img.nextElementSibling as HTMLElement | null;
  if (fallback) fallback.style.display = 'flex';
}
