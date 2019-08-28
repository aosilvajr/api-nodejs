const express = require('express')
const multer = require('multer')
const multerConfig = require('../configs/multer')
const router = express.Router()

const Profile = require('../models/Profile')

const AuthMiddleware = require('../middlewares/Auth')

router.use(AuthMiddleware)

// Create
router.post('/:userId', multer(multerConfig).single('file'), async (req, res) => {
  const { originalname: name, size, key } = req.file

  console.log(req.file)

  try {
    // Procura a collection relacionada ao id do uauário
    const findProfile = await Profile.findOne({ userId: req.params.userId })

    // Se retornar uma collection remove o profile e cria outro no lugar e retorna populado
    if (findProfile) {
      await findProfile.remove()

      const profile = await Profile.create({ name, key, size, userId: req.userId })

      profile.populate('userId').execPopulate().then((profile) => {
        return res.send({ profile })
      })
    }

    // Se não retornar uma collection e cria o profile normalmente
    if (!findProfile) {
      const profile = await Profile.create({ name, key, size, userId: req.userId })

      profile.populate('userId').execPopulate().then((profile) => {
        return res.send({ profile })
      })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).send({ error: 'Error creating profile' })
  }
})

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    // Procura pelo id do usuário
    const userProfile = await Profile.findOne({ userId: req.params.id }).populate('userId')

    if (!userProfile) {
      return res.status(400).send({ error: 'User profile not found' })
    }

    return res.send({ userProfile })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ error: 'Error loading profiles' })
  }
})

// Delete profile
router.delete('/:id', async (req, res) => {
  try {
    // Procura pelo id do usuario e remove
    const profile = await Profile.findOne({ userId: req.params.id })

    await profile.remove()

    return res.send({ message: 'Profile delete successfuly' })
  } catch (e) {
    return res.status(400).send({ error: 'Error deleting profile' })
  }
})

module.exports = (app) => app.use('/profile', router)
