export async function fetchProductsAction() {
  const res = await fetch('/api/products')
  if (!res.ok) return []
  return res.json()
}

export async function addProductAction(product: { code: string; family: string; description: string }) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  return res.json()
}

export async function removeProductAction(code: string) {
  const res = await fetch('/api/products', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  })
  return res.json()
}

export async function addCertificateAction(payload: { productCode: string; cert: any }) {
  const res = await fetch('/api/cert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function removeCertificateAction(payload: { productCode: string; certId: string }) {
  const res = await fetch('/api/cert', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export async function uploadCertificateFileAction(form: FormData) {
  const res = await fetch('/api/upload', { method: 'POST', body: form })
  return res.json()
}
