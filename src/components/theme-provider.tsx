import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  forcedTheme?: Theme
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  forcedTheme = "dark",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remover classes existentes
    root.classList.remove("light", "dark")

    // Forçar sempre o tema escuro
    root.classList.add("dark")
    
    // Atualizar o atributo data-theme
    root.setAttribute("data-theme", "dark")
    
    // Garantir que o localStorage também mantenha o tema escuro
    localStorage.setItem("theme", "dark")
  }, [])

  const value = {
    theme: "dark",
    setTheme: (theme: Theme) => {
      // Ignorar tentativas de alteração
      // Manter sempre o tema escuro
      setTheme("dark")
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
} 