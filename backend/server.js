const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(morgan('combined'));


// Mongo Model
const sensorSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, default: '2025178001' },
  timestamp: { type: Date, default: Date.now },
  temperatura: { type: Number, required: true },
  humedad_ambiente: { type: Number, required: true },
  humedad_suelo: { type: Number, required: true },
  intensidad_luz: { type: Number, required: true },
  alerta: { type: Number, required: true }, // 0=OK, 1=PRECAUCION, 2=URGENTE
  version_firmware: { type: String, required: true },
  uuid: { type: String, required: true },
  created_at: { type: Date, default: Date.now }
});

const SensorData = mongoose.model('SensorData', sensorSchema);

// Parse Fuction
function parseESP32Data(rawData) {
  try {
    // Format: tt1692181234|t24.5|h65.2|hs45|l78|a1|vv2025.08.08|uid12345...
    const parts = rawData.split('|');
    const data = {};
    
    parts.forEach(part => {
      if (part.startsWith('tt')) {
        data.timestamp = new Date(parseInt(part.substring(2)) * 1000);
      } else if (part.startsWith('t') && !part.startsWith('tt')) {
        data.temperatura = parseFloat(part.substring(1));
      } else if (part.startsWith('h') && !part.startsWith('hs')) {
        data.humedad_ambiente = parseFloat(part.substring(1));
      } else if (part.startsWith('hs')) {
        data.humedad_suelo = parseInt(part.substring(2));
      } else if (part.startsWith('l')) {
        data.intensidad_luz = parseInt(part.substring(1));
      } else if (part.startsWith('a')) {
        data.alerta = parseInt(part.substring(1));
      } else if (part.startsWith('v')) {
        data.version_firmware = part.substring(1);
      } else if (part.startsWith('uid')) {
        data.uuid = part.substring(3);
      }
    });
    
    return data;
  } catch (error) {
    throw new Error('Invalid data format');
  }
}


// Mongo Conection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/esp32_monitor';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// API Routes

// Endpoint ESP32
app.post('/api/sensors/data', async (req, res) => {
  try {
    const deviceId = req.headers['x-device-id'];
    const rawData = req.body;
    console.log(`Datos recibidos del ESP32 [${deviceId}]:`, rawData);
    
    // Data Parser ESP32
    const parsedData = parseESP32Data(rawData);
    parsedData.deviceId = deviceId;
    
    // Save in Mongo
    const sensorReading = new SensorData(parsedData);
    await sensorReading.save();
    
    console.log('Datos guardados exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Data received and stored',
      data: parsedData
    });
    
  } catch (error) {
    console.error('Error processing sensor data:', error);
    res.status(400).json({
      success: false,
      message: 'Error processing data',
      error: error.message
    });
  }
});

// Endpoint data frontend
app.get('/api/sensors/latest', async (req, res) => {
  try {
    const latestData = await SensorData.findOne()
      .sort({ created_at: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: latestData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching latest data',
      error: error.message
    });
  }
});

// Endpoint history data
app.get('/api/sensors/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const hours = parseInt(req.query.hours) || 24;
    
    const startTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const history = await SensorData.find({
      created_at: { $gte: startTime }
    })
    .sort({ created_at: -1 })
    .limit(limit)
    .select('-__v');
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching history',
      error: error.message
    });
  }
});

// API Routes
// Index
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema de Monitoreo ESP32',
    student: '2025178001',
    endpoints: {
      'POST /api/sensors/data': 'Recibir datos del ESP32',
      'GET /api/sensors/latest': 'Obtener última lectura',
      'GET /api/sensors/history': 'Obtener histórico',
    }
  });
});

// No found routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server after DB connection
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
