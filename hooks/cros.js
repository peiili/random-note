var moment = require('moment')
var current =''
function cros(req,res,next){    
    current = moment().format('MM-DD HH:mm:ss')
    console.log(`${current}：`,req.url);
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With, Content-Type,Accept');
    res.header('Access-Control-Allow-Methods','PUT,POST,GET,DELETE,OPTIONS');
    next()
}

module.exports = cros;
