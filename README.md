# Uder
a website for syncing, ordering and displaying the menu

server/
├── config/
│   └── db.js              # Database connection logic (MongoDB Atlas)
├── controllers/
│   ├── authController.js  # Logic for logging in/registering
│   ├── menuController.js  # Logic for adding/getting menu items
│   └── orderController.js # Logic for creating/updating orders
├── models/
│   ├── User.js            # Schema for Staff/Admins
│   ├── Product.js            # Schema for Menu Items (Name, Price, Allergens)
│   ├── Order.js           # Schema for Orders (Table #, Items, Status)
│   └── Table.js           # Schema for Tables
├── routes/
│   ├── authRoutes.js      # API endpoints: POST /api/auth/login
│   ├── productRoutes.js      # API endpoints: GET /api/menu, POST /api/menu
│   └── orderRoutes.js     # API endpoints: POST /api/orders
├── middleware/
[cite_start]│   └── authMiddleware.js  # Checks the JWT token before allowing access [cite: 54]
├── .env                   # Secret keys (DB Connection String, JWT Secret)
├── package.json           # List of installed libraries (express, mongoose, etc.)
└── server.js              # The "Brain" - starts the server and Socket.io