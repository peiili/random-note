
function index(req, res){
    const db = req.self.db
    var sql = 'select * from xek_article where type=? order by created_date desc'
    db.query(sql,['2'], function(results){

      res.render('index/index', 
        {
          list: results.map((e)=>{
            return {
              id: e.id,
              title: e.title,
              description: e.description,
              keywords: e.keywords,
            }
          })
        }
        );
    })
}

module.exports = index
