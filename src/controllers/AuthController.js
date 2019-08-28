const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

const User = require('../models/User')

// Função que gera o token
function generateToken (params = {}) {
  // sign(ID que diferencia os tokens, chave, data de expiração do token)
  return jwt.sign(params, process.env.SECRET_KEY, { expiresIn: 86400 })
}

// Criação do usuário
router.post('/register', async (req, res) => {
  const { email } = req.body
  try {
    // Procura um usuário pelo email e verificando se o emial já existe
    if (await User.findOne({ email })) {
      return res.status(400).send({ error: 'User already exists' })
    }

    // Cria o usuário
    const user = await User.create(req.body)

    // Remove o password
    user.password = undefined

    return res.send({ user, token: generateToken({ id: user.id }) })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ error: 'Registration failed' })
  }
})

// Autenticação do usuário
router.post('/authenticate', async (req, res) => {
  const { email, password } = req.body

  try {
    // Busca o usuário caso exista
    const user = await User.findOne({ email }).select('+password') // O select retorna campos que select = false dentro dos models

    // Caso o usuário não exista
    if (!user) {
      return res.status(400).send({ error: 'User not found' })
    }

    // Compara se a senha usada para o login e a mesma que foi salva no banco de dados
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(400).send({ error: 'Invalid password' })
    }

    // Remove o password
    user.password = undefined

    return res.send({ user, token: generateToken({ id: user.id }) })
  } catch (e) {
    return res.status(400).send({ error: 'Authenticate failed' })
  }
})

module.exports = (app) => app.use('/auth', router) // pegando a variavel app e utilizando
