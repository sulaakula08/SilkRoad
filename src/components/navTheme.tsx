import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

/**
 * The nav sits transparently over whatever is at the top of the page. Hero and
 * Outcome are Oxford Blue; the intake pages are Snow Drift. Sections declare
 * their own ground so the nav can invert instead of guessing from the route.
 */
const Ctx = createContext<{
  overDark: boolean
  setOverDark: (v: boolean) => void
}>({ overDark: false, setOverDark: () => {} })

export function NavThemeProvider({ children }: { children: ReactNode }) {
  const [overDark, setOverDark] = useState(false)
  const value = useMemo(() => ({ overDark, setOverDark }), [overDark])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useNavTheme = () => useContext(Ctx)

/** Call from any section that renders on a dark ground at the top of a page. */
export function useDarkNav() {
  const { setOverDark } = useContext(Ctx)
  useEffect(() => {
    setOverDark(true)
    return () => setOverDark(false)
  }, [setOverDark])
}
