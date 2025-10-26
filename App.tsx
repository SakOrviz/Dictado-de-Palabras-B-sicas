
import React, { useState } from 'react';
import { Category } from './types';
import CategorySelector from './components/CategorySelector';
import DictationView from './components/DictationView';

const App: React.FC = () => {
  const [category, setCategory] = useState<Category | null>(null);

  const handleSelectCategory = (selectedCategory: Category) => {
    setCategory(selectedCategory);
  };

  const handleReturnToMenu = () => {
    setCategory(null);
  };

  return (
    <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-sky-800">
            Práctica de Dictado
          </h1>
          <p className="text-sky-600 mt-2 text-lg">
            ¡Escucha la palabra y escríbela!
          </p>
        </header>
        <main className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {!category ? (
            <CategorySelector onSelectCategory={handleSelectCategory} />
          ) : (
            <DictationView
              category={category}
              onFinish={handleReturnToMenu}
            />
          )}
        </main>
        <footer className="text-center mt-8 text-slate-500">
            <p>Hecho con ❤️ para aprender a escribir.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
