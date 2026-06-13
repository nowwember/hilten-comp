import { motion } from 'framer-motion';
import FloatingMathShapes from '@/components/ui/FloatingMathShapes';

/* ─── Секция: Hero ─── */
function HeroSection() {
  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden">
      <FloatingMathShapes density="full" cursors />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Eyebrow */}
          <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--line-2)', color: 'var(--ink-soft)' }}>
            ПОДГОТОВКА К ОГЭ И ЕГЭ
          </span>

          {/* H1 */}
          <h1 className="mt-6 font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]" style={{ color: 'var(--ink)' }}>
            Решайте задачи <span className="grad-text">вместе</span>
          </h1>

          {/* Подзаголовок */}
          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: 'var(--ink-soft)' }}>
            Большая база задач ОГЭ и ЕГЭ, отслеживание прогресса по темам и общая
            онлайн-доска, где можно решать вместе с репетитором в реальном времени
          </p>

          {/* CTA кнопки */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a href="/tasks" className="btn-primary inline-block rounded-full px-8 py-3 font-medium transition-transform hover:scale-[1.03]">
              Перейти к задачам →
            </a>
            <a href="/whiteboard" className="btn-ghost inline-block rounded-full px-8 py-3 font-medium transition-colors hover:bg-[var(--paper-2)]">
              Открыть доску
            </a>
          </div>

          {/* Мета-строка */}
          <p className="mt-6 font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>
            1200+ задач · ОГЭ·ЕГЭ · live-доска
          </p>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Секция: фичи ─── */
function FeatureCards() {
  const features = [
    {
      eyebrow: 'БАЗА',
      icon: '∑',
      title: 'База задач',
      text: 'Подборки по темам и сложности — от базовых до олимпиадных',
    },
    {
      eyebrow: 'ПРОГРЕСС',
      icon: '📊',
      title: 'Прогресс',
      text: 'Отслеживайте решённые задачи и слабые места по темам',
    },
    {
      eyebrow: 'ДОСКА·LIVE',
      icon: '🖊',
      title: 'Доска',
      text: 'Совместное решение задач в реальном времени',
    },
  ];

  return (
    <motion.section
      className="relative max-w-6xl mx-auto px-4 py-20"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map(({ eyebrow, icon, title, text }) => (
          <motion.div
            key={title}
            className="rounded-2xl p-6 transition-all duration-200 cursor-default"
            style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -4, borderColor: 'var(--line-2)' }}
            transition={{ duration: 0.2 }}
          >
            <span className="badge" style={{ background: 'var(--paper-2)', color: 'var(--ink-soft)' }}>
              {eyebrow}
            </span>
            <div
              className="mt-4 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: 'var(--paper-2)', color: 'var(--red)' }}
            >
              {icon}
            </div>
            <h3 className="mt-4 font-display text-xl font-bold" style={{ color: 'var(--ink)' }}>
              {title}
            </h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--ink-soft)' }}>
              {text}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* ─── Главная страница ─── */
export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureCards />
    </>
  );
}
