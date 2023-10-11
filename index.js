// 引入 library
require('dotenv').config()
const express = require('express');
const session = require("express-session");
const bodyParser = require('body-parser');
const requestIp = require('request-ip');
const path = require("path");
const jwt = require("jsonwebtoken");
const SocketServer = require('ws').Server
const fileUpload = require('express-fileupload');
const cors = require('cors')

const app = express();
const port = process.env.PORT || '5001'



let router = require('./router');

/******************************************************************
 ********************* session設定 *********************************
 ******************************************************************/
app.use(
    session({
        secret: process.env.secret,
        resave: true, // 重新造訪session是否生效
        saveUninitialized: true,
    })
);

/******************************************************************
 ******* 訪問靜態文件，這裡是訪問所有dist目錄下的靜態資源文件 **************
 ******************************************************************/
app.use(express.static(path.resolve(__dirname, './dist')))
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
