from pathlib import Path

path = Path('/home/ubuntu/kentankclient/src/App.tsx')
text = path.read_text()
start = text.index('    {selected &&')
end = text.index('    <div className="scroll-marker"', start)
text = text[:start] + '    {selected && <ProductDetails product={selected} api={API} business={business} onClose={() => setSelected(null)} />}\n' + text[end:]
component = r'''
function ProductDetails({ product, api, business, onClose }: { product: Product; api: string; business: Business; onClose: () => void }) {
  const [detail, setDetail] = useState<Product>(product)
  const [activeImage, setActiveImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || '')
  const [detailLoading, setDetailLoading] = useState(true)
  const [detailError, setDetailError] = useState('')
  useEffect(() => { let mounted = true; fetch(`${api}/api/products/${product.slug}`).then(response => { if (!response.ok) throw new Error('Unable to load product details'); return response.json() }).then(result => { if (mounted) { setDetail(result); setSelectedVariant(result.variants?.[0] || '') } }).catch(() => mounted && setDetailError('Some product details could not be loaded.')).finally(() => mounted && setDetailLoading(false)); return () => { mounted = false } }, [api, product.slug])
  const gallery = (detail.images?.length ? detail.images.map(image => image.image_url) : []).concat(detail.image_url ? [detail.image_url] : []).filter((url, index, all) => Boolean(url) && all.indexOf(url) === index)
  const image = gallery[activeImage] || hero
  const specs = Object.entries(detail.specifications || {})
  const whatsappMessage = `Hello, I would like to order ${detail.name}. Capacity: ${capacity(detail.capacity_litres)}. Price: ${money(Number(detail.price))}.${selectedVariant ? ` Colour/variant: ${selectedVariant}.` : ''}`
  return <div className="modal-backdrop" onClick={onClose}><article className="product-detail-modal" onClick={event => event.stopPropagation()}><button className="modal-close" onClick={onClose} aria-label="Close product details">×</button><div className="product-gallery"><div className="gallery-main"><img src={image} alt={detail.images?.[activeImage]?.alt_text || detail.name} />{gallery.length > 1 && <><button className="gallery-arrow gallery-prev" onClick={() => setActiveImage((activeImage - 1 + gallery.length) % gallery.length)} aria-label="Previous image">‹</button><button className="gallery-arrow gallery-next" onClick={() => setActiveImage((activeImage + 1) % gallery.length)} aria-label="Next image">›</button></>}</div>{gallery.length > 1 && <div className="gallery-thumbnails">{gallery.map((url, index) => <button key={url} className={index === activeImage ? 'active' : ''} onClick={() => setActiveImage(index)}><img src={url} alt={`${detail.name} view ${index + 1}`} /></button>)}</div>}</div><div className="product-detail-copy"><p className="eyebrow">{detail.category} · {detail.availability_status || 'Available'}</p><h2>{detail.name}<br /><em>{capacity(detail.capacity_litres)}</em></h2><div className="detail-price">{money(Number(detail.price))} <small>indicative price</small></div><p className="detail-description">{detail.note}</p>{detailError && <div className="error-note">{detailError}</div>}{detailLoading ? <div className="detail-loading"><Spinner label="Loading full details…" /></div> : <>{detail.variants?.length ? <div className="variant-group"><span className="detail-label">Available colours / variants</span><div className="variant-options">{detail.variants.map(variant => <button key={variant} className={variant === selectedVariant ? 'selected' : ''} onClick={() => setSelectedVariant(variant)}>{variant}</button>)}</div></div> : null}{specs.length ? <div className="specification-list"><span className="detail-label">Specifications</span>{specs.map(([key, value]) => <div key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{String(value)}</strong></div>)}</div> : <div className="specification-list"><span className="detail-label">Product information</span><div><span>Capacity</span><strong>{capacity(detail.capacity_litres)}</strong></div><div><span>Availability</span><strong>{detail.availability_status || 'In stock'}</strong></div></div>}</>}{!detailLoading && <a className="primary-button whatsapp-order" target="_blank" rel="noreferrer" href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappMessage)}`}>Order on WhatsApp <span>↗</span></a>}<p className="detail-note">Message the Kentank team for delivery, installation, and current availability.</p></div></article></div>
}
'''
marker = 'function CustomerAccount'
text = text.replace(marker, component + '\n' + marker, 1)
path.write_text(text)
