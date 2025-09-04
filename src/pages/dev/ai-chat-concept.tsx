import React, { useState, useEffect } from 'react';
import AiDockChat, { Message } from '@/components/ai/AiDockChat';
import { BackLink } from '@/components/ui/BackLink';

// Примерные сообщения для демо
const demoMessages: Message[] = [
  {
    role: 'assistant',
    content: (
      <div>
        <p>Привет! Я помогу тебе разобраться с формулой Байеса.</p>
        <p className="mt-2">Формула Байеса выглядит так:</p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 my-2 font-mono text-sm">
          P(A|B) = P(B|A) × P(A) / P(B)
        </div>
        <p className="mt-2">Где:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><code className="bg-neutral-100 px-1 py-0.5 rounded text-sm">P(A|B)</code> — вероятность события A при условии B</li>
          <li><code className="bg-neutral-100 px-1 py-0.5 rounded text-sm">P(B|A)</code> — вероятность события B при условии A</li>
          <li><code className="bg-neutral-100 px-1 py-0.5 rounded text-sm">P(A)</code> — априорная вероятность события A</li>
          <li><code className="bg-neutral-100 px-1 py-0.5 rounded text-sm">P(B)</code> — полная вероятность события B</li>
        </ul>
      </div>
    ),
    delay: 500
  },
  {
    role: 'user',
    content: 'А как это применить на практике?',
    delay: 2000
  },
  {
    role: 'assistant',
    content: (
      <div>
        <p>Отличный вопрос! Давайте рассмотрим классический пример с медицинским тестом.</p>
        <p className="mt-2">Допустим, у нас есть:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Заболевание встречается у 1% населения</li>
          <li>Тест имеет точность 95% (5% ложных срабатываний)</li>
          <li>Человек получил положительный результат</li>
        </ul>
        <p className="mt-2">Какова вероятность, что он действительно болен?</p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 my-2 font-mono text-sm">
          P(болен|положительный) = P(положительный|болен) × P(болен) / P(положительный)
        </div>
        <p className="mt-2">Подставляем значения:</p>
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 my-2 font-mono text-sm">
          P(болен|положительный) = 0.95 × 0.01 / (0.95 × 0.01 + 0.05 × 0.99) ≈ 0.16
        </div>
        <p className="mt-2">Интересно, что даже с положительным тестом вероятность болезни всего 16%!</p>
      </div>
    ),
    delay: 3500
  }
];

export default function AiChatConceptPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [isTyping, setIsTyping] = useState(false);

  // Горячая клавиша ? для открытия/закрытия панели
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSend = (text: string) => {
    // Добавляем сообщение пользователя
    const userMessage: Message = {
      role: 'user',
      content: text
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Показываем typing индикатор
    setIsTyping(true);

    // Имитируем ответ ИИ через 1.1s
    setTimeout(() => {
      setIsTyping(false);
      
      const aiResponse: Message = {
        role: 'assistant',
        content: (
          <div>
            <p>Это демо-версия чата. В реальном приложении здесь был бы ответ от ИИ на основе контекста задачи.</p>
            <p className="mt-2">Ваш вопрос: "{text}"</p>
            <p className="mt-2">Ответ генерируется с помощью AI модели, обученной на математических задачах.</p>
          </div>
        )
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackLink href="/dev" />
          <h1 className="text-3xl font-bold text-gray-900 mt-4">AI Chat Concept Demo</h1>
          <p className="text-gray-600 mt-2">
            Демонстрация нового компонента чат-панели
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Нажмите ? для открытия/закрытия чата
            </span>
          </p>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto">
          {/* Task content */}
          <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Задача: Формула Байеса</h2>
            <div className="prose max-w-none">
              <p>
                Формула Байеса — это математическая формула, используемая для вычисления условных вероятностей. 
                Она позволяет обновлять наши представления о вероятности события на основе новой информации.
              </p>
              
              <h3>Формула:</h3>
              <div className="bg-gray-50 border rounded-lg p-4 font-mono text-center">
                P(A|B) = P(B|A) × P(A) / P(B)
              </div>
              
              <h3>Применение:</h3>
              <p>
                Формула Байеса широко используется в машинном обучении, медицинской диагностике, 
                спам-фильтрации и многих других областях, где нужно обновлять вероятности на основе новых данных.
              </p>
            </div>
          </div>

          {/* Answer section */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            <h3 className="text-xl font-semibold mb-4">Ваш ответ</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Введите ваш ответ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Проверить
                </button>
                <button
                  onClick={() => setIsOpen(true)}
                  className="px-6 py-3 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Объяснение от ИИ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Chat Panel */}
      <AiDockChat
        open={isOpen}
        onClose={() => setIsOpen(false)}
        minimized={isMinimized}
        onToggleMinimize={setIsMinimized}
        messages={messages}
        onSend={handleSend}
        isTyping={isTyping}
      />
    </div>
  );
}
