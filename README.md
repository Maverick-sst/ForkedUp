# ForkedUp


ForkedUp is a full-stack web application designed to revolutionize food discovery. Inspired by the engaging format of short-form video content, it allows users to visually explore dishes from local food partners through video reels and order seamlessly. This project serves as a comprehensive example of building a modern web application using the MERN stack and related technologies.

---

## ✨ Features

ForkedUp offers distinct experiences for users looking for food and for food partners managing their business.

### For Users:

* **Visual Discovery:** Browse an endless feed of short video reels showcasing dishes from various food partners.
* **Search:** Find specific dishes or restaurants using the search functionality.
* **Interaction:** Like, save, and comment on food reels.
* **Partner Profiles:** View detailed profiles of food partners, including their menu reels and ratings.
* **Follow System:** Follow favorite food partners to stay updated.
* **Cart Management:** Add items directly from reels, manage quantities, and view cart totals.
* **Seamless Checkout:** Place orders with options for saved or new addresses (including geo-location detection) and multiple payment methods (COD, simulated UPI).
* **Order Tracking:** Monitor order status in real-time from placement to delivery.
* **User Profile:** Manage personal details, saved addresses, view liked/saved reels, and order history.
* **Rating System:** Rate completed orders to provide feedback.

### For Food Partners:

* **Authentication:** Secure registration and login system.
* **Profile Management:** Set up and edit restaurant details including name, location (with geo-location support), contact info, and working hours.
* **Menu Creation:** Upload video reels for dishes, adding details like name, price, description, category, dietary preference, and cuisine.
* **Order Management:** View incoming orders, accept/reject them, and update the status through the preparation and delivery process.
* **Dashboard:** Get a quick overview of restaurant status, new orders, active orders, and basic stats.

---

## 🛠️ Tech Stack

* **Frontend:**
    * React (Vite)
    * Tailwind CSS
    * React Router
    * Axios
    * Context API (for Cart Management)
    * Lucide React & React Icons
* **Backend:**
    * Node.js
    * Express
    * MongoDB (with Mongoose)
    * JWT (for Authentication)
    * Bcryptjs (for Password Hashing)
    * Cookie-Parser
    * CORS
    * Multer (for File Handling)
    * ImageKit (for Cloud Media Storage)
* **APIs:**
    * OpenCage Geocoding API (via Backend) for reverse geocoding

---

## 🚀 Setup & Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/ForkedUp.git](https://github.com/your-username/ForkedUp.git)
    cd ForkedUp
    ```

2.  **Backend Setup:**
    * Navigate to the Backend directory: `cd Backend`
    * Install dependencies: `npm install`
    * Create a `.env` file in the `Backend` root.
    * Add the following environment variables to your `.env` file, replacing placeholder values:
        ```env
        DB_URL=YOUR_MONGODB_CONNECTION_STRING
        secret_key=YOUR_JWT_SECRET_KEY
        IMAGEKIT_PUBLICKEY=YOUR_IMAGEKIT_PUBLIC_KEY
        IMAGEKIT_PRIVATEKEY=YOUR_IMAGEKIT_PRIVATE_KEY
        IMAGEKIT_URL_ENDPOINT=YOUR_IMAGEKIT_URL_ENDPOINT
        OPENCAGE_KEY=YOUR_OPENCAGE_API_KEY
        ```
    * Start the backend server: `npm start` (or `nodemon server.js` if you prefer nodemon)

3.  **Frontend Setup:**
    * Navigate to the Frontend directory: `cd ../Frontend`
    * Install dependencies: `npm install`
    * Start the frontend development server: `npm run dev`

4.  **Access the application:** Open your browser and go to `http://localhost:5173` (or the port specified by Vite).

---

## 🌐 Deployment

* **Frontend:** https://forkedup-4ko5jbnxi-maverick-ssts-projects.vercel.app
* **Backend:** https://forkedup-backend.onrender.com
* **API documentation:** https://documenter.getpostman.com/view/47884007/2sB3Wjzihv

---

## 📖 My Journey

This project marks my first full-stack build! It's been quite the ride, from the initial spark of an idea to wrestling with bugs and finally bringing it to life. I've documented the process – the inspiration, the design choices, the hurdles, and the wins – in a more detailed Notion page. If you're curious about the behind-the-scenes, feel free to check it out:

➡️ **https://fluff-angle-79b.notion.site/ForkedUp-Journey-2970c13aca71806bb8afd5a539edd1d6**

---
