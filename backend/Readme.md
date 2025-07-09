# Money Transfer Backend API

## Description

This is the backend API for the Money Transfer application. It provides user authentication, transaction management, and administrative controls. The backend is built with Node.js, Express, and MongoDB, and includes features such as JWT-based authentication, rate limiting, and Swagger API documentation.

## Features

- User registration, login, logout, and token refresh
- JWT access and refresh token authentication
- User balance management
- Create and manage transactions (transfer, payment, deposit, withdrawal)
- Admin controls for viewing and processing transactions
- Rate limiting to prevent abuse
- CORS enabled for frontend integration
- Swagger API documentation for easy API exploration

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT)
- bcryptjs for password hashing
- express-rate-limit for rate limiting
- Swagger UI for API documentation
- dotenv for environment variable management

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=<your-mongodb-connection-string>
   ACCESS_TOKEN_SECRET=<your-access-token-secret>
   REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
   ```

## Running the Server

Start the server with:

```bash
npm start
```

The server will run on the port specified in the `.env` file (default 5000).

## API Endpoints

### User Routes (`/api/user`)

- `POST /register` - Register a new user  
  Request body: `{ userID, name, password, balance (optional), isAdmin (optional) }`

- `POST /login` - Login user and receive access and refresh tokens  
  Request body: `{ userID, password }`

- `POST /refresh-token` - Refresh access token  
  Request body: `{ refreshToken }`

- `POST /logout` - Logout user and invalidate refresh token  
  Request body: `{ refreshToken }`

- `GET /me` - Get current authenticated user info (requires authentication)

### Transaction Routes (`/api/transactions`)

- `POST /` - Create a new transaction (requires authentication)  
  Request body: `{ toId, amount, type, isInternational (optional), description (optional) }`

- `GET /user` - Get transactions for the authenticated user (requires authentication)  
  Query params: `page`, `limit`, `status`, `type`

- `GET /admin` - Get all transactions (admin only)  
  Query params: `page`, `limit`, `status`, `type`

- `PUT /:transactionId/process` - Approve or reject a transaction (admin only)  
  Request body: `{ status: 'approved' | 'rejected' }`

- `GET /:transactionId` - Get transaction by ID (requires authentication)

## Swagger API Documentation

API documentation is available at:

```
http://localhost:<PORT>/api-docs
```

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.

## License

This project is licensed under the MIT License.
