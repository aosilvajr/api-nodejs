const express = require('express')
const router = express.Router()

const Project = require('../models/Project')
const Task = require('../models/Task')

const AuthMiddleware = require('../middlewares/Auth')

router.use(AuthMiddleware)

// List
router.get('/', async (req, res) => {
  try {
    // Lista todos os projetos
    // Sintaxe reduzida que popula os campo user e o arrays de tasks seguido pela população do assignedTo e project selecionando o username removendo o ID
    const projects = await Project.find().populate([{ path: 'user tasks', populate: { path: 'assignedTo', select: 'username -_id' } }]).sort('-createdAt')
    // const projects = await Project.find().populate('user').populate({ path: 'tasks', populate: { path: 'assignedTo' } }).sort('-createdAt') Sintaxe original

    return res.send({ projects })
  } catch (e) {
    return res.status(400).send({ error: 'Error loading projects' })
  }
})

// Find One
router.get('/:projectId', async (req, res) => {
  try {
    // Procura o projeto com o ID passado
    const project = await Project.findById(req.params.projectId).populate([{ path: 'user tasks', populate: { path: 'assignedTo', select: 'username -_id' } }]).sort('-createdAt')

    // Verifica se o projeto existe
    if (!project) {
      return res.status(400).send({ error: 'Project not finding' })
    } else {
      // Retorna o projetp
      return res.send({ project })
    }
  } catch (e) {
    return res.status(400).send({ error: 'Error finding project' })
  }
})

// Create
router.post('/', async (req, res) => {
  try {
    const { title, description, tasks } = req.body
    const project = await Project.create({ title, description, user: req.userId })

    // Aguarda todas as iterções acabarem de ser executadas para poder prosseguir
    await Promise.all(tasks.map(async (task) => {
      // Pego apenas o title e preencho o assignedTo com o ID que retorna do Middleware
      const { title } = task

      const projectTask = new Task({ title, assignedTo: req.userId, project: project._id }) // Com a sintaxe de new o mongoose cria mas não salva

      // Espera as iterações e salva
      await projectTask.save()

      // Push np array tasks em projetos
      project.tasks.push(projectTask)
    }))

    // Salvas os projetos com as tasks
    await project.save()

    // Popula os campos antes de retornar
    // OBS: populate() retorna um callback / execPopulate() retorn uma Promise
    project.populate([{ path: 'user tasks', populate: { path: 'assignedTo', select: 'username -_id' } }]).execPopulate().then((project) => {
      return res.send({ project })
    })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ error: 'Error creating new project' })
  }
})

// Update
router.put('/:projectId', async (req, res) => {
  try {
    const { title, description, tasks } = req.body
    // Procura pelo projeto e suas tasks e atualiza o title e a description apenas
    const project = await Project.findByIdAndUpdate(req.params.projectId, {
      title,
      description
    }, { new: true }) // new = true retorna o projeto atualizado

    // Faz a busca das tasks a serem editadas e apaga elas para serem criadas novamente
    await Promise.all(project.tasks.map(async key => {
      await Task.deleteOne({ _id: key })
    }))

    // Deleta as antigas e cria novas tasks
    project.tasks = []

    // Aguarda todas as iterções acabarem de ser executadas para poder prosseguir
    await Promise.all(tasks.map(async (task) => {
      // Pego apenas o title e preencho o assignedTo com o ID que retorna do Middleware
      const { title } = task

      const projectTask = new Task({ title, assignedTo: req.userId, project: project._id }) // Com a sintaxe de new o mongoose cria mas não salva

      // Espera as iterações e salva
      await projectTask.save()

      // Push np array tasks em projetos
      project.tasks.push(projectTask)
    }))

    // Salvas os projetos com as tasks
    await project.save()

    return res.send({ project })
  } catch (e) {
    console.log(e)
    return res.status(400).send({ error: 'Error creating new project' })
  }
})

// Delete
router.delete('/:projectId', async (req, res) => {
  try {
    await Project.findByIdAndRemove(req.params.projectId)

    return res.send({ message: 'Project delete sucessfuly' })
  } catch (e) {
    return res.status(400).send({ error: 'Error deleting project' })
  }
})

module.exports = (app) => app.use('/projects', router)
