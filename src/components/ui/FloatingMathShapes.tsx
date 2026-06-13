import { motion, useReducedMotion } from 'framer-motion'

type Props = { density?: 'full' | 'subtle'; cursors?: boolean; className?: string }

export default function FloatingMathShapes({ density = 'full', cursors = true, className = '' }: Props) {
  const reduce = useReducedMotion()
  const floaty = (d: number, delay = 0) =>
    reduce ? {} : { animate: { y: [0, -14, 0] }, transition: { duration: d, repeat: Infinity, ease: 'easeInOut' as const, delay } }
  const drift = (d: number, delay = 0) =>
    reduce ? {} : { animate: { x: [0, 9, 0], y: [0, -11, 0] }, transition: { duration: d, repeat: Infinity, ease: 'easeInOut' as const, delay } }

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} style={{ zIndex: 0 }}>
      <div className="grid-bg absolute inset-0" style={{
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 30% 40%, #000 30%, transparent 85%)',
        maskImage: 'radial-gradient(ellipse 90% 80% at 30% 40%, #000 30%, transparent 85%)',
      }} />

      {/* parabola */}
      <motion.svg {...floaty(9)} className="absolute" style={{ right: '6%', top: '14%' }} width="240" height="160" viewBox="0 0 240 160" fill="none">
        <path d="M12 140 Q120 -16 228 140" stroke="url(#fms-g)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="70" cy="64" r="6" fill="var(--surface)" stroke="var(--red)" strokeWidth="3" />
        <circle cx="170" cy="64" r="6" fill="var(--surface)" stroke="var(--amber-deep)" strokeWidth="3" />
        <defs><linearGradient id="fms-g" x1="0" x2="240"><stop stopColor="#E63E2B" /><stop offset="1" stopColor="#F5A524" /></linearGradient></defs>
      </motion.svg>

      {/* triangle */}
      <motion.svg {...floaty(11, 0.5)} className="absolute" style={{ right: '28%', bottom: '12%' }} width="110" height="110" viewBox="0 0 110 110" fill="none">
        <polygon points="18,92 92,92 18,28" fill="rgba(245,165,36,.1)" stroke="var(--amber-deep)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M18 76 h16 v16" stroke="var(--amber-deep)" strokeWidth="2" fill="none" />
      </motion.svg>

      {/* circle + radius */}
      <motion.svg {...drift(12)} className="absolute" style={{ right: '2%', bottom: '18%' }} width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="42" stroke="var(--red)" strokeWidth="2.5" fill="rgba(230,62,43,.06)" />
        <line x1="60" y1="60" x2="102" y2="60" stroke="var(--red)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="3" fill="var(--red)" />
      </motion.svg>

      {density === 'full' && (
        <>
          <motion.span {...drift(12, 0.4)} className="absolute font-display select-none" style={{ left: '40%', bottom: '6%', fontSize: 110, opacity: 0.1, color: 'var(--ink)' }}>π</motion.span>
          <span className="absolute font-display select-none" style={{ right: '40%', top: '4%', fontSize: 72, opacity: 0.1, color: 'var(--ink)' }}>√x</span>
          <motion.span {...floaty(11, 0.5)} className="absolute font-display select-none" style={{ right: '14%', top: '46%', fontSize: 60, opacity: 0.1, color: 'var(--ink)' }}>∫</motion.span>
        </>
      )}

      {cursors && (
        <>
          <motion.div {...drift(12)} className="absolute flex items-start" style={{ right: '24%', top: '30%' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="var(--red)"><path d="M2 2 L2 16 L6 12 L9 18 L11 17 L8 11 L14 11 Z" /></svg>
            <span className="font-mono text-white" style={{ fontSize: 11, padding: '3px 8px', borderRadius: '0 9px 9px 9px', marginTop: 13, background: 'var(--red)', whiteSpace: 'nowrap' }}>Аня</span>
          </motion.div>
          <motion.div {...floaty(9)} className="absolute flex items-start" style={{ right: '9%', top: '54%' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill="var(--amber-deep)"><path d="M2 2 L2 16 L6 12 L9 18 L11 17 L8 11 L14 11 Z" /></svg>
            <span className="font-mono text-white" style={{ fontSize: 11, padding: '3px 8px', borderRadius: '0 9px 9px 9px', marginTop: 13, background: 'var(--amber-deep)', whiteSpace: 'nowrap' }}>Репетитор</span>
          </motion.div>
        </>
      )}
    </div>
  )
}
