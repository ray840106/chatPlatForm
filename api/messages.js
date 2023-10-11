let conn = require('../db/db_conn')
let table_messages = require('../db/table_messages')
const jwt = require("jsonwebtoken");

/**
 * 新增聊天室訊息
 */
async function insMessage(request, response) {

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
        let ROOMID = item.ROOMID

        let text = data.item.text;
        let textType = data.item.textType;

        // 新增訊息
        let ins_message = await table_messages.insMessage(connection,ROOMID,text,textType,login_email)
        if (!ins_message.done_TF) {
            errArray.push(ins_message);
        }

        let get_messages = await table_messages.getMessages(connection,ROOMID)

        // sql error rollback
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

        response.status(200).json({
            status: 'success',
            get_messages: get_messages,
            message: 'Success',
        });

    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: e,
            message: 'Internal Server Error',
        });
    } finally {
        connection.release();
    }
}


/**
 * 查詢聊天室訊息
 */
async function getMessage(request, response) {

    const data = request.body;

    const connection = await conn.getConnection();
    try {
        let item = jwt.verify(data.item.token, process.env.SECRET);
        let ROOMID = item.ROOMID

        // 驗證信箱格式
        let get_messages = await table_messages.getMessages(connection,ROOMID)

        response.status(200).json({
            status: 'success',
            ROOMID: ROOMID,
            get_messages: get_messages,
            message: 'Success',
        });

    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: e,
            message: 'Internal Server Error',
        });
    } finally {
        connection.release();
    }
}

/**
 * 帳號相關api
 */
exports.messages = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='insMessage') {
       insMessage(request, response)
    } else if (params.method=='getMessage') {
       getMessage(request,response);
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