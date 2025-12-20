# SeagullsFM Backend

Backend API built with Node.js, Express.js, and MongoDB.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── database.js  # MongoDB connection
│   ├── controllers/     # Route controllers
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Application entry point
├── public/              # Static files
├── tests/               # Test files
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
└── package.json        # Project dependencies
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your MongoDB connection string and other configuration.

4. Start the development server:
```bash
npm run dev
```

5. Start the production server:
```bash
npm start
```

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check

## Development

The project uses ES6 modules. Make sure to use `import` instead of `require`.

