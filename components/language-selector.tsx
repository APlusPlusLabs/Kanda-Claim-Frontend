"use client"

import { useLanguage, type Language } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage()

  const languages: { value: Language; label: string }[] = [
    { value: "en", label: t("language.en") },
    { value: "fr", label: t("language.fr") },
    { value: "rw", label: t("language.rw") },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
          <Globe className="h-4 w-4" />
          <span className="sr-only">{t("language.select")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => setLanguage(lang.value)}
            className={language === lang.value ? "bg-accent font-medium" : ""}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
