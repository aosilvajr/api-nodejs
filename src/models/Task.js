const mongoose = require('mongoose')

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  // Não acho necessario retornar o projeto dentro das tasks, mas podem ser uteis no futuro
  // project: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Project',
  //   required: true
  // },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completed: {
    type: Boolean,
    required: true,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Task', TaskSchema)
