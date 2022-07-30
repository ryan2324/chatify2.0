const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const logger = require('../middleware/logger')
router.get('/to/:userid', logger, (req, res) =>{
    const sql = `SELECT * FROM message WHERE (receiver = '${req.params.userid}' && sender = '${req.user.userId}') || (receiver = '${req.user.userId}' && sender = '${req.params.userid}') ORDER BY date_sent DESC`;
    try{
        db.query(sql, (err, result) =>{
            if(result.length > 0){
                res.status(200).json({result, user: req.user.userId})
            }else{
                res.status(200).json()
            }
        })
    }catch(e){
        res.status(404).json('something went wrong!')
    }
        
})

router.post('/add/:userid', logger, (req, res) =>{
    const date = new Date();
    const currentDate = {
        y: date.getFullYear().toString().length === 1 ? '0' + date.getFullYear() :date.getFullYear(),
        m: date.getMonth().toString().length === 1 ? '0' + (parseInt(date.getMonth()) + 1) :date.getMonth() + 1,
        d: date.getDate().toString().length === 1 ? '0' + date.getDate().toString() :date.getDate() + 1,
        h: date.getHours().toString().length === 1 ? '0' + date.getHours().toString() :date.getHours(),
        i: date.getMinutes().toString().length === 1 ? '0' + date.getMinutes().toString() :date.getMinutes(),
        s: date.getSeconds().toString().length === 1 ? '0' + date.getSeconds().toString() :date.getSeconds()
    }
    const timestamp = `${currentDate.y}-${currentDate.m}-${currentDate.d} ${currentDate.h}:${currentDate.i}:${currentDate.s}`
    const newContactSql = `INSERT INTO contact(user_id, contact_user_id, date_updated) VALUES(${req.user.userId}, ${req.params.userid}, '${timestamp}')`;
    const checkExistingSql = `SELECT * FROM contact WHERE user_id = ${req.user.userId} && contact_user_id = ${req.params.userid} `
    try{
        db.query(checkExistingSql, (errExisting, resultExisting ) =>{
            if(resultExisting.length < 1){
                db.query(newContactSql, (err, result) =>{
                    res.status(200).json("contact added");
                })
            }
        })
        
    }catch(e){
        res.status(401).json("something went wrong")
    }
})

router.get('/my-contacts', logger, (req, res) =>{
    const sql = `SELECT contact.contact_id, contact.user_id, contact.contact_user_id, contact.recent_message, user.email, user.name FROM contact JOIN user ON user.user_id = contact.contact_user_id WHERE contact.user_id = ${req.user.userId} ORDER BY contact.date_updated DESC`;
    try{
        db.query(sql, (err, result) =>{
            result.forEach((con) => {
                const msgSql = `SELECT * FROM message WHERE message_id = ${con.recent_message}`;
                const i = result.indexOf(con);
                db.query(msgSql, (err, msgRes) =>{
                    if(msgRes.length !== 0){
                        if(msgRes[0].sender === req.user.userId ){
                            result[i].recent_message = "sent:"+msgRes[0].content
                        }else{
                            result[i].recent_message = "received:"+msgRes[0].content
                        }
                    }
                    if(result.length - 1 === i){
                        res.status(200).json(result);
                    } 
                })   

                
            });
            
        })
    }catch(e){

    }
})

router.get('/delete/:userid', logger, (req, res) =>{
    const contactSql = `DELETE FROM contact WHERE user_id = ${req.user.userId} && contact_user_id = ${req.params.userid}`
    db.query(contactSql, (err, result) =>{
        if(!err){
            res.status(200).json('contact deleted')
        }
    })
})

module.exports = router;