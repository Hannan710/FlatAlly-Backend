const { format } = require('date-fns');
const { v4: uuid } = require('uuid');

const fsPromise = require('fs').promises;
const fs = require('fs');
const path = require('path');

const logEvents = async (message, logName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    try {
        if (!fs.existsSync(path.join(__dirname, "../logs"))) {
            await fsPromise.mkdir(path.join(__dirname, "../logs"))
        }
        await fsPromise.appendFile(path.join(__dirname, "../logs", logName), logItem);
    } catch (error) {
        console.log(error);
    }
}

const logger = (req, res, next) => {

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Extract the operating system and browser information

    // const osAndBrowser = userAgent.match(/\((.*?)\)/)[1];

    // logEvents(`${req.method}\t${clientIP}\t${osAndBrowser}\t${req.url}`, `reqLog.txt`);
    logEvents(`${req.method}\t${clientIP}\t${userAgent}\t${req.url}`, `reqLog.txt`);
    console.log(`${clientIP}\t logged`);

    next();
}


const errorHandler = (err, req, res, next) => {

    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Extract the operating system and browser information

    // const osAndBrowser = userAgent.match(/\((.*?)\)/)[1];

    logEvents(`${req.method}\t${clientIP}\t${userAgent}\t${req.url}`, `errorlog.txt`);

    // logEvents(`${req.method}\t${req.url}`, `error.txt`)
    console.log(err.stack);
    res.status(500).send(err.message);
    next()
}



module.exports = { logger, logEvents ,errorHandler };

