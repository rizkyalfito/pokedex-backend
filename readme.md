# Pokédex Backend API

Backend API for Pokédex application built with Express.js, TypeScript, and MongoDB.

## API Endpoints

### Get Pokemon List
```
GET /api/pokemon?page=1&search=pikachu
```
Response:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 100,
    "hasMore": true
  }
}
```

### Get Pokemon Detail
```
GET /api/pokemon/:identifier
```
(identifier can be ID or name)

Response:
```json
{
  "success": true,
  "data": {
    "id": 25,
    "name": "pikachu",
    "height": 4,
    "weight": 60,
    "sprites": {
      "front_default": "...",
      "back_default": "...",
      "front_shiny": "..."
    },
    "types": [...],
    "moves": [...],
    "evolutionChain": {...}
  }
}
```

### Search Pokemon
```
GET /api/pokemon/search?query=pika
```

### Sync Pokemon Data (Utility)
```
POST /api/pokemon/sync
```
Fetches initial 100 Pokemon from PokeAPI and saves to MongoDB

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/rizkyalfito/pokedex-backend.git
cd pokedex-backend
```

2. Install dependencies:
```bash
npm install
```

3. Install TypeScript type definitions:
```bash
npm install --save-dev @types/node @types/express @types/cors
```

4. Create `.env` file:
```bash
cp .env.example .env
```

5. Update `.env` with your MongoDB URI:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pokedex
NODE_ENV=development
```

## Running the Application

### Development Mode
```bash
# Build TypeScript
npm run build

# Start the server
npm run dev
```

### Watch Mode (Auto-rebuild on changes)
```bash
# Terminal 1: Watch for TypeScript changes
npm run watch

# Terminal 2: Start the server
npm start
```

### Production Mode
```bash
npm run build
npm start
```

The server will start on `http://localhost:5000`

## Project Structure

```
pokedex-backend/
├── src/
│   ├── controllers/
│   │   └── pokemon.controller.ts   # Business logic
│   ├── models/
│   │   └── pokemon.model.ts        # MongoDB schema
│   └── routes/
│       └── pokemon.routes.ts       # API routes
├── server.ts                        # Entry point
├── .env.example                     # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Initial Data Setup

On first run, the API will automatically fetch the first 100 Pokemon from PokeAPI when you make your first request. Alternatively, you can manually trigger the sync:

```bash
curl -X POST http://localhost:5000/api/pokemon/sync
```

## Testing the API

### Health Check
```bash
curl http://localhost:5000/health
```

### Get Pokemon List
```bash
curl http://localhost:5000/api/pokemon?page=1
```

### Get Pokemon Detail
```bash
curl http://localhost:5000/api/pokemon/pikachu
# or
curl http://localhost:5000/api/pokemon/25
```

### Search Pokemon
```bash
curl http://localhost:5000/api/pokemon/search?query=char
```

## Technologies Used

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Axios** - HTTP client for PokeAPI
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variables

## License

ISC