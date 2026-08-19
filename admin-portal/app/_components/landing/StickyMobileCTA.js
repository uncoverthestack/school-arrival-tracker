import { RequestDemoButton } from '../RequestDemoButton'
import { RollingText } from '../RollingText'

// A bottom-anchored CTA bar, mobile only — thumb-reachable while scrolling,
// distinct from the fixed top navbar's Request Demo button which sits at the
// top of the screen out of easy reach on a tall page.
export function StickyMobileCTA() {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#101010]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <RequestDemoButton className="group flex w-full items-center justify-center rounded-full bg-[#1d6fc4] text-white px-6 py-3 text-sm font-semibold shadow-sm transition-colors hover:bg-[#1d6fc4]/90 active:scale-[0.97]">
        <RollingText>Request Demo</RollingText>
      </RequestDemoButton>
    </div>
  )
}
