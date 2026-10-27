import { getAdminSession } from './session'
import { getSuperSession } from './superSession'

/**
 * The API reference describes every school-scoped endpoint and its parameters, so it
 * is gated rather than public. Either a school admin or the platform super admin may
 * read it — a school needs it to integrate, and the super admin to support them.
 *
 * Both session cookies are checked independently; a super admin has no schoolId, and
 * a school admin is not a super admin.
 */
export async function hasDocsAccess() {
  const [admin, superAdmin] = await Promise.all([getAdminSession(), getSuperSession()])
  return Boolean(admin?.schoolId) || superAdmin?.isSuperAdmin === true
}
