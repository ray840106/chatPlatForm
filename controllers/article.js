require('dotenv').config()
let conn = require('../models/db_conn')
let table_article = require('../models/table_article')
let table_article_photo = require('../models/table_article_photo')
let table_article_like = require('../models/table_article_like')
let table_article_reply = require('../models/table_article_reply')
const {getFile} = require("./headFile");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

/**
 * 新增文章
 */
async function insArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    await connection.beginTransaction()
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let article_id = uuidv4()

        let article = data.article
        let content = article.CONTENT

        let imgUrls = data.imgUrls

        // 新增文章
        let ins_article = await table_article.insArticle(connection,article_id,login_email,content)
        if (!ins_article.done_TF) {
            throw ins_article;
        }

        for (let i=0;i<imgUrls.length;i++) {
            let item = imgUrls[i]
            let img_base64 = item.IMG_SRC
            let img_ord = item.ORD
            // 新增文章照片
            let ins_article_photo = await table_article_photo.insArticlePhoto(connection,article_id,img_base64,img_ord)
            if (!ins_article_photo.done_TF) {
                throw ins_article_photo;
            }
        }

        let get_article = await table_article.getArticles(connection)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = false;
            item['haveLike'] = false;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        await connection.commit()
        response.status(200).json({
            status: 'success',
            done_TF: true,
            get_article: get_article,
            message: 'Success',
        });

    } catch (e) {
        await connection.rollback()
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                done_TF: false,
                data: e,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}


/**
 * 查詢文章
 */
async function getArticles(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let friend_email = ''
        if (data.hasOwnProperty('friend')) {
            if (data.friend != '' && data.friend != null) {
                let item = jwt.verify(data.friend, process.env.SECRET);
                friend_email = item.FRIEND_EMAIL
            }
        }
        if (data.path=='/personal') {
            friend_email = login_email
        }

        let get_article = await table_article.getArticles(connection,friend_email)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_article: get_article,
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
 * 查詢好友文章
 */
async function getFriendArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let FRIEND_EMAIL = item.FRIEND_EMAIL

        let get_article = await table_article.getArticles(connection,FRIEND_EMAIL)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_article: get_article,
            message: 'Success',
            test: 'Success',
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
 * 更新文章
 */
async function updArticle(request, response) {

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
 * 刪除文章
 */
async function delArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let ARTICLE_ID = item.ARTICLE_ID


        // 驗證信箱格式
        let del_article = await table_article.delArticle(connection,ARTICLE_ID,login_email)
        if (!del_article.done_TF) {
            throw del_article;
        }

        // 驗證信箱格式
        let get_article = await table_article.getArticles(connection)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_article: get_article,
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
 * 文章按讚
 */
async function likeArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    await connection.beginTransaction()
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, process.env.SECRET);
        let ARTICLE_ID = item.ARTICLE_ID

        let get_article_like = [];

        if (item.hasOwnProperty('REPLY_ARTICLE_ID')) {
            let REPLY_ARTICLE_ID = item.REPLY_ARTICLE_ID
            get_article_like = await table_article_like.getArticleLike(connection,REPLY_ARTICLE_ID,login_email)
            if (get_article_like.length) {
                let article_reply_like = await table_article_reply.updArticleReplyLike(connection,REPLY_ARTICLE_ID,-1)
                if (!article_reply_like.done_TF) {
                    throw article_reply_like
                }
                let del_article_like = await table_article_like.delArticleLike(connection,login_email,REPLY_ARTICLE_ID)
                if (!del_article_like.done_TF) {
                    throw del_article_like
                }
            } else {
                let upd_article_like = await table_article_reply.updArticleReplyLike(connection,REPLY_ARTICLE_ID,1)
                if (!upd_article_like.done_TF) {
                    throw upd_article_like
                }
                let ins_article_like = await table_article_like.insArticleLike(connection,REPLY_ARTICLE_ID,login_email)
                if (!ins_article_like.done_TF) {
                    throw ins_article_like
                }
            }
        } else {
            get_article_like = await table_article_like.getArticleLike(connection,ARTICLE_ID,login_email)
            if (get_article_like.length) {
                let upd_article_like = await table_article.updArticleLike(connection,ARTICLE_ID,-1)
                if (!upd_article_like.done_TF) {
                    throw upd_article_like
                }
                let del_article_like = await table_article_like.delArticleLike(connection,login_email,ARTICLE_ID)
                if (!del_article_like.done_TF) {
                    throw del_article_like
                }
            } else {
                let upd_article_like = await table_article.updArticleLike(connection,ARTICLE_ID,1)
                if (!upd_article_like.done_TF) {
                    throw upd_article_like
                }
                let ins_article_like = await table_article_like.insArticleLike(connection,ARTICLE_ID,login_email)
                if (!ins_article_like.done_TF) {
                    throw ins_article_like
                }
            }
        }

        let get_article = await table_article.getArticles(connection,'',ARTICLE_ID)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        let article_reply = await table_article_reply.getArticleReply(connection,ARTICLE_ID);
        for (let i=0;i<article_reply.length;i++) {
            let replyItem = article_reply[i];
            let reply_article_id = replyItem.REPLY_ARTICLE_ID;
            let article = replyItem.REPLY_AUTHOR;
            let article_reply2 = await table_article_reply.getArticleReply(connection,reply_article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,reply_article_id,login_email)
            let get_file = await getFile('headshot',article)

            replyItem['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            replyItem['haveReply'] = article_reply2.length>0;
            replyItem['haveLike'] = article_like.length>0;
            replyItem['token'] = jwt.sign(replyItem,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        await connection.commit()
        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_article: get_article[0],
            article_reply: article_reply,
        });

    } catch (e) {
        await connection.rollback()
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                done_TF: false,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}

/**
 * 文章回復
 */
async function replyArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    await connection.beginTransaction()
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;
        let replyItem = data.replyItem;

        let item = jwt.verify(replyItem.token, process.env.SECRET);
        let ARTICLE_ID = item.ARTICLE_ID
        let CONTENT = replyItem.replyText

        let REPLY_ARTICLE_ID_new = uuidv4();
        if (item.hasOwnProperty('REPLY_ARTICLE_ID')) {
            let REPLY_ARTICLE_ID = item.REPLY_ARTICLE_ID
            let get_article = await table_article_reply.getArticleReply(connection,REPLY_ARTICLE_ID)
            let FLOOR = 1;
            if (get_article.length) {
                let articleItem = get_article[0];
                FLOOR = articleItem.FLOOR+1;
            }

            let get_article2 = await table_article_reply.getArticleReply(connection,'','',REPLY_ARTICLE_ID)
            let articleItem2 = get_article2[0];
            let LEVEL = articleItem2.LEVEL+1;

            let ins_article_reply = await table_article_reply.insArticleReply(connection,REPLY_ARTICLE_ID,login_email,CONTENT,FLOOR,REPLY_ARTICLE_ID_new,LEVEL)
            if (!ins_article_reply.done_TF) {
                throw ins_article_reply
            }
            let upd_article_like = await table_article_reply.updArticleReplyReply(connection,REPLY_ARTICLE_ID,1)
            if (!upd_article_like.done_TF) {
                throw upd_article_like
            }
        } else {
            let get_article = await table_article.getArticles(connection,'',ARTICLE_ID)
            let articleItem = get_article[0];
            let FLOOR = articleItem.REPLY_COUNT+1;

            let ins_article_reply = await table_article_reply.insArticleReply(connection,ARTICLE_ID,login_email,CONTENT,FLOOR,REPLY_ARTICLE_ID_new,1)
            if (!ins_article_reply.done_TF) {
                throw ins_article_reply
            }
            let upd_article_like = await table_article.updArticleReply(connection,ARTICLE_ID,1)
            if (!upd_article_like.done_TF) {
                throw upd_article_like
            }
        }

        let article_reply = await table_article_reply.getArticleReply(connection,ARTICLE_ID);
        for (let i=0;i<article_reply.length;i++) {
            let replyItem = article_reply[i];
            let reply_article_id = replyItem.REPLY_ARTICLE_ID;
            let article = replyItem.REPLY_AUTHOR;

            let article_reply2 = await table_article_reply.getArticleReply(connection,reply_article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,reply_article_id,login_email)
            let get_file = await getFile('headshot',article)

            replyItem['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            replyItem['haveReply'] = article_reply2.length>0;
            replyItem['haveLike'] = article_like.length>0;
            replyItem['token'] = jwt.sign(replyItem,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        let get_article = await table_article.getArticles(connection,'',ARTICLE_ID)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        await connection.commit()
        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_article_reply: article_reply,
            get_article: get_article[0],
        });

    } catch (e) {
        await connection.rollback()
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                done_TF: false,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}

/**
 * 取得文章回復
 */
async function geyReplyArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let replyItem = data.replyItem;
        let item = jwt.verify(replyItem.token, process.env.SECRET);
        let ARTICLE_ID = item.ARTICLE_ID

        if (item.hasOwnProperty('REPLY_ARTICLE_ID')) {
            ARTICLE_ID = item.REPLY_ARTICLE_ID
        }

        let article_reply = await table_article_reply.getArticleReply(connection,ARTICLE_ID);
        for (let i=0;i<article_reply.length;i++) {
            let replyItem = article_reply[i];
            let reply_article_id = replyItem.REPLY_ARTICLE_ID;
            let article = replyItem.REPLY_AUTHOR;

            let article_reply2 = await table_article_reply.getArticleReply(connection,reply_article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,reply_article_id,login_email)
            let get_file = await getFile('headshot',article)

            replyItem['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            replyItem['haveReply'] = article_reply2.length>0;
            replyItem['haveLike'] = article_like.length>0;
            replyItem['token'] = jwt.sign(replyItem,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        let get_article = await table_article.getArticles(connection,'',ARTICLE_ID)
        for (let i=0;i<get_article.length;i++) {
            let item = get_article[i];
            let article_id = item.ARTICLE_ID;
            let article = item.AUTHOR;

            let article_reply = await table_article_reply.getArticleReply(connection,article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,article_id,login_email)
            let article_img = await table_article_photo.getArticlePhoto(connection,article_id)
            let get_file = await getFile('headshot',article)

            item['article_img'] = article_img;
            item['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            item['sn'] = 0;
            item['haveReply'] = article_reply.length>0;
            item['haveLike'] = article_like.length>0;
            item['token'] = jwt.sign(item,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_article_reply: article_reply,
            get_article: get_article[0],
        });

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                done_TF: false,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }
}

/**
 * 取得文章回復
 */
async function geyBackReplyArticle(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let replyItem = data.replyItem;
        let item = jwt.verify(replyItem.token, process.env.SECRET);
        let ARTICLE_ID = item.ARTICLE_ID

        if (item.hasOwnProperty('REPLY_ARTICLE_ID')) {
            ARTICLE_ID = item.REPLY_ARTICLE_ID
        }

        let get_article_id = await table_article_reply.getArticleReply(connection,'','',ARTICLE_ID);
        let article_reply = await table_article_reply.getArticleReply(connection,get_article_id[0].ARTICLE_ID);
        for (let i=0;i<article_reply.length;i++) {
            let replyItem = article_reply[i];
            let reply_article_id = replyItem.REPLY_ARTICLE_ID;
            let article = replyItem.REPLY_AUTHOR;

            let article_reply2 = await table_article_reply.getArticleReply(connection,reply_article_id,login_email)
            let article_like = await table_article_like.getArticleLike(connection,reply_article_id,login_email)
            let get_file = await getFile('headshot',article)

            replyItem['headshot'] = get_file.data.length>0 ? get_file.data[0].file_path:'';
            replyItem['haveReply'] = article_reply2.length>0;
            replyItem['haveLike'] = article_like.length>0;
            replyItem['token'] = jwt.sign(replyItem,  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }


        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_article_reply: article_reply,
        });

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                done_TF: false,
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
exports.article = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='insArticle') {
        insArticle(request, response);
    } else if (params.method=='getArticles') {
        getArticles(request,response);
    } else if (params.method=='getArticle') {
        getArticle(request,response);
    } else if (params.method=='updArticle') {
        updArticle(request,response);
    } else if (params.method=='delArticle') {
        delArticle(request,response);
    } else if (params.method=='likeArticle') {
        likeArticle(request,response);
    } else if (params.method=='replyArticle') {
        replyArticle(request,response);
    } else if (params.method=='geyReplyArticle') {
        geyReplyArticle(request,response);
    } else if (params.method=='geyBackReplyArticle') {
        geyBackReplyArticle(request,response);
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