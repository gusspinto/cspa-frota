import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import useAppStore from '../store/useAppStore'
import clsx from 'clsx'

export default function Layout({ children }) {
  const { isDark } = useAppStore()

  return (
    <div
      className={clsx('flex h-screen overflow-hidden', isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]')}
      data-theme={isDark ? 'dark' : undefined}
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <MobileHeader />

        {/* Page content */}
        <main
          className={clsx(
            'flex-1 overflow-y-auto',
            isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
