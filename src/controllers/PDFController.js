const express = require('express')
const fs = require('fs')
const path = require('path')
const router = express.Router()

// Funcão que gera o PDF
const pdfGenerator = require('../configs/pdf')

const Project = require('../models/Project')

router.get('/:projectId', async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)

    // Função que gera o PDF passado os dados para a view
    pdfGenerator(project).then(() => {
      // Envia o PDF para download
      return res.download('tmp/exemplo.pdf', (err) => {
        if (err) {
          return res.status(400).send({ error: 'Error downloading PDF' })
        } else {
          // unlinkSync deve ser usado dentro de try/catch e unlink fora com chamada de callback obrigatória
          fs.unlinkSync(path.resolve(__dirname, '..', '..', 'tmp', 'exemplo.pdf'))
        }
      })
    })
  } catch (e) {
    return res.status(400).send({ error: 'Error creating PDF' })
  }
})

module.exports = (app) => app.use('/pdf', router)
