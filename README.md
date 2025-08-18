# ESP32 Sistema de Monitoreo
Proyecto: Unit 2-3-4 Complementary Assessment

- Stack: ESP32 + Node.js + React + MongoDB + Docker + GitHub Actions

# Descripción del Proyecto
Sistema completo de monitoreo IoT que integra un dispositivo ESP32 con sensores ambientales, backend API, frontend web y pipeline de CI/CD automatizado. El proyecto demuestra competencias en:

- Desarrollo Backend + Frontend
- Integración con API externa (ESP32 como servicio IoT)
- Docker
- CI/CD con GitHub Actions
- Deploy en servicios cloud

# Componentes:

- ESP32 + Sensores: Dispositivo IoT
- Backend API: Node.js + Express que recibe y procesa datos
- Frontend Web: React + Ant Design para visualización
- Base de Datos: MongoDB Atlas
- Pipeline CI/CD: GitHub Actions para deploy automatizado

# Tecnologías Utilizadas

##  Backend

- Node.js 18+ - Runtime JavaScript
- Express.js - Framework web
- MongoDB + Mongoose - Base de datos NoSQL
- Docker

## Frontend

- React 18 - Librería UI
- Vite - Build tool moderno
- Ant Design - Componentes UI

## DevOps

- GitHub Actions - CI/CD Pipeline
- Docker Compose

# Hardware

- ESP32 - Microcontrolador
- DHT11 - Sensor temperatura/humedad
- Sensor humedad suelo - Monitoreo riego
- LDR - Sensor de luz
- LEDs + Buzzer - Indicadores de estado

# Estructura del Proyecto
```
esp32-monitor/
├── backend/                 # API Node.js
│   ├── server.js           # Servidor principal
│   ├── package.json        # Dependencias backend
│   ├── Dockerfile          # Container backend
│   └── server.test.js      # Tests backend
├── frontend/               # App React
│   ├── src/
│   │   ├── App.jsx         # Componente principal
│   │   ├── main.jsx        # Entry point
│   │   └── App.css         # Estilos
│   ├── package.json        # Dependencias frontend
│   ├── Dockerfile          # Container frontend
│   └── vite.config.js      # Configuración Vite
├── .github/workflows/      # CI/CD Pipeline
│   └── deploy.yml          # GitHub Actions
├── docker-compose.yml      # Orquestación local
├── .env                   # Variables de entorno
└── README.md              # Este archivo
```

# Monitoreo y Logs

Health Checks
# Backend health
curl http://localhost:3000/health

# Frontend health

## Endpoints API
```
GET  /                      # Info general
GET  /health                # Health check
POST /api/sensors/data      # Recibir datos ESP32
GET  /api/sensors/latest    # Última lectura
GET  /api/sensors/history   # Histórico (últimas 24h)
GET  /api/sensors/stats     # Estadísticas
```