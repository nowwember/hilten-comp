import { motion } from 'framer-motion';

export default function Home() {
  return (
    <>
      <motion.section
        className="hero-bg rounded-2xl p-10 sm:p-16 shadow-soft"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">Учитесь и преподавайте на современной платформе</h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">База задач, профиль прогресса и совместная онлайн‑доска — всё в одном месте.</p>
          <div className="mt-8 flex gap-3">
            <a href="/tasks" className="px-5 py-3 rounded-xl text-white gradient-accent shadow-soft">Перейти к задачам</a>
            <a href="/whiteboard" className="px-5 py-3 rounded-xl border hover:bg-slate-900/5 dark:hover:bg-white/5 transition">Открыть доску</a>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="mt-10 grid gap-4 sm:grid-cols-3"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      >
        {[
          ['База заданий', 'Подборки по темам и сложности'],
          ['Профиль', 'Отслеживайте прогресс'],
          ['Онлайн‑доска', 'Совместное решение задач']
        ].map(([title, desc]) => (
          <motion.div
            key={title}
            className="card border p-6 hover:shadow-soft transition"
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="text-sm text-slate-500">{title}</div>
            <div className="mt-1 font-medium">{desc}</div>
          </motion.div>
        ))}
      </motion.section>
    </>
  );
}
