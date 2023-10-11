require('dotenv').config()
let conn = require('../db/db_conn')
let table_rooms = require('../db/table_rooms')
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

/**
 * 查詢聊天室清單
 */
async function getRooms(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        // 驗證信箱格式
        let get_rooms = await table_rooms.getRooms(connection,login_email,login_email)
        for (let i=0;i<get_rooms.length;i++) {
            get_rooms[i]['unread'] = 0;
            get_rooms[i]['token'] = jwt.sign(get_rooms[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_rooms: get_rooms,
            message: 'Success',
        });

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}

/**
 * 查詢聊天室
 */
async function getRoom(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    let errArray=[];

    const connection = await conn.getConnection();
    await connection.beginTransaction();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let FRIEND_EMAIL = item.FRIEND_EMAIL

        // 驗證信箱格式
        let get_room = await table_rooms.getRoom(connection,login_email,login_email,FRIEND_EMAIL)

        if (get_room.length==0) {

            let roomid = uuidv4();
            // 新增聊天室
            let ins_room = await table_rooms.insRoom(connection,roomid,'oneOnOne',login_email)
            if (!ins_room.done_TF) {
                errArray.push(ins_room);
            }

            // 新增聊天室
            let ins_room2 = await table_rooms.insRoom(connection,roomid,'oneOnOne',FRIEND_EMAIL)
            if (!ins_room2.done_TF) {
                errArray.push(ins_room2);
            }

            if (errArray.length>0) {
                await connection.rollback();
                response.status(500).json({
                    status: 'error',
                    code: 500,
                    data: errArray,
                    message: 'Internal Server Error',
                });
            } else {
                await connection.commit();
            }

            get_room = await table_rooms.getRoom(connection,login_email,login_email,FRIEND_EMAIL)
        }

        get_room[0]['token'] = jwt.sign(get_room[0],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });

        response.status(200).json({
            status: 'success',
            get_room: get_room[0],
            message: 'Success',
        });

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}

/**
 * 帳號相關api
 */
exports.rooms = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='getRooms') {
        getRooms(request,response);
    } else if (params.method=='getRoom') {
        getRoom(request,response);
    }
    /**
     * 錯誤呼叫
     */
    else {
        response.status(500).json({
            status: 'error',
            code: 500,
            message: '方法錯誤!',
        });
    }

}