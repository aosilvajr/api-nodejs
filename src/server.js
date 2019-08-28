const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const mongoose = require('mongoose')
const path = require('path')
require('dotenv').config() // Permite o uso de variaveis .ENV

const app = express()

app.use(cors())
app.use(morgan('dev')) // Logger de requisições
app.use(express.json()) // Permite enviar e recebe JSON
app.use(express.urlencoded({ extended: true })) // Facilita o envio de imagens por url
app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads', 'images'))) // Tornar os uploads acessiveis

// Conexão mongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false
})

// Rotas
require('./controllers/AuthController')(app) // Passando a variavel app por parametro
require('./controllers/ProjectController')(app)
require('./controllers/ProfileController')(app)
require('./controllers/PDFController')(app)

// Conexão Servidor
app.listen(3000)
