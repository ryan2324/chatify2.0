const router = require('express').Router();
const db = require('../db');
const logger = require('../middleware/logger');
router.post('/', logger, (req, res) =>{
    const search = req.body.text;
    const sql = `SELECT user_id, email, name FROM user WHERE email LIKE '${search}%'`
    db.query(sql, (err, result) =>{
        const searchResult = result;
        const filtered = searchResult.filter((contact) =>{
            return contact.email !== req.user.email;
        })
        if(!err){
            if(searchResult.length > 0){
                res.status(200).json(filtered);
            }else{
                res.status(200).json('No user to show...')
            }
        }else{
            console.log(err);
            res.status(400).json("something went wrong!");
        }
    })
})

module.exports = router;