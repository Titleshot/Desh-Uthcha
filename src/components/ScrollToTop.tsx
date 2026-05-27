import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Reset scroll when the route changes (SPA default keeps previous scroll position). */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
