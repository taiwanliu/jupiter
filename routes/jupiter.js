const Response = require('../models/Response');
const fs = require('fs');
var path = require('path');
const http = require('http');
const moment = require('moment');
var file = "./test.db";


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function insert(req, res) {
    console.log('=== Receiving %s %s API call with request data: %j ===', req.method, req.originalUrl, req.body);
    let resObj = new Response();
    if (req.body.intro == "" || req.body.filename == "") {
        return "fail";
    }
    try {
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);
        fs.writeFile(path.join(__dirname, "../") + "public/upload/" + req.body.filename + "", req.body.intro, function (err) {
            if (err) {
                return console.log(err);
            }
            let id = moment().format('YYYYMMDDHHmmssSSS');
            db.serialize(function () {
                db.run("CREATE TABLE IF NOT EXISTS  filesys (fileid TEXT ,filename TEXT,intro TEXT,isUse int)");
                var stmt = db.prepare("INSERT INTO filesys VALUES (?,?,?,?)");
                stmt.run(id, req.body.filename, req.body.intro, 0);
                stmt.finalize();
                db.each("SELECT id, filename,intro FROM filesys", function (err, row) {});
            });
            db.close();
            resObj.success();
            resObj.id = id;

            return res.json(resObj);
        });
    } catch (err) {
        console.log('save error:', err);
        return res.json(resObj.internalServerError(err.message));
    }


}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function view(req, res) {
    console.log('=== Receiving %s %s API call with request data: %j ===', req.method, req.originalUrl, req.body);
    let resObj = new Response();
    try {
        let list = [];
        resObj.success();
        let sql = "SELECT fileid, filename,intro FROM filesys";
        r = await all(sql, [])
        r.forEach(function (row) {
            let obj = {
                id: row.fileid,
                filename: row.filename,
                intro: row.intro
            }
            list.push(obj);
        })
        resObj.list = list;
        return res.json(resObj);
    } catch (err) {
        console.log('view error:', err);
        return res.json(resObj.internalServerError(err.message));
    }
}


function all(query, params) {
    return new Promise(function (resolve, reject) {
        if (params == undefined) params = []
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);
        db.all(query, params, function (err, rows) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(rows)
                db.close();
            }
        })
    })
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function edit(req, res) {
    console.log('=== Receiving %s %s API call with request data: %j ===', req.method, req.originalUrl, req.query);
    let resObj = new Response();
    try {
        resObj.success()
        var sql = "select * from filesys where fileid = ? ";
        r = await getdb(sql, [req.query.id])
        resObj.content = {
            filename: r.filename,
            intro: r.intro,
            id: r.fileid,
            fileid: r.fileid,
            isUse: r.isUse
        }

        if (r.isUse == 0) {
            console.log("not lock set lock");
            var sql = "update filesys set isUse=1 where  fileid = " + req.query.id;
            r = await run(sql);
        }
    } catch (err) {
        console.log('view error:', err);
        return res.json(resObj.internalServerError(err.message));
    }
    return res.json(resObj);
}


function getdb(query, params) {
    return new Promise(function (resolve, reject) {
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);
        db.get(query, params, function (err, row) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(row)
            }
        })
    })
}

function run(query) {
    return new Promise(function (resolve, reject) {
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);
        db.run(query,
            function (err) {
                if (err) reject(err.message)
                else resolve(true)
            })
    })
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function save(req, res) {
    console.log('=== Receiving %s %s API call with request data: %j ===', req.method, req.originalUrl, req.body);
    let resObj = new Response();
    if (req.body.intro == "" || req.body.filename == "") {
        return "fail";
    }

    let id = req.body.id;
    try {
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);
        fs.writeFile(path.join(__dirname, "../") + "public/upload/" + req.body.filename + "", req.body.intro, function (err) {
            if (err) {
                return console.log(err);
            }
            db.serialize(function () {
                var stmt = db.prepare("update filesys set filename= ? , intro =? ,isUse = ? where fileid= ?");
                stmt.run(req.body.filename, req.body.intro, 0, id);
                stmt.finalize();
            });
            db.close();
            resObj.success();
            resObj.id = id;

            return res.json(resObj);
        });
    } catch (err) {
        console.log('save error:', err);
        return res.json(resObj.internalServerError(err.message));
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async function setLock(req, res) {
    console.log('=== Receiving %s %s API call with request data: %j ===', req.method, req.originalUrl, req.query);
    let resObj = new Response();

    let id = req.query.id;
    let isLock = req.query.isLock;

    try {
        var sqlite3 = require("sqlite3").verbose();
        var db = new sqlite3.Database(file);

        db.serialize(function () {
            var stmt = db.prepare("update filesys set isUse = ? where fileid= ?");
            stmt.run(isLock, id);
            stmt.finalize();
        });
        db.close();
        resObj.success();
        resObj.id = id;

        return res.json(resObj);

    } catch (err) {
        console.log('setLock error:', err);
        return res.json(resObj.internalServerError(err.message));
    }
}


exports.save = save;
exports.edit = edit;
exports.view = view;
exports.insert = insert;
exports.setLock = setLock;