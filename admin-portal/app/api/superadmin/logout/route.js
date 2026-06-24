import { getSuperSession } from '@/lib/superSession'

export async function POST() {
  const session = await getSuperSession()
  session.destroy()
  return Response.json({ success: true })
}
