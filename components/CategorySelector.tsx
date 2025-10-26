
import React from 'react';
import { Category } from '../types';

interface CategorySelectorProps {
  onSelectCategory: (category: Category) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelectCategory }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-center text-slate-700 mb-6">
        Elige una categoría para empezar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.values(Category).map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className="w-full text-lg font-medium text-white bg-sky-500 rounded-lg py-4 px-6 hover:bg-sky-600 focus:outline-none focus:ring-4 focus:ring-sky-300 transition-transform transform hover:scale-105 duration-200"
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySelector;
