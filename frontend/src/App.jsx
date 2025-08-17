import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Typography,
  Spin,
  Alert,
  Space,
  Tag,
  Progress
} from 'antd';
import {
  FireOutlined,
  CloudOutlined,
  BulbOutlined,
  AlertOutlined,
  WifiOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import dayjs from 'dayjs';
import './App.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const App = () => {
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);


  // Función para obtener datos más recientes
  const fetchLatestData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/sensors/latest`);
      if (response.data.success && response.data.data) {
        setLatestData(response.data.data);
        setLastUpdate(new Date());
        setError(null);
      }
    } catch (err) {
      setError('Error conectando con el backend');
      console.error('Error fetching latest data:', err);
    }
  };

  // Cargar datos inicial
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await Promise.all([
        fetchLatestData()
      ]);
      setLoading(false);
    };

    loadInitialData();

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchLatestData();
      fetchHistoryData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Función para determinar el estado de alerta
  const getAlertStatus = (alerta) => {
    switch (alerta) {
      case 0: return { text: 'NORMAL', color: 'success', badgeStatus: 'success' };
      case 1: return { text: 'PRECAUCIÓN', color: 'warning', badgeStatus: 'warning' };
      case 2: return { text: 'URGENTE', color: 'error', badgeStatus: 'error' };
      default: return { text: 'DESCONOCIDO', color: 'default', badgeStatus: 'default' };
    }
  };

  // Función para obtener el color de la humedad del suelo
  const getSoilHumidityColor = (humidity) => {
    if (humidity < 25) return '#ff4d4f';
    if (humidity < 45) return '#faad14';
    return '#52c41a';
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  const alertStatus = latestData ? getAlertStatus(latestData.alerta) : { text: 'SIN DATOS', color: 'default', badgeStatus: 'default' };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header style={{ 
        background: '#001529', 
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          Sistema de Monitore ESP32
        </Title>
        <Space>
          <Badge status={latestData ? 'success' : 'error'} />
          <Text style={{ color: 'white' }}>
            {latestData ? 'Conectado' : 'Sin conexión'}
          </Text>
        </Space>
      </Header>

      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {error && (
          <Alert
            message="Error de Conexión"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {lastUpdate && (
          <Alert
            message={
              <Space>
                <ClockCircleOutlined />
                <Text>Última actualización: {dayjs(lastUpdate).format('DD/MM/YYYY HH:mm:ss')}</Text>
              </Space>
            }
            type="info"
            style={{ marginBottom: 24 }}
          />
        )}

        {/* Tarjetas de datos principales */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Temperatura"
                value={latestData?.temperatura || 0}
                precision={1}
                suffix="°C"
                prefix={<FireOutlined />}
                valueStyle={{ 
                  color: latestData?.temperatura > 30 ? '#ff4d4f' : '#3f8600' 
                }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Humedad Ambiente"
                value={latestData?.humedad_ambiente || 0}
                precision={1}
                suffix="%"
                prefix={<CloudOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Intensidad Luz"
                value={latestData?.intensidad_luz || 0}
                suffix="%"
                prefix={<BulbOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Card>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Estado del Sistema</Text>
                <Badge status={alertStatus.badgeStatus} text={alertStatus.text} />
                <Tag color={alertStatus.color} icon={<AlertOutlined />}>
                  {alertStatus.text}
                </Tag>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Humedad del suelo con progreso */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={24}>
            <Card title="Humedad del Suelo" extra={<Tag color="blue">En tiempo real</Tag>}>
              <Progress
                type="circle"
                percent={latestData?.humedad_suelo || 0}
                strokeColor={getSoilHumidityColor(latestData?.humedad_suelo || 0)}
                format={(percent) => `${percent}%`}
                size={120}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <Text type="secondary">
                  {latestData?.humedad_suelo < 25 ? 'Riego urgente' :
                   latestData?.humedad_suelo < 45 ? 'Considerar riego' : 'Nivel óptimo'}
                </Text>
              </div>
            </Card>
          </Col>

        </Row>

      </Content>
    </Layout>
  );
};

export default App;