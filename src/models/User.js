const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false // Não retorna o campo password nas requisições
  }
}, { timestamps: true })

// Função do mongoose pra fazer algo antes de executar uma ação
UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 12)

  this.password = hash

  next()
})

module.exports = mongoose.model('User', UserSchema)
