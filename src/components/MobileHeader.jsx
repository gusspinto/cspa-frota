import { useState } from 'react'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import Sidebar from './Sidebar'
import clsx from 'clsx'

export default function MobileHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { isDark, toggleDark } = useAppStore()
  const navigate = useNavigate()

  return (
    <>
      <header className={clsx(
        'h-14 flex items-center justify-between px-4 lg:hidden shrink-0 border-b',
        isDark
          ? 'bg-slate-900 border-slate-700'
          : 'bg-white border-slate-200'
      )}>
        <button
          onClick={() => setDrawerOpen(true)}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <img
            src="https://www.centrosocialareosa.pt/uploads/7/2/4/0/7240418/published/1453202777.png"
            alt="Logo"
            className="h-7 w-7 object-contain"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className={clsx(
            'text-sm font-semibold',
            isDark ? 'text-slate-100' : 'text-slate-900'
          )}>
            CSA Areosa
          </span>
        </div>
        <button
          onClick={toggleDark}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            isDark ? 'text-slate-400 hover:bg-slate-700/50' : 'text-slate-600 hover:bg-slate-100'
          )}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex">
            <Sidebar onClose={() => setDrawerOpen(false)} />
            <button
              className={clsx(
                'ml-2 mt-2 p-2 rounded-lg shadow self-start',
                isDark ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'
              )}
              onClick={() => setDrawerOpen(false)}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
