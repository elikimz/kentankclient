import { mkdir, writeFile } from 'node:fs/promises'

const site = 'https://kentankltkenya.online'
const api = process.env.VITE_API_URL || 'https://kentankapi.onrender.com'
const urls = [
  ['/', '1.0'],
  ['/collection', '0.9'],
  ['/about', '0.6'],
]
const fallbackProductSlugs = [
  '24000-litre-cylindrical-tank', '20000-litre-cylindrical-tank', '16000-litre-cylindrical-tank',
  '10000-litre-cylindrical-tank', '8000-litre-cylindrical-tank', '5000-litre-cylindrical-tank',
  '3500-litre-cylindrical-tank', '3000-litre-cylindrical-tank', '2000-litre-cylindrical-tank',
]
try {
  const response = await fetch(`${api}/api/products`, { signal: AbortSignal.timeout(8000) })
  if (response.ok) {
    const products = await response.json()
    for (const product of products.filter(product => product.published).slice(0, 500)) {
      urls.push([`/product/${encodeURIComponent(product.slug)}`, '0.8'])
    }
  }
} catch {
  console.warn('SEO sitemap: catalogue API unavailable; retaining the known published tank URLs.')
  for (const slug of fallbackProductSlugs) urls.push([`/product/${slug}`, '0.8'])
}
const lastmod = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([path, priority]) => `  <url><loc>${site}${path}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`).join('\n')}
</urlset>
`
await mkdir('public', { recursive: true })
await writeFile('public/sitemap.xml', xml)
