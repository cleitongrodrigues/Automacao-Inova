require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const appRoutes = require('./src/routes/app');

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  return res.status(200).json({
    sucesso: true,
    mensagem: 'API no ar'
  });
});

app.use('/api', appRoutes);

app.use((req, res) => {
  return res.status(404).json({
    sucesso: false,
    mensagem: 'Rota nao encontrada'
  });
});

const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`Servidor backend rodando em http://localhost:${PORT}`);
});
