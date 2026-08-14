import { NextResponse } from 'next/server'
import { uploadCertificateFileAction } from '@/lib/server/actions'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const res = await uploadCertificateFileAction(form as any)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), products: [] }, { status: 500 })
  }
}
