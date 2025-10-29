# Country Data API (HNG STAGE 2)
**A RESTful API that fetches, caches, and serves enriched country data with estimated GDP and a dynamic summary image.**

---

## Features

- **Fetches** country data from [`restcountries.com`](https://restcountries.com)
- **Fetches** exchange rates from [`open.er-api.com`](https://open.er-api.com)
- **Computes** `estimated_gdp = population × random(1000–2000) ÷ exchange_rate`
- **Caches** all data in **MySQL**
- **Supports filtering & sorting** (`region`, `currency`, `gdp_desc`)
- **CRUD operations** on countries
- **Generates & serves** a summary PNG image (`/countries/image`)
- **Dockerized** for easy setup
- **Robust error handling** (400, 404, 500, 503)

---

## Endpoints

| Method | Endpoint | Description |
|-------|----------|-----------|
| `POST` | `/countries/refresh` | Fetch & cache all countries + generate image |
| `GET` | `/countries` | List countries (with filters) |
| `GET` | `/countries/:name` | Get one country |
| `DELETE` | `/countries/:name` | Delete a country |
| `GET` | `/status` | Show total count & last refresh |
| `GET` | `/countries/image` | Serve summary PNG |

---

## Filters & Sorting (`GET /countries`)

```bash
?region=Africa
?currency=NGN
?sort=gdp_desc | gdp_asc
```

**Example**:
```bash
GET /countries?region=Africa&currency=NGN&sort=gdp_desc
```

---

## Sample Responses

### `GET /countries?region=Africa`

```json
[
  {
    "id": 1,
    "name": "Nigeria",
    "capital": "Abuja",
    "region": "Africa",
    "population": 206139589,
    "currency_code": "NGN",
    "exchange_rate": 1600.23,
    "estimated_gdp": 25767448125.2,
    "flag_url": "https://flagcdn.com/ng.svg",
    "last_refreshed_at": "2025-10-29T07:00:00.000Z"
  }
]
```

### `GET /status`

```json
{
  "total_countries": 250,
  "last_refreshed_at": "2025-10-29T07:00:00.000Z"
}
```

---

## Setup (Docker)

### 1. Clone & Enter
```bash
git clone https://github.com/AcharaChisomSolomon/HNG-backend-country-api.git
cd country-api
```

### 2. Start with Docker
```bash
docker compose up -d
```

> Wait 15 seconds for MySQL to start.

### 3. Refresh Data
```bash
curl -X POST http://localhost:8000/countries/refresh
```

### 4. Test Endpoints
```bash
# List African countries
curl "http://localhost:8000/countries?region=Africa&sort=gdp_desc" | jq

# Get Nigeria
curl http://localhost:8000/countries/Nigeria

# View summary image
open http://localhost:8000/countries/image
```

---

## Project Structure

```
country-api/
├── cache/                  # Generated summary.png
├── src/
│   ├── controllers/        # Route logic
│   ├── models/             # Sequelize model
│   ├── routes/             # Express routes
│   ├── services/           # API calls + image gen
│   └── server.js
├── docker-compose.yml
├── package.json
└── README.md
```

---

## Tech Stack

| Layer | Tech |
|------|------|
| Language | Node.js |
| Framework | Express |
| ORM | Sequelize |
| DB | MySQL |
| Image | Jimp |
| Container | Docker |

---

## Error Handling

| Code | Response |
|------|---------|
| `400` | `{"error": "Validation failed", "details": {...}}` |
| `404` | `{"error": "Country not found"}` |
| `500` | `{"error": "Internal server error"}` |
| `503` | `{"error": "External data source unavailable", "details": "..."}` |

---

## Development

```bash
npm run dev    # with nodemon
npm start      # production
```

---

## Deploy (Optional)

Deploy to **Render**, **Railway**, or **Fly.io**:

1. Push to GitHub
2. Connect repo
3. Set env vars:
   ```env
   DB_HOST=...
   DB_USER=...
   DB_PASS=...
   DB_NAME=countries_db
   PORT=10000
   ```
4. Add `Dockerfile` (optional):
   ```Dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm install
   CMD ["node", "src/server.js"]
   ```

---

## Author

**Achara Chisom Solomon**  
HNG Internship – Backend Track

---

**WOOHOO! Your API is LIVE and PRODUCTION-READY!**  
Run `open http://localhost:8000/countries/image` and celebrate!