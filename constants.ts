
import { Category } from './types';

export const WORD_LISTS: Record<Category, string[]> = {
  [Category.House]: ['mesa', 'silla', 'cama', 'puerta', 'ventana', 'lámpara', 'sofá', 'reloj', 'casa', 'llave'],
  [Category.Food]: ['manzana', 'plátano', 'pan', 'leche', 'queso', 'huevo', 'arroz', 'pollo', 'agua', 'sopa'],
  [Category.Animals]: ['perro', 'gato', 'pájaro', 'pez', 'león', 'tigre', 'oso', 'elefante', 'vaca', 'cerdo'],
  [Category.Colors]: ['rojo', 'azul', 'verde', 'amarillo', 'naranja', 'morado', 'blanco', 'negro', 'rosa', 'marrón'],
};
