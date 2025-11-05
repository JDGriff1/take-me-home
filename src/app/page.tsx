import { ThemeToggle } from '@/components/ThemeToggle';
import TakeHomeCalculator from '@/components/TakeHomeCalculator';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-6 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Take Home Pay Calculator
          </h1>
          <ThemeToggle />
        </div>
        <main>
          <TakeHomeCalculator />
        </main>
      </div>
    </div>
  );
}
