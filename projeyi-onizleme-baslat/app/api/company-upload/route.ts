import { NextResponse } from 'next/server'
import { uploadCompanyCertificateFileAction, fetchCompanyCertificatesAction, removeCompanyCertificateAction } from '@/lib/server'

export async function POST(req: Request) {
  try {
    const form = await req.formData()
    const res = await uploadCompanyCertificateFileAction(form as any)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), result: null }, { status: 500 })
  }
}

export async function GET() {
  try {
    const certs = await fetchCompanyCertificatesAction()
    return NextResponse.json({ ok: true, data: certs })
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), data: {} }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const certId = body.certId as string
    if (!certId) {
      return NextResponse.json({ ok: false, error: "certId gerekli" }, { status: 400 })
    }
    const res = await removeCompanyCertificateAction(certId)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
