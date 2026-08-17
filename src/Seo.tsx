import { useEffect } from 'react'

type SeoProduct = {
  id: number
  name: string
  slug: string
  capacity_litres: number
  category: string
  price: number
  original_price?: number
  discounted_price?: number
  note: string
  image_url?: string | null
  availability_status?: string
  published: boolean
}

type SeoProps = { view: string; products: SeoProduct[]; selected?: SeoProduct | null }

const SITE_URL = 'https://kentankltkenya.online'
const DEFAULT_TITLE = 'Kentank Kenya | Durable Water Tanks and Water Storage Solutions'
const DEFAULT_DESCRIPTION = 'Shop durable Kentank water tanks in Kenya for homes, farms, institutions, and businesses. Explore available capacities, prices, delivery guidance, and WhatsApp ordering.'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.content = content
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    document.head.appendChild(element)
  }
  element.href = href
}

function upsertJsonLd(id: string, value: unknown) {
  let element = document.head.querySelector(`script[data-seo="${id}"]`) as HTMLScriptElement | null
  if (!element) {
    element = document.createElement('script')
    element.type = 'application/ld+json'
    element.dataset.seo = id
    document.head.appendChild(element)
  }
  element.textContent = JSON.stringify(value)
}

export default function Seo({ view, products, selected }: SeoProps) {
  useEffect(() => {
    const page = view === 'catalogue'
      ? { title: 'Water Tanks Kenya | Kentank Collection', description: 'Browse Kentank water tanks by capacity, compare prices, and order durable water storage for Kenyan homes, farms, institutions, and businesses.', path: '/collection' }
      : view === 'about'
        ? { title: 'About Kentank Kenya | Water Storage Solutions', description: 'Learn about Kentank’s practical approach to durable, dependable water storage solutions made for Kenyan conditions.', path: '/about' }
        : view === 'account'
          ? { title: 'Customer Account | Kentank Kenya', description: 'Track your Kentank orders and manage your customer account securely.', path: '/account' }
          : view === 'product' && selected
            ? { title: `${selected.name} ${selected.capacity_litres.toLocaleString('en-KE')}L | Kentank Kenya`, description: `${selected.note}. View price, availability, specifications, and order this Kentank water tank in Kenya.`, path: `/product/${selected.slug}` }
            : { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION, path: '/' }
    const canonical = `${SITE_URL}${page.path}`
    document.title = page.title
    upsertMeta('name', 'description', page.description)
    upsertMeta('name', 'robots', view === 'account' ? 'noindex,follow' : 'index,follow')
    upsertMeta('property', 'og:type', 'website')
    upsertMeta('property', 'og:site_name', 'Kentank Kenya')
    upsertMeta('property', 'og:title', page.title)
    upsertMeta('property', 'og:description', page.description)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('property', 'og:locale', 'en_KE')
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', page.title)
    upsertMeta('name', 'twitter:description', page.description)
    upsertLink('canonical', canonical)

    const graph: Record<string, unknown>[] = [{
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Kentank Kenya',
      url: SITE_URL,
      logo: `${SITE_URL}/kentank-mark.png`,
      email: 'info@tankscompanyke.com',
      telephone: '+254750005313',
      areaServed: 'Kenya',
    }, {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Kentank Kenya',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-KE',
    }]
    if (view !== 'account') {
      graph.push({
        '@type': 'ItemList',
        '@id': `${canonical}#products`,
        name: 'Kentank water tanks',
        itemListElement: products.filter(product => product.published).slice(0, 12).map((product, index) => ({
          '@type': 'ListItem', position: index + 1, url: `${SITE_URL}/product/${product.slug}`, name: `${product.name} ${product.capacity_litres.toLocaleString('en-KE')}L`,
        })),
      })
    }
    if (selected) {
      const price = Number(selected.discounted_price ?? selected.price)
      graph.push({
        '@type': 'Product', name: `${selected.name} ${selected.capacity_litres.toLocaleString('en-KE')}L`, description: selected.note,
        sku: selected.slug, category: selected.category, image: selected.image_url ? [selected.image_url] : undefined,
        offers: { '@type': 'Offer', priceCurrency: 'KES', price, availability: selected.availability_status === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: `${SITE_URL}/product/${selected.slug}` },
      })
    }
    upsertJsonLd('site', { '@context': 'https://schema.org', '@graph': graph })
  }, [view, products, selected])
  return null
}
