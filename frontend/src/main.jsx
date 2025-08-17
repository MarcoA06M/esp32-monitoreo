import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { ConfigProvider } from 'antd'
import esES from 'antd/locale/es_ES'
import '../index.css'

// Ant Design Theme
const theme = {
  token: {
    colorPrimary: '#52c41a',
    borderRadius: 6,
    colorBgContainer: '#ffffff',
  },
  components: {
    Card: {
      headerBg: '#fafafa',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider locale={esES} theme={theme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
)