import type React from "react"

interface LinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

const Link: React.FC<LinkProps> = ({ href, children, className }) => {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}

export default Link
