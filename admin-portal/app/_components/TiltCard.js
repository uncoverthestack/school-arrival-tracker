'use client'

import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// Cursor-following 3D tilt — classic "cinematic" card effect. Rotation is
// driven by pointer position relative to the card's own center, smoothed
// with a spring so it settles instead of snapping.
export function TiltCard({ children, className, tiltStrength = 10 }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 200, damping: 20, mass: 0.5 }
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [tiltStrength, -tiltStrength]), springConfig)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-tiltStrength, tiltStrength]), springConfig)
  const glowX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), springConfig)
  const glowY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig)

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  function handleMouseLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 800 }}
      className={`relative ${className ?? ''}`}
    >
      <motion.div
        aria-hidden="true"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([gx, gy]) => `radial-gradient(circle at ${gx}% ${gy}%, var(--c-primary) 0%, transparent 60%)`
          ),
          opacity: 0.12,
        }}
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      {children}
    </motion.div>
  )
}
