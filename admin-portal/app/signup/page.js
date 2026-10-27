import { getRootDomain } from '@/lib/domain'
import { SignupForm } from './SignupForm'

export default async function SignupPage() {
  const rootDomain = await getRootDomain()
  return <SignupForm rootDomain={rootDomain} />
}
