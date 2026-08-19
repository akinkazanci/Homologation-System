import { NextResponse } from 'next/server'
import { addCertificateAction, removeCertificateAction } from '@/lib/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Expect { productCode, cert }
    const res = await addCertificateAction(body)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), products: [] }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    // Expect { productCode, certId }
    const res = await removeCertificateAction(body)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), products: [] }, { status: 500 })
  }
}
