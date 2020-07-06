const http = require("http");
const express = require('express');
const { format } = require("path");
const app = express()
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host : '127.0.0.1',
        user : 'root',
        password : '',
        database : 'todo'
    }
})

const bodyParser = require("body-parser");

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(function(req, res, next) {
    res.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.get('/todos', function (req, res){
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    let order_by = req.query.order_by

    console.log(req.query)

    if(!order_by){
        order_by = 'ASC'
    }

    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    
    const result = {}

    if(page === undefined && limit === undefined){
        knex.select().from('todos').orderBy('id', order_by).then((todos) => {
            result.todos = todos
            result.countTodos = todos.length
            res.send(result)
        })
    } else {
        knex.select().from('todos').orderBy('id', order_by).then((todos) => {
            result.todos = todos.slice(startIndex, endIndex)
            result.countTodos = todos.length
            result.limit = limit
            result.page = page
            res.send(result)
        })
    }
    
})

app.get('/todos/:id',  function (req, res){
    knex.select().from('todos').where('id', req.params.id).then((todos) => {
        res.send(todos)
    })
})

app.post('/todos', function (req, res){
    knex('todos').insert({
        title: req.body.title ,
        checked: req.body.checked
    })
    .then(() => {
        knex.select().from('todos').then((todos) => {
            let maxcount = todos.map(e => e.id).reduce((max, current)=>{
                return max >= current ? max : current
            })
            knex.select().from('todos').where('id', maxcount).then((todo)=>{
                res.send(todo)
            })
        })
    })
})

app.put('/todos/:id', (req, res) => {
    knex('todos').where('id', req.params.id).update({
        title: req.body.title,
        date: new Date(),
        checked: req.body.checked
    })
    .then(() => {
        knex.select().from('todos').where('id', req.params.id).then((todos) => {
            res.send(todos)
        })
    })
})

app.delete('/todos/:id', (req, res) => {
    knex('todos').where('id', req.params.id).del()
    .then(() => {
        res.send("Запись c id"+req.params.id + 'успешна удалена')
    })
})

app.listen(3012, () => {
    console.log('API started. Port' + 3012)
})