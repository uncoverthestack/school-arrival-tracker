// Two stacked copies of the same label: the visible one slides up and out on
// hover while the duplicate slides up into place. Needs a `group` class on
// the ancestor button/link — clipping is self-contained, no overflow-hidden
// needed on the parent.
export function RollingText({ children }) {
  return (
    <span className="relative block h-5 overflow-hidden">
      <span className="block transition-transform duration-300 group-hover:-translate-y-full">{children}</span>
      <span className="absolute inset-0 block translate-y-full transition-transform duration-300 group-hover:translate-y-0">{children}</span>
    </span>
  )
}
