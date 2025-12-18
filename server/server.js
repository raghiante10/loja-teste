require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/produtos');
const adminRoutes = require('./routes/admin'); // <-- importa o admin

const app = express();

app.use(cors());
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Erro MongoDB', err));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', productRoutes);
app.use('/api/admin', adminRoutes); // <-- registra as rotas do admin

// Inicialização do servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));