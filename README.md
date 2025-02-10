## install dependencies
```shell
npm i
```

## setup database password for db.js

```javascript
const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'rm-bp1r11zh6j1nnf09l1o.mysql.rds.aliyuncs.com',
  password: process.env.DB_PASSWORD,  // replace you db password
  user: 'xek',
  database: 'xek'
});
```
## start

```shell
# linux or mac
./start.sh

# windows
node ./bin/www
```

## restart
```shell
# linxu
./restart.sh
```


