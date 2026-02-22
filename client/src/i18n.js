import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "cat_all": "All", "cat_main": "Main", "cat_sushi": "Sushi", "cat_drinks": "Drinks", "cat_dessert": "Dessert", "cat_starters": "Starters",
      "loading": "Loading...", "welcome": "Welcome to Uder", "scan_prompt": "Please scan a table's QR code to view the menu.",
      "no_items": "No items found in", "add_to_order": "Add to Order", "ask_waiter": "Ask a waiter to order",
      "checkout": "Checkout", "view_order": "View Order", "order_summary": "Order Summary", "total": "Total",
      "table_number": "Table Number", "place_order": "Place Order", "sending_order": "Sending Order...",
      "clear_cart": "Clear current order?", "remove": "Remove",
      
      "kitchen_display": "Kitchen Display", "live_service_monitor": "Live Service Monitor", "active_orders": "Active Orders",
      "inbound_orders": "Inbound Orders", "start_prep": "Start Prep", "preparing": "Preparing", "mark_ready": "Mark Ready",
      "ready_for_pickup": "Ready for Pickup", "order_served": "Order Served", "all_clear": "All Clear", "loading_system": "Loading System...",
      
      "my_station": "My Station", "select_tables_msg": "Select tables to manage orders and alerts.", "recent_alerts": "Recent Alerts",
      "no_recent_activity": "No recent activity.", "ack": "Ack", "kitchen_progress": "Kitchen Progress", "no_active_orders": "No active orders for your tables.",
      "items": "items", "pending": "pending", "ready": "ready", "served": "served", "active": "Active", "my_station_click": "My Station (Click to subscribe)",
      "only_receive_alerts": "* You will only receive alerts for the highlighted tables. This setting is saved to this device.",
      
      "table_qr_mgmt": "Table & QR Management", "manage_floor_plan": "Manage floor plan and generate QR codes for customers.",
      "add_new_table": "Add New Table", "edit_table": "Edit Table", "capacity": "Capacity", "status": "Status",
      "available_green": "Available (Green)", "occupied_red": "Occupied (Red)", "reserved_yellow": "Reserved (Yellow)",
      "save_changes": "Save Changes", "add_table": "Add Table", "cancel_edit": "Cancel Edit", "floor_plan_qr": "Floor Plan & QR Codes",
      "real_time_active": "Real-time updates active 🟢", "edit": "Edit", "delete": "Delete", "no_tables_yet": "No tables created yet. Add your first table using the panel!",
      
      "add_new_staff": "Add New Staff Member", "name": "Name", "email": "Email", "password": "Password",
      "waiter_staff": "Waiter (Staff)", "kitchen_role": "Kitchen", "create_user": "Create User",
      
      "staff_login": "Staff Login", "sign_in": "Sign In", "dont_have_account": "Don't have an account?", "register_now": "Register now!",

      "menu_manager": "Menu Manager", "edit_dish": "Edit Dish", "add_new_dish": "Add New Dish",
      "dish_name": "Dish Name", "price_ils": "Price (₪)", "description": "Description", 
      "ingredients_comma": "Ingredients (comma separated)", "allergens_label": "Allergens:",
      "update_dish": "Update Dish", "add_to_menu": "Add to Menu", "cancel": "Cancel",
      "available_caps": "AVAILABLE", "sold_out_caps": "SOLD OUT", "delete_confirm": "Delete this dish completely?",

      // --- NEW: NAVBAR TRANSLATIONS ---
      "nav_menu": "Menu", "nav_kitchen": "Kitchen", "nav_menu_mgr": "Menu Mgr", "nav_my_station": "My Station",
      "nav_tables": "Tables", "nav_staff": "Staff", "nav_login": "Login", "nav_logout": "Logout",

      // --- NEW: ALLERGEN TRANSLATIONS ---
      "allergen_lactose": "Lactose", "allergen_gluten": "Gluten", "allergen_shellfish": "Shellfish", 
      "allergen_peanut": "Peanut", "allergen_nuts": "Nuts", "allergen_soy": "Soy", 
      "allergen_eggs": "Eggs", "allergen_fish": "Fish", "allergen_sesame": "Sesame"
    }
  },
  he: {
    translation: {
      "cat_all": "הכל", "cat_main": "עיקריות", "cat_sushi": "סושי", "cat_drinks": "שתייה", "cat_dessert": "קינוחים", "cat_starters": "ראשונות",
      "loading": "טוען...", "welcome": "ברוכים הבאים ל-Uder", "scan_prompt": "אנא סרוק את קוד ה-QR של השולחן.",
      "no_items": "לא נמצאו פריטים ב", "add_to_order": "הוסף להזמנה", "ask_waiter": "בקש ממלצר להזמין",
      "checkout": "קופה", "view_order": "צפה בהזמנה", "order_summary": "סיכום הזמנה", "total": "סה״כ",
      "table_number": "מספר שולחן", "place_order": "בצע הזמנה", "sending_order": "שולח הזמנה...",
      "clear_cart": "לרוקן את ההזמנה?", "remove": "הסר",
      
      "kitchen_display": "תצוגת מטבח", "live_service_monitor": "מעקב שירות חי", "active_orders": "הזמנות פעילות",
      "inbound_orders": "הזמנות נכנסות", "start_prep": "התחל הכנה", "preparing": "בהכנה", "mark_ready": "סמן כמוכן",
      "ready_for_pickup": "מוכן לאיסוף", "order_served": "הוגש", "all_clear": "הכל נקי", "loading_system": "טוען מערכת...",
      
      "my_station": "העמדה שלי", "select_tables_msg": "בחר שולחנות לניהול הזמנות והתראות.", "recent_alerts": "התראות אחרונות",
      "no_recent_activity": "אין פעילות אחרונה.", "ack": "אשר", "kitchen_progress": "התקדמות מטבח", "no_active_orders": "אין הזמנות פעילות.",
      "items": "פריטים", "pending": "ממתין", "ready": "מוכן", "served": "הוגש", "active": "פעיל", "my_station_click": "העמדה שלי (לחץ להרשמה)",
      "only_receive_alerts": "* תקבל התראות רק עבור שולחנות מודגשים. נשמר במכשיר זה.",
      
      "table_qr_mgmt": "ניהול שולחנות וקיו-אר", "manage_floor_plan": "נהל מפת שולחנות וייצר קודים ללקוחות.",
      "add_new_table": "הוסף שולחן חדש", "edit_table": "ערוך שולחן", "capacity": "תפוסה", "status": "סטטוס",
      "available_green": "פנוי (ירוק)", "occupied_red": "תפוס (אדום)", "reserved_yellow": "שמור (צהוב)",
      "save_changes": "שמור שינויים", "add_table": "הוסף שולחן", "cancel_edit": "בטל עריכה", "floor_plan_qr": "מפת שולחנות",
      "real_time_active": "עדכונים חיים פעילים 🟢", "edit": "ערוך", "delete": "מחק", "no_tables_yet": "לא נוצרו שולחנות עדיין.",
      
      "add_new_staff": "הוסף חבר צוות חדש", "name": "שם", "email": "אימייל", "password": "סיסמה",
      "waiter_staff": "מלצר (צוות)", "kitchen_role": "מטבח", "create_user": "צור משתמש",
      
      "staff_login": "התחברות צוות", "sign_in": "היכנס", "dont_have_account": "אין לך חשבון?", "register_now": "הירשם עכשיו!",

      "menu_manager": "ניהול תפריט", "edit_dish": "ערוך מנה", "add_new_dish": "הוסף מנה חדשה",
      "dish_name": "שם המנה", "price_ils": "מחיר (₪)", "description": "תיאור", 
      "ingredients_comma": "מרכיבים (מופרדים בפסיק)", "allergens_label": "אלרגנים:",
      "update_dish": "עדכן מנה", "add_to_menu": "הוסף לתפריט", "cancel": "ביטול",
      "available_caps": "זמין", "sold_out_caps": "אזל", "delete_confirm": "למחוק את המנה הזו לחלוטין?",

      // --- NEW: NAVBAR TRANSLATIONS ---
      "nav_menu": "תפריט", "nav_kitchen": "מטבח", "nav_menu_mgr": "ניהול תפריט", "nav_my_station": "העמדה שלי",
      "nav_tables": "שולחנות", "nav_staff": "צוות", "nav_login": "התחבר", "nav_logout": "התנתק",

      // --- NEW: ALLERGEN TRANSLATIONS ---
      "allergen_lactose": "לקטוז", "allergen_gluten": "גלוטן", "allergen_shellfish": "פירות ים", 
      "allergen_peanut": "בוטנים", "allergen_nuts": "אגוזים", "allergen_soy": "סויה", 
      "allergen_eggs": "ביצים", "allergen_fish": "דגים", "allergen_sesame": "שומשום"
    }
  },
  ru: {
    translation: {
      "cat_all": "Все", "cat_main": "Основные", "cat_sushi": "Суши", "cat_drinks": "Напитки", "cat_dessert": "Десерты", "cat_starters": "Закуски",
      "loading": "Загрузка...", "welcome": "Добро пожаловать в Uder", "scan_prompt": "Отсканируйте QR-код стола.",
      "no_items": "Нет товаров в", "add_to_order": "Добавить", "ask_waiter": "Попросите официанта",
      "checkout": "Оформление", "view_order": "Посмотреть заказ", "order_summary": "Сводка заказа", "total": "Итого",
      "table_number": "Номер стола", "place_order": "Разместить заказ", "sending_order": "Отправка...",
      "clear_cart": "Очистить заказ?", "remove": "Удалить",
      
      "kitchen_display": "Экран кухни", "live_service_monitor": "Мониторинг обслуживания", "active_orders": "Активные заказы",
      "inbound_orders": "Новые заказы", "start_prep": "Начать", "preparing": "Готовится", "mark_ready": "Готово",
      "ready_for_pickup": "Ожидает выдачи", "order_served": "Выдано", "all_clear": "Всё чисто", "loading_system": "Загрузка системы...",
      
      "my_station": "Моя станция", "select_tables_msg": "Выберите столы для управления заказами.", "recent_alerts": "Последние оповещения",
      "no_recent_activity": "Нет активности.", "ack": "Ок", "kitchen_progress": "Прогресс кухни", "no_active_orders": "Нет активных заказов.",
      "items": "предметов", "pending": "ожидает", "ready": "готово", "served": "подано", "active": "Активно", "my_station_click": "Моя станция",
      "only_receive_alerts": "* Вы будете получать уведомления только для выделенных столов.",
      
      "table_qr_mgmt": "Управление столами и QR", "manage_floor_plan": "Управление планом зала и генерация QR.",
      "add_new_table": "Добавить стол", "edit_table": "Изменить стол", "capacity": "Вместимость", "status": "Статус",
      "available_green": "Доступен (Зеленый)", "occupied_red": "Занят (Красный)", "reserved_yellow": "Резерв (Желтый)",
      "save_changes": "Сохранить", "add_table": "Добавить", "cancel_edit": "Отмена", "floor_plan_qr": "План зала и QR",
      "real_time_active": "Обновления активны 🟢", "edit": "Изменить", "delete": "Удалить", "no_tables_yet": "Столы еще не созданы.",
      
      "add_new_staff": "Добавить сотрудника", "name": "Имя", "email": "Email", "password": "Пароль",
      "waiter_staff": "Официант", "kitchen_role": "Кухня", "create_user": "Создать",
      
      "staff_login": "Вход для персонала", "sign_in": "Войти", "dont_have_account": "Нет аккаунта?", "register_now": "Зарегистрироваться!",

      "menu_manager": "Управление Меню", "edit_dish": "Изменить Блюдо", "add_new_dish": "Добавить Блюдо",
      "dish_name": "Название Блюда", "price_ils": "Цена (₪)", "description": "Описание", 
      "ingredients_comma": "Ингредиенты (через запятую)", "allergens_label": "Аллергены:",
      "update_dish": "Обновить Блюдо", "add_to_menu": "Добавить в Меню", "cancel": "Отмена",
      "available_caps": "ДОСТУПНО", "sold_out_caps": "РАСПРОДАНО", "delete_confirm": "Удалить это блюдо полностью?",

      // --- NEW: NAVBAR TRANSLATIONS ---
      "nav_menu": "Меню", "nav_kitchen": "Кухня", "nav_menu_mgr": "Упр. Меню", "nav_my_station": "Моя станция",
      "nav_tables": "Столы", "nav_staff": "Персонал", "nav_login": "Войти", "nav_logout": "Выйти",

      // --- NEW: ALLERGEN TRANSLATIONS ---
      "allergen_lactose": "Лактоза", "allergen_gluten": "Глютен", "allergen_shellfish": "Моллюски", 
      "allergen_peanut": "Арахис", "allergen_nuts": "Орехи", "allergen_soy": "Соя", 
      "allergen_eggs": "Яйца", "allergen_fish": "Рыба", "allergen_sesame": "Кунжут"
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