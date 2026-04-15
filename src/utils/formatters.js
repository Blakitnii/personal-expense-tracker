// Функція для гарного відображення дати
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = timestamp.toDate(); // Конвертуємо Firebase Timestamp у JS Date
  return date.toLocaleDateString('uk-UA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Функція для форматування валюти
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
  }).format(amount);
};