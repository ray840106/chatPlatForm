require('dotenv').config()
const conn = require('../models/db_conn')
const table_sticker = require("../models/table_sticker");
const table_own_sticker = require("../models/table_own_sticker");
const table_sticker_group = require('../models/table_sticker_group');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const {SECRET,EXPIRES_IN}=process.env;

/**
 * 查詢自己販賣的貼圖或商店貼圖
 */
async function getMyStickers(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    // 是否為商店
    let store_TF = request.body.store_TF;
    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        // 查詢自己貼圖群
        let get_sticker_group = await table_sticker_group.getStickerGroup(connection,store_TF?'':login_email)
        for (let i=0;i<get_sticker_group.length;i++) {
            const s = uuidv4()
            get_sticker_group[i]['order'] = {
                orderId: s.replace(/-/g, '').substr(s.length - 24),
                amount: get_sticker_group[i]['PRICE'],
                currency: "TWD",
                packages: [
                    {
                        id: get_sticker_group[i]['STICKER_GROUP_ID'],
                        amount: get_sticker_group[i]['PRICE'],
                        products: [
                            {
                                name: get_sticker_group[i]['STICKER_NAME'],
                                quantity: 1,
                                price: get_sticker_group[i]['PRICE'],
                            },
                        ],
                    },
                ],
            }

            get_sticker_group[i]['token'] = jwt.sign(get_sticker_group[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_sticker_group: get_sticker_group,
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
 * 新增自己販賣的貼圖
 */
async function insMyStickers(request, response) {
    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    const connection = await conn.getConnection();
    await connection.beginTransaction();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;
        let {PRICE,STICKER_NAME,PREVIEW_INDEX} = data.sticker;
        let stickerUrls = data.stickerUrls;
        let GROUP_ID = uuidv4();

        let PREVIEW = stickerUrls.filter((item)=>item.ORD==PREVIEW_INDEX)
        console.log('PREVIEW',PREVIEW)
        // 新增貼圖群
        let ins_sticker_group = await table_sticker_group.insStickerGroup(connection,GROUP_ID,login_email,PRICE,STICKER_NAME,PREVIEW[0].IMG_SRC,PREVIEW_INDEX)
        if (!ins_sticker_group.done_TF) {
            throw ins_sticker_group;
        }

        // 新增貼圖
        for (let i=0;i<stickerUrls.length;i++) {
            let {ORD,IMG_SRC} = stickerUrls[i];
            let STICKER_ID = uuidv4();
            let ins_sticker = await table_sticker.insSticker(connection,STICKER_ID,GROUP_ID,ORD,IMG_SRC)
            if (!ins_sticker.done_TF) {
                throw ins_sticker;
            }
        }

        // 查詢貼圖群
        let get_sticker_group = await table_sticker_group.getStickerGroup(connection,login_email)
        for (let i=0;i<get_sticker_group.length;i++) {
            const s = uuidv4();
            get_sticker_group[i]['order'] = {
                orderId: s.replace(/-/g, '').substr(s.length - 24),
                amount: get_sticker_group[i]['PRICE'],
                currency: "TWD",
                packages: [
                    {
                        id: get_sticker_group[i]['STICKER_GROUP_ID'],
                        amount: get_sticker_group[i]['PRICE'],
                        products: [
                            {
                                name: get_sticker_group[i]['STICKER_NAME'],
                                quantity: 1,
                                price: get_sticker_group[i]['PRICE'],
                            },
                        ],
                    },
                ],
            }
            get_sticker_group[i]['token'] = jwt.sign(get_sticker_group[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        await connection.commit();
        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_sticker_group: get_sticker_group,
        });

    } catch (e) {
        await connection.rollback();
        response.status(500).json({
            status: 'error',
            code: 500,
            done_TF: false,
            data: e,
            message: 'Internal Server Error2',
        });
    }
}

/**
 * 更新自己販賣的貼圖
 */
async function updMyStickers(request, response) {
    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    const connection = await conn.getConnection();
    await connection.beginTransaction();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.sticker.token, SECRET);
        let STICKER_GROUP_ID = item.STICKER_GROUP_ID

        let {PRICE,STICKER_NAME,PREVIEW_INDEX} = data.sticker;
        let stickerUrls = data.stickerUrls;

        let PREVIEW = stickerUrls.filter((item)=>item.ORD==PREVIEW_INDEX)[0]
        // 新增貼圖群
        let upd_sticker_group = await table_sticker_group.updStickerGroup(connection,STICKER_GROUP_ID,STICKER_NAME,PRICE,PREVIEW.IMG_SRC,PREVIEW_INDEX)
        if (!upd_sticker_group.done_TF) {
            throw upd_sticker_group;
        }

        // 刪除貼圖
        let del_sticker = await table_sticker.delSticker(connection,STICKER_GROUP_ID)
        if (!del_sticker.done_TF) {
            throw del_sticker;
        }

        // 新增貼圖
        for (let i=0;i<stickerUrls.length;i++) {
            let {ORD,IMG_SRC} = stickerUrls[i];
            let STICKER_ID = uuidv4();
            let ins_sticker = await table_sticker.insSticker(connection,STICKER_ID,STICKER_GROUP_ID,ORD,IMG_SRC)
            if (!ins_sticker.done_TF) {
                throw ins_sticker;
            }
        }

        // 查詢貼圖群
        let get_sticker_group = await table_sticker_group.getStickerGroup(connection,login_email)
        for (let i=0;i<get_sticker_group.length;i++) {
            const s = uuidv4();
            get_sticker_group[i]['order'] = {
                orderId: s.replace(/-/g, '').substr(s.length - 24),
                amount: get_sticker_group[i]['PRICE'],
                currency: "TWD",
                packages: [
                    {
                        id: get_sticker_group[i]['STICKER_GROUP_ID'],
                        amount: get_sticker_group[i]['PRICE'],
                        products: [
                            {
                                name: get_sticker_group[i]['STICKER_NAME'],
                                quantity: 1,
                                price: get_sticker_group[i]['PRICE'],
                            },
                        ],
                    },
                ],
            }
            get_sticker_group[i]['token'] = jwt.sign(get_sticker_group[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        await connection.commit();
        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
            get_sticker_group: get_sticker_group,
        });

    } catch (e) {
        await connection.rollback();
        response.status(500).json({
            status: 'error',
            code: 500,
            done_TF: false,
            data: e,
            message: 'Internal Server Error2',
        });
    }
}

/**
 * 查詢該貼圖群所有貼圖
 */
async function getStickers(request, response) {
    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.sticker_group.token, SECRET);
        let STICKER_GROUP_ID = item.STICKER_GROUP_ID

        // 查詢自己貼圖
        let get_sticker = await table_sticker.getSticker(connection,STICKER_GROUP_ID)
        for (let i=0;i<get_sticker.length;i++) {
            get_sticker[i]['token'] = jwt.sign(get_sticker[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        // 查詢自己貼圖群
        let get_sticker_group = await table_sticker_group.getStickerGroup(connection,'',STICKER_GROUP_ID)
        for (let i=0;i<get_sticker_group.length;i++) {
            const s = uuidv4();
            get_sticker_group[i]['order'] = {
                orderId: s.replace(/-/g, '').substr(s.length - 24),
                amount: get_sticker_group[i]['PRICE'],
                currency: "TWD",
                packages: [
                    {
                        id: get_sticker_group[i]['STICKER_GROUP_ID'],
                        amount: get_sticker_group[i]['PRICE'],
                        products: [
                            {
                                name: get_sticker_group[i]['STICKER_NAME'],
                                quantity: 1,
                                price: get_sticker_group[i]['PRICE'],
                            },
                        ],
                    },
                ],
            }
            get_sticker_group[i]['token'] = jwt.sign(get_sticker_group[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        response.status(200).json({
            status: 'success',
            get_sticker: get_sticker,
            get_sticker_group: get_sticker_group[0],
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
 * 刪除貼圖群
 */
async function delMyStickers(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    await connection.beginTransaction()
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.sticker_group[0].token, SECRET);
        let STICKER_GROUP_ID = item.STICKER_GROUP_ID


        // 刪除貼圖群
        let del_sticker_group = await table_sticker_group.delStickerGroup(connection,STICKER_GROUP_ID)
        if (!del_sticker_group.done_TF) {
            throw del_sticker_group;
        }

        // 刪除貼圖
        let del_sticker = await table_sticker.delSticker(connection,STICKER_GROUP_ID)
        if (!del_sticker.done_TF) {
            throw del_sticker;
        }

        // 查詢貼圖群
        let get_sticker_group = await table_sticker_group.getStickerGroup(connection,login_email)
        for (let i=0;i<get_sticker_group.length;i++) {
            const s = uuidv4();
            get_sticker_group[i]['order'] = {
                orderId: s.replace(/-/g, '').substr(s.length - 24),
                amount: get_sticker_group[i]['PRICE'],
                currency: "TWD",
                packages: [
                    {
                        id: get_sticker_group[i]['STICKER_GROUP_ID'],
                        amount: get_sticker_group[i]['PRICE'],
                        products: [
                            {
                                name: get_sticker_group[i]['STICKER_NAME'],
                                quantity: 1,
                                price: get_sticker_group[i]['PRICE'],
                            },
                        ],
                    },
                ],
            }
            get_sticker_group[i]['token'] = jwt.sign(get_sticker_group[i],  SECRET, { expiresIn: EXPIRES_IN });
        }

        await connection.commit();
        response.status(200).json({
            done_TF: true,
            status: 'success',
            get_sticker_group: get_sticker_group,
            message: 'Success',
        });

    } catch (e) {
        await connection.rollback();
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
 * 查詢自己購買的貼圖
 */
async function getOwnStickers(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let get_sticker_list = await table_own_sticker.getStickerList(connection,login_email,'',1,'');
        for(let i=0;i<get_sticker_list.length;i++) {
            let item = get_sticker_list[i];
            let STICKER_GROUP_ID = item.STICKER_GROUP_ID;
            let get_sticker_group = await table_sticker_group.getStickerGroup(connection,'',STICKER_GROUP_ID)
            let get_sticker = await table_sticker.getSticker(connection,STICKER_GROUP_ID)
            item.PREVIEW = get_sticker_group[0].PREVIEW;
            item.stickers = get_sticker;
        }

        response.status(200).json({
            done_TF: true,
            status: 'success',
            own_sticker_list: get_sticker_list,
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
exports.stickers = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='getMyStickers') {
        getMyStickers(request,response);
    } else if (params.method=='insMyStickers') {
        insMyStickers(request,response);
    } else if (params.method=='updMyStickers') {
        updMyStickers(request,response);
    } else if (params.method=='delMyStickers') {
        delMyStickers(request,response);
    } else if (params.method=='getStickers') {
        getStickers(request,response);
    } else if (params.method=='getOwnStickers') {
        getOwnStickers(request,response);
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