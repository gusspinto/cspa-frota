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

function NavItem({ item, alerts, pendingPedidos, expiringLicenses, isDark }) {
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
            ? isDark
              ? 'bg-emerald-900/50 text-emerald-300 border-l-2 border-emerald-400 pl-[10px]'
              : 'bg-[#e8f5e9] text-[#1b4332] border-l-2 border-[#2d6a4f] pl-[10px]'
            : isDark
              ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        )
      }
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badgeCount > 0 && (
        <span className={clsx(
          'text-xs font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
          isDark ? 'bg-red-900/70 text-red-300' : 'bg-red-100 text-red-700'
        )}>
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
    <div className={clsx(
      'flex flex-col h-full w-[220px] shrink-0 border-r',
      isDark
        ? 'bg-slate-900 border-slate-700'
        : 'bg-white border-slate-200'
    )}>
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
            <div className={clsx(
              'text-[10px] font-semibold uppercase tracking-wider px-3 mb-1',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}>
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
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={clsx(
        'px-3 py-3 border-t space-y-1',
        isDark ? 'border-slate-700' : 'border-slate-100'
      )}>
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isDark
              ? 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
              : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* User email */}
        {currentUser && (
          <div className="px-3 py-1.5">
            <div className={clsx(
              'text-xs truncate',
              isDark ? 'text-slate-500' : 'text-slate-400'
            )}>
              {currentUser.email}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          <span>Terminar sessão</span>
        </button>
      </div>
    </div>
  )
}
