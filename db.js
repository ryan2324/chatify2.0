const mysql = require('mysql');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ryanjay2399',
    database: 'chatify'
})

conn.connect((err, res) =>{
    if(res){
        console.log('connected to db!')
    }
});
module.exports = conn;