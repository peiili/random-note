const fs = require('fs');
const path = require('path');
const express = require('express')
const router = express.Router()

function deep(dir,subdir){
    const files = fs.readdirSync(path.join(__dirname, dir))
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fulepath = path.join(dir, file)
        const isDirectory = fs.statSync(path.join(__dirname,fulepath)).isDirectory()
        if(isDirectory){
            deep(dir+ '/' +file, subdir+ '/' +file)
            continue
        }
        const func = require('./'+fulepath)
        const routePath = file.replace('.js','')
        if(routePath==='index'){
            router.get(subdir+'/', func)
        }
        router.get(subdir + '/' + routePath, func)
    }
}
function viewRoute(app) {
    deep('controllers/view', '')
    router.get('/view/*', (req, res) => {
        res.status(301).redirect('/view')
    });
    
    // router.get('/site.txt', (req, res)=>{
        
    // })
    router.get('/*', (req, res)=>{
        res.status(301).redirect('/')
    })
    app.use('/', router)
}

module.exports = viewRoute;