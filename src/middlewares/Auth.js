const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  // Busca o header de autorização
  const authHeader = req.headers.authorization

  // Verifica se o token foi informado
  if (!authHeader) {
    return res.status(401).send({ error: 'No token provided' })
  }

  // Formato esperado Bearer zxc28s0svxvsas8d-03mfadsba91sa9bsoa7w8nbmcvnmoiwem
  const parts = authHeader.split(' ')

  // Verifica se possue as duas partes dentro do array ['Bearer', 'zxc28s0svxvsas8d-03mfadsba91sa9bsoa7w8nbmcvnmoiwem']
  if (!parts.length === 2) {
    return res.send(401).send({ error: 'Token error' })
  }

  // Separa o Bearer e a hash
  const [scheme, token] = parts

  // Verifica se existe a palavra Bearer dentro do array
  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token malformatted' })
  }

  // Verifica o token com o auxílio da SECRET_KEY
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => { // decoded => id do usuário
    if (err) {
      return res.status(401).send({ error: 'Token invalid' })
    }

    // decode.id e o parametro repassado para o jwt.sign()
    req.userId = decoded.id

    return next()
  })
}
