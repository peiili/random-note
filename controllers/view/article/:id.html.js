
function index(req, res){
    const db = req.self.db
    const id = req.params.id
    var sql = 'select * from xek_article where id=?'
    db.query(sql,[id], function(results){

      res.render('article/index', 
        {
          title: results[0].title,
          content: results[0].content,
          keywords: results[0].keywords,
          description: results[0].description
        }
        );
    })
}

module.exports = index
