require('dotenv').config()
let conn = require('../db/db_conn')
let table_friends = require('../db/table_friends')
let table_user = require('../db/table_user')
const jwt = require("jsonwebtoken");

/**
 * 新增好友
 */
async function insFriend(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    let errArray=[];

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let email = data.email

        await connection.beginTransaction()

        let emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

        // 驗證信箱格式
        if (!email || email.search(emailRule)== -1) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: 'Email address is invalid.',
            });
        }

        // 驗證信箱格式
        let user_info = await table_user.userInfo(connection,email)
        if (user_info.length==0) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: "Can't find!",
            });
        }

        // 新增好友
        let ins_friend = await table_friends.insFriend(connection,login_email,email,-201)
        if (!ins_friend.done_TF) {
            errArray.push(ins_friend);
        }

        // 新增好友
        let ins_friend2 = await table_friends.insFriend(connection,email,login_email,-200)
        if (!ins_friend2.done_TF) {
            errArray.push(ins_friend2);
        }

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
 * 查詢好友清單
 */
async function getFriends(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        // 驗證信箱格式
        let get_friends = await table_friends.getFriends(connection,login_email)
        for (let i=0;i<get_friends.length;i++) {
            get_friends[i]['token'] = jwt.sign(get_friends[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_friends: get_friends,
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
 * 查詢好友
 */
async function getFriend(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let FRIEND_EMAIL = item.FRIEND_EMAIL

        // 驗證信箱格式
        let get_friend = await table_friends.getFriend(connection,FRIEND_EMAIL,login_email)
        for (let i=0;i<get_friend.length;i++) {
            get_friend[i]['token'] = jwt.sign(get_friend[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_friend: get_friend[0],
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
 * 更新好友狀態
 */
async function updFriend(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    let errArray=[];

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let FRIEND_EMAIL = item.FRIEND_EMAIL
        let STATUS = data.item.STATUS

        await connection.beginTransaction()

        // 驗證信箱格式
        let upd_friend = await table_friends.updFriend(connection,STATUS,login_email,FRIEND_EMAIL)
        if (!upd_friend.done_TF) {
            errArray.push(upd_friend);
        }

        // 驗證信箱格式
        let upd_friend2 = await table_friends.updFriend(connection,STATUS,FRIEND_EMAIL,login_email)
        if (!upd_friend2.done_TF) {
            errArray.push(upd_friend2);
        }

        // 驗證信箱格式
        let get_friends = await table_friends.getFriends(connection,login_email)
        for (let i=0;i<get_friends.length;i++) {
            get_friends[i]['token'] = jwt.sign(get_friends[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

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
            get_friends: get_friends,
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
 * 刪除好友或拒絕好友申請
 */
async function delFriend(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    let errArray=[];

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let FRIEND_EMAIL = item.FRIEND_EMAIL

        await connection.beginTransaction()

        // 驗證信箱格式
        let del_friend = await table_friends.delFriend(connection,login_email,FRIEND_EMAIL)
        if (!del_friend.done_TF) {
            errArray.push(del_friend);
        }

        // 驗證信箱格式
        let del_friend2 = await table_friends.delFriend(connection,FRIEND_EMAIL,login_email)
        if (!del_friend2.done_TF) {
            errArray.push(del_friend2);
        }

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

        // 驗證信箱格式
        let get_friends = await table_friends.getFriends(connection,login_email)
        for (let i=0;i<get_friends.length;i++) {
            get_friends[i]['token'] = jwt.sign(get_friends[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_friends: get_friends,
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
exports.friends = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='insFriend') {
        insFriend(request, response)
    } else if (params.method=='getFriends') {
        getFriends(request,response);
    } else if (params.method=='getFriend') {
        getFriend(request,response);
    } else if (params.method=='updFriend') {
        updFriend(request,response);
    } else if (params.method=='delFriend') {
        delFriend(request,response);
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




