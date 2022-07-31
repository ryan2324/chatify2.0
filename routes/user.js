const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

require('dotenv').config();

router.post('/signup', (req, res) =>{
    const hashed = bcrypt.hash(req.body.password, 10, (err, hash) =>{
        const checkEmailSql = `SELECT email FROM user WHERE email = '${req.body.email}'`
        db.query(checkEmailSql, (err, result) =>{
            if(result.length > 0){
                res.status(200).json({message: 'email already exist', status: false});
                return
            }
            const sql = `INSERT INTO user(name, email, password) VALUES('${req.body.name}', '${req.body.email}','${hash}')`;
            db.query(sql, (err, result) =>{
                res.status(200).json({message: 'account created', status: true});
            })

        })
    });
})

router.post('/login', (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;
    const sql = `SELECT * FROM user WHERE email = '${email}' LIMIT 1`;
    db.query(sql, (err, result) =>{
        if(result.length > 0){
            bcrypt.compare(password, result[0].password, (err, verified) =>{
                if(verified){
                    const token = jwt.sign({
                                email: result[0].email,
                                userId: result[0].user_id,
                                name: result[0].name
                            }, process.env.AUTH_TOKEN)
                    res.header('authentication', token).json();
                }else{
                    res.status(401).json({message: "Authentication failed!"})
                }
            });
        }else{
            res.status(401).json({message: "Authentication failed!"})
        }
    })
})

module.exports = router;