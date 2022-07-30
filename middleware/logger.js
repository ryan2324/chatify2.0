const cookie = require('cookie-parser');
const jwt = require('jsonwebtoken');
const logger = (req, res, next) =>{
    const verify = jwt.verify(req.cookies.chatify_token, process.env.AUTH_TOKEN, (err, res) =>{
        return res
    })
    if(verify){
        req.user = verify;
        next();
    }else{
        res.redirect('/login')
    }
}
module.exports = logger;