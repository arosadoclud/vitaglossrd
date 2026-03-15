import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'
import { useAuth } from '../context/AuthContext'
import AcademiaTab from '../components/academia/AcademiaTab'

export default function Academia() {
  useSEO({
    title: 'Academia VitaGloss RD – Entrena a tu equipo',
    description: 'Panel de capacitación exclusivo para el equipo VitaGloss RD. Videos, módulos y recursos para vender más.',
  })

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      {/* ── Barra superior ─────────────────────────────────────────────── */}
      <header className="bg-[#0a1628] sticky top-0 z-20 shadow-lg">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14 gap-4">
          {/* Back + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors"
            >
              <span className="text-base">←</span>
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="text-white/30 text-sm hidden sm:inline">/</span>
            <span className="text-white font-bold text-sm">🟢 Academia del Equipo</span>
          </div>

          {/* Usuario + logout */}
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-white/50 text-xs hidden sm:inline truncate max-w-[140px]">
                {user.nombre || user.email}
              </span>
            )}
            <button
              onClick={logout}
              className="text-white/50 hover:text-white/80 text-xs font-medium transition-colors px-2 py-1 rounded-lg hover:bg-white/10"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 pt-8 pb-16">
        <AcademiaTab onChangeTab={() => navigate('/dashboard')} />
      </main>
    </div>
  )
}
