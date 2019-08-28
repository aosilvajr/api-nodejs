const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const ProfileSchema = new mongoose.Schema({
  name: String, // Nome original da imagem
  key: String,
  size: Number,
  url: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true })

ProfileSchema.pre('save', function () { // OBS: Se for usado arrow function não se consegue usar o this na função
  if (!this.url) {
    // const teste = this.key.replace(/\s/g, 'X')
    // Quando já estiver em servidor de produção troca a URL no arquivo .env
    this.url = `${process.env.URL_PRODUCTION}/files/${this.key}`
  }
})

ProfileSchema.pre('remove', function () {
  // Transforma em um Promise por causa do await remove no ProfileController
  return promisify(fs.unlink)(path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key))
})

module.exports = mongoose.model('Profile', ProfileSchema)
