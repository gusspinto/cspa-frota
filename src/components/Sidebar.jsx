import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Truck,
  BellRing,
  Wrench,
  ClipboardList,
  Fuel,
  Map,
  Users,
  Settings,
  Moon,
  Sun,
  LogOut,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import useAppStore from '../store/useAppStore'
import clsx from 'clsx'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
      { to: '/frota', label: 'Frota', icon: Truck },
      { to: '/alertas', label: 'Alertas', icon: BellRing, badge: 'alerts' },
    ],
  },
  {
    label: 'Manutenção',
    items: [
      { to: '/manutencoes', label: 'Manutenções', icon: Wrench },
      { to: '/pedidos', label: 'Pedidos', icon: ClipboardList, badge: 'pedidos' },
    ],
  },
  {
    label: 'Operações',
    items: [
      { to: '/combustivel', label: 'Combustível', icon: Fuel },
      { to: '/viagens', label: 'Viagens', icon: Map },
      { to: '/condutores', label: 'Condutores', icon: Users, badge: 'condutores' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/config', label: 'Configurações', icon: Settings },
    ],
  },
]

function NavItem({ item, alerts, pendingPedidos, expiringLicenses }) {
  const Icon = item.icon

  let badgeCount = 0
  if (item.badge === 'alerts') badgeCount = alerts.filter(a => a.severity === 'critical').length
  if (item.badge === 'pedidos') badgeCount = pendingPedidos
  if (item.badge === 'condutores') badgeCount = expiringLicenses

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-[#e8f5e9] text-[#1b4332] border-l-2 border-[#2d6a4f] pl-[10px]'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badgeCount > 0 && (
        <span className="bg-red-100 text-red-700 text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badgeCount}
        </span>
      )}
    </NavLink>
  )
}

export default function Sidebar({ onClose }) {
  const navigate = useNavigate()
  const { isDark, toggleDark, alerts, pedidos, condutores, currentUser } = useAppStore()

  const pendingPedidos = pedidos.filter((p) => p.estado === 'pendente' || p.estado === 'aberto').length
  const expiringLicenses = condutores.filter((c) => {
    if (!c.carta_validade) return false
    const days = Math.ceil((new Date(c.carta_validade) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 60
  }).length

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-[220px] shrink-0">
      {/* Brand area */}
      <div className="h-16 bg-[#1b4332] flex items-center gap-3 px-4 shrink-0">
        <img
          src="https://www.centrosocialareosa.pt/uploads/7/2/4/0/7240418/published/1453202777.png"
          alt="Logo CSA"
          className="h-8 w-8 object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
        <div>
          <div className="text-white text-sm font-semibold leading-tight">CSA Areosa</div>
          <div className="text-emerald-300 text-xs">Gestão de Frota</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-1">
              {section.label}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItem
                  key={item.to}
                  item={item}
                  alerts={alerts}
                  pendingPedidos={pendingPedidos}
                  expiringLicenses={expiringLicenses}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* User email */}
        {currentUser && (
          <div className="px-3 py-1.5">
            <div className="text-xs text-slate-400 truncate">{currentUser.email}</div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={16} />
          <span>Terminar sessão</span>
        </button>
      </div>
    </div>
  )
}
