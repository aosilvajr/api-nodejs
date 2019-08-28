const multer = require('multer')
const path = require('path')
const crypto = require('crypto')

module.exports = {
  // Determina o local de destino dos arquivos enviados
  // OBS: path.resolver() define um caminho estatico
  dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  storage: multer.diskStorage({
    destination: (req, res, callback) => { // Caso nada seja definido aqui ele chama a variavel dest
      callback(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
    },
    // Define o nome da imagem
    filename: (req, file, callback) => {
      // Gera um novo nome para a imagem, pois dois usuário podem enviar duas imagens com o mesmo nome ex: profile
      crypto.randomBytes(16, (err, hash) => {
        if (err) {
          callback(err) // Erro sendo repassado para o callback
        } else {
          // Hash gerado pelo crypto convertido em hexadecimal + nome original da imagem
          // OBS: Como e só uma foto pode ser usado o id do usuário para identificar a imagem
          file.key = `${hash.toString('hex')}-${file.originalname.replace(/\s/g, '_')}`

          callback(null, file.key) // Sem erro repassando o novo nome da imagem
        }
      })
    }
  }),
  // Limite maximo permitido para a imagem enviada
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  // Função para filtra os tipos de arquivos permitidos
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg',
      'image/png'
    ]

    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true) // Primeiro parametro e sempre o erro
    } else {
      callback(new Error('Invalid fiel type'))
    }
  }
}
