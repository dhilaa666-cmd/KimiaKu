/**
 * Konfigurasi Role-Based Access Control (RBAC) KimiaKu
 * Khusus verifikasi akses pendidik / Guru ke Panel Guru
 */

export const TEACHER_EMAILS = [
  "dhilaa666@gmail.com",
  "fadhilah.insyirah.2403316@students.um.ac.id"
]

/**
 * Memeriksa apakah pengguna berhak mengakses fitur dan halaman Guru (case-insensitive)
 * @param {import('firebase/auth').User | { email?: string } | null | undefined} user
 * @returns {boolean}
 */
export function checkIsTeacher(user) {
  if (!user || !user.email) return false
  const normalizedEmail = String(user.email).trim().toLowerCase()
  return TEACHER_EMAILS.some((teacherEmail) => teacherEmail.toLowerCase() === normalizedEmail)
}

