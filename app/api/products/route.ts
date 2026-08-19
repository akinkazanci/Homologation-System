import { NextResponse } from 'next/server'
import { fetchProductsAction, addProductAction, removeProductAction } from '@/lib/server'

export async function GET() {
  try {
    const products = await fetchProductsAction()
    return NextResponse.json(products)
  } catch (err) {
    return NextResponse.json([], { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Expect { code, family, description }
    const res = await addProductAction(body)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), products: [] }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    // Expect { code }
    const res = await removeProductAction(body.code)
    return NextResponse.json(res)
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err), products: [] }, { status: 500 })
  }
}
