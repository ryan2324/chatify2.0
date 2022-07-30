const router = require('express').Router();
const db = require('../db');
const logger = require('../middleware/logger');
router.post('/', logger, (req, res) =>{
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
    const messageQuery = `INSERT INTO message(content, sender, receiver, date_sent) VALUES('${req.body.message}', ${req.user.userId}, ${req.body.receiver.user_id}, '${timestamp}')`;
    db.query(messageQuery, (err, result) =>{
        res.status(200).json('message sent!');
        const updateRecentMessageRes = `UPDATE contact SET recent_message = ${result.insertId}, date_updated = '${timestamp}' WHERE (user_id = ${req.user.userId} && contact_user_id = ${req.body.receiver.user_id}) || (user_id = ${req.body.receiver.user_id} && contact_user_id = ${req.user.userId})`;
        db.query(updateRecentMessageRes, (err, updateRes) =>{
        })
    })
})

module.exports = router;