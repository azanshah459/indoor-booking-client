# Indoor Booking Client

React frontend for the Indoor Sports Booking Management System.
Allows customers to browse grounds, book time slots, and manage their
bookings. Includes a full admin dashboard for facility management.

## Tech Stack

- **Framework:** React 18 with Vite
- **Routing:** React Router v6
- **HTTP Client:** Axios with JWT interceptor
- **State Management:** React Context API
- **Styling:** Inline styles with consistent design system

## Features

### Customer
- Register and login
- Browse Cricket and Futsal grounds
- Select a date and search available time slots
- Book a slot with instant UI feedback
- View and cancel bookings

### Admin
- Dashboard with live stats and revenue
- Add and delete grounds
- View all bookings with status filtering
- Monthly revenue table

## Project Structure
src/

├── components/       # Reusable UI (Navbar)

├── context/          # Global auth state (AuthContext)

├── pages/            # Full page components

│   ├── HomePage

│   ├── LoginPage

│   ├── RegisterPage

│   ├── GroundsPage

│   ├── SlotsPage

│   ├── MyBookingsPage

│   ├── AdminDashboardPage

│   ├── AdminGroundsPage

│   └── AdminBookingsPage

├── services/         # Axios API calls

│   ├── api.js        # Base axios instance with interceptor

│   ├── authService

│   ├── groundService

│   ├── slotService

│   └── bookingService

└── utils/

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running (see indoor-booking-api)

### Setup

1. Clone the repository
git clone https://github.com/azanshah459/indoor-booking-client.git

2. Install dependencies
npm install

3. Update the API base URL in `src/services/api.js`
```javascript
   baseURL: 'http://localhost:5000/api'
```

4. Start the development server
npm run dev

5. Open `http://localhost:5173`

## Backend

This project requires the Indoor Booking API to be running.
Repository: https://github.com/azanshah459/indoor-booking-api