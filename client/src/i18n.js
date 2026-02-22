import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "cat_all": "All", "cat_main": "Main", "cat_sushi": "Sushi", "cat_drinks": "Drinks", "cat_dessert": "Dessert", "cat_starters": "Starters",
      "loading": "Loading Menu...",
      "welcome": "Welcome to Uder",
      "scan_prompt": "Please scan a table's QR code to view the menu.",
      "no_items": "No items found in",
      "add_to_order": "Add to Order",
      "ask_waiter": "Ask a waiter to order",
      "checkout": "Checkout",
      "view_order": "View Order",
      "order_summary": "Order Summary",
      "total": "Total",
      "table_number": "Table Number",
      "place_order": "Place Order",
      "sending_order": "Sending Order...",
      "clear_cart": "Clear current order?",
      "remove": "Remove"
    }
  },
  he: {
    translation: {
      "cat_all": "הכל", "cat_main": "עיקריות", "cat_sushi": "סושי", "cat_drinks": "שתייה", "cat_dessert": "קינוחים", "cat_starters": "ראשונות",
      "loading": "טוען תפריט...",
      "welcome": "ברוכים הבאים ל-Uder",
      "scan_prompt": "אנא סרוק את קוד ה-QR של השולחן כדי לראות את התפריט.",
      "no_items": "לא נמצאו פריטים ב",
      "add_to_order": "הוסף להזמנה",
      "ask_waiter": "בקש ממלצר להזמין",
      "checkout": "קופה",
      "view_order": "צפה בהזמנה",
      "order_summary": "סיכום הזמנה",
      "total": "סה״כ",
      "table_number": "מספר שולחן",
      "place_order": "בצע הזמנה",
      "sending_order": "שולח הזמנה...",
      "clear_cart": "לרוקן את ההזמנה הנוכחית?",
      "remove": "הסר"
    }
  },
  ru: {
    translation: {
      "cat_all": "Все", "cat_main": "Основные", "cat_sushi": "Суши", "cat_drinks": "Напитки", "cat_dessert": "Десерты", "cat_starters": "Закуски",
      "loading": "Загрузка меню...",
      "welcome": "Добро пожаловать в Uder",
      "scan_prompt": "Пожалуйста, отсканируйте QR-код стола, чтобы просмотреть меню.",
      "no_items": "Нет товаров в",
      "add_to_order": "Добавить в заказ",
      "ask_waiter": "Попросите официанта заказать",
      "checkout": "Оформление заказа",
      "view_order": "Посмотреть заказ",
      "order_summary": "Сводка заказа",
      "total": "Итого",
      "table_number": "Номер стола",
      "place_order": "Разместить заказ",
      "sending_order": "Отправка заказа...",
      "clear_cart": "Очистить текущий заказ?",
      "remove": "Удалить"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;