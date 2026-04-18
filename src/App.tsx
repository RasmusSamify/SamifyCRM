import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useEffect } from 'react'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/routes/router'
import { useThemeStore } from '@/stores/theme'
import { useAuthBootstrap } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/Toaster'

function AuthBoot() {
  useAuthBootstrap()
  return null
}

export default function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBoot />
      <RouterProvider router={router} />
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  )
}
