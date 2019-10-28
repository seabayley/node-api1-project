const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const userModel = require('./data/db')

const server = express().use(express.json(), helmet(), cors(), morgan('combined'))

const validator = (res, id) => {
    let newId = Number(id);
    return ((newId % 1 === 0) && (typeof newId === "number"))
}

server.param('id', (req, res, next, id) => {
    if (validator(res, id)) {
        next()
    }
    else {
        res.status(401).json({ message: `Id format is incorrect: ${id}` })
    }
}, validator)

server.get('/api/users', (req, res) => {
    userModel
        .find()
        .then(msg => res.status(200).json(msg))
        .catch(err => res.status(500).json({ error: "The users information could not be retrieved." }))
})

server.get('/api/users/:id', (req, res) => {
    userModel
        .findById(req.params.id)
        .then(user => res.status(200).json(user))
        .catch(err => res.status(404).json({ message: "The user with the specified ID does not exist." }))
})

server.delete('/api/users/:id', (req, res) => {
    userModel
        .remove(req.params.id)
        .then(user => res.status(200).json('User deleted.'))
        .catch(err => res.status(404).json({ message: "The user with the specified ID does not exist." }))

})

server.put('/api/users/:id', (req, res) => {
    if ('name' in req.body && 'bio' in req.body) {
        userModel
            .update(req.params.id, req.body)
            .then(user => res.status(200).json('User updated.'))
            .catch(err => res.status(404).json({ message: "The user with the specified ID does not exist." }))
    }
    else {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
    }
})


server.post('/api/users', (req, res) => {
    if ('name' in req.body && 'bio' in req.body) {
        userModel
            .insert(req.body)
            .then(({ id }) => res.status(200).json(userModel.findById(id)))
            .catch(error => res.status(500).json({ error: "The user information could not be modified." }))
    }
    else {
        res.status(400).json({ errorMessage: "Please provide name and bio for the user." })
    }
})

server.listen(8000, () => console.log('API running on port 8000'))