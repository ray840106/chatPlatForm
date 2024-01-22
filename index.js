// 引入 library
require('dotenv').config()
const cors = require('cors')
const path = require('path')
const debug = require('debug')
const log4js = require("log4js");
const express = require('express');
const jwt = require("jsonwebtoken");
const requestIp = require('request-ip');
const bodyParser = require('body-parser');
const session = require("express-session");
const fileUpload = require('express-fileupload');
const logConfig = require("./config/log4js.json");

const app = express();
const port = process.env.PORT || '5001'

const SocketServer = require('ws').Server

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

let router = require('./router');

/**make a log directory, just in case it isn't there.**/
try {
    require("fs").mkdirSync("./logs");
} catch (e) {
    if (e.code != "EEXIST") {
        console.error("Could not set up log directory, error was: ", e);
        process.exit(1);
    }
}

/**
 * Initialise log4js first, so we don't miss any log messages
 */
log4js.configure(logConfig);
const log = log4js.getLogger("connection");
const logger = log4js.getLogger();

console.log = createLogProxy("debug", logger);
console.error = createLogProxy("error", logger);

/******************************************************************
 ********************* session設定 *********************************
 ******************************************************************/
app.use(session({secret: process.env.secret }));

/******************************************************************
 ******* 訪問靜態文件，這裡是訪問所有dist目錄下的靜態資源文件 **************
 ******************************************************************/
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// app.use(express.static(path.resolve(__dirname, './dist')))
app.use(express.static('public')); //to access the files in public folder
app.use(cors()); // it enables all cors requests
app.use(fileUpload());
app.use(requestIp.mw({attributeName: 'clientIP'}))
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/API/',router)

const server = app.listen(port, () => {
    console.log(`Listening on ${port}`)
})

//將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server })

//當有 client 連線成功時
wss.on('connection', ws => {
    console.log('Client connected')

    // 當收到client消息時
    ws.on('message', data => {
        let decoded = ''

        // 收回來是 Buffer 格式、需轉成字串
        data = data.toString()
        let token = JSON.parse(data)
        if (token.hasOwnProperty('roomData')) {
            ws.ROOMID = jwt.verify(token.roomData, process.env.SECRET).ROOMID;
            ws.EMAIL = jwt.verify(token.roomData, process.env.SECRET).EMAIL;
        }
        if (token.hasOwnProperty('updData')) {
            decoded = jwt.verify(token.updData.token, process.env.SECRET);
        }


        // 發送給所有client：
        let clients = wss.clients  //取得所有連接中的 client

        clients.forEach(client => {
            if (client.ROOMID==decoded.ROOMID || client.EMAIL==decoded.FRIEND_EMAIL){
                client.send(data)  // 發送至每個 client
            }
        })
    })
    // 當連線關閉
    ws.on('close', () => {
        console.log('Close connected')
    })

})

/**
 * Listen on provided port, on all network interfaces.
 */

server.on('error', onError);
server.on('listening', onListening);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function createLogProxy(logLevel, logger) {
    return (...param) => {
        logger[logLevel](...param);
    };
}
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    log.info(
        "Express server listening on port ",
        server.address().port,
        " with pid ",
        process.pid
    );
}
