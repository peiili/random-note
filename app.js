const path = require('path')
const express = require('express')
const app = express()
const viewRoute = require('./router')
const db = require('./db')

const self = {
    accessToken: {},
    hostToWebsite: {},
    db: db,
}
app.use((req,res,next)=>{
    req.self = self
    next()
})

const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// app.use(express.static('static'))
app.use(express.static('template'))

// 设置ejs 模板引擎
app.set('views', path.join(__dirname,'template'))
app.set('view engine','ejs')
viewRoute(app)

module.exports = app