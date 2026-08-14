import { redirect } from 'next/navigation'

// A v7 assumiu a /club em 14/08/2026. Esta rota vira redirect porque o link de
// preview já circulou (e os assets seguem em /public/club-v7).
export default function ClubV7Page() {
  redirect('/club')
}
