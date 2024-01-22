require('dotenv').config()
const conn = require('../models/db_conn')
const table_own_sticker = require("../models/table_own_sticker");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { HmacSHA256 } = require("crypto-js");
const Base64 = require("crypto-js/enc-base64");
const ecpay_payment = require('ecpay_aio_nodejs');
//const {SECRET,LINE_RETURN_HOST,LINE_RETURN_CONFIRM_URL,LINE_RETURN_CANCEL_URL,LINE_PAY_SECRET,LINE_PAY_SITE,LINE_PAY_VERSION,LINE_PAY_CHANNELID,ECPAY_MERCHANTID, ECPAY_HASHKEY, ECPAY_HASHIV, HOST}=process.env;

const HOST='https://social.azurewebsites.net'
const SECRET='rayChatPlat'
const LINE_RETURN_HOST='https://social.azurewebsites.net'
const LINE_RETURN_CONFIRM_URL='API/linePay/confirm'
const LINE_RETURN_CANCEL_URL='API/linePay/cancel'
const LINE_PAY_CHANNELID='2002302926'
const LINE_PAY_SECRET='8ae7c30ea299c2f7f43da0b73022f6a4'
const LINE_PAY_VERSION='v3'
const LINE_PAY_SITE='https://sandbox-api-pay.line.me'
const ECPAY_MERCHANTID='3002599'
const ECPAY_HASHKEY='spPjZn66i0OhqJsQ'
const ECPAY_HASHIV='hT5OJckN45isQTTs'

const options = {
    OperationMode: 'Test', //Test or Production
    MercProfile: {
        MerchantID: ECPAY_MERCHANTID,
        HashKey: ECPAY_HASHKEY,
        HashIV: ECPAY_HASHIV,
    },
    IgnorePayment: [
        //    "Credit",
        //    "WebATM",
        //    "ATM",
        //    "CVS",
        //    "BARCODE",
        //    "AndroidPay"
    ],
    IsProjectContractor: false,
};
const MerchantTradeDate = new Date().toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC',
});

/**
 * 購買貼圖，且跟 LINE Pay 串接 API
 */
async function LinePay(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    await connection.beginTransaction()
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, SECRET);
        let STICKER_GROUP_ID = item.STICKER_GROUP_ID
        let PRICE = item.PRICE
        let orderId = item['order'].orderId

        const linePayBody = {
            ...item['order'],
            redirectUrls: {
                confirmUrl: `${LINE_RETURN_HOST}${LINE_RETURN_CONFIRM_URL}`,
                cancelUrl: `${LINE_RETURN_HOST}${LINE_RETURN_CANCEL_URL}`
            }
        }

        let get_sticker_list = await table_own_sticker.getStickerList(connection,login_email,'',1,STICKER_GROUP_ID);
        if (get_sticker_list.length>0) {
            response.status(200).json({
                done_TF: true,
                status: 'success',
                callbackUrl: '',
                message: 'Already have',
            });
            return;
        }

        const uri = '/payments/request';
        const nonce = orderId;
        const string = `${LINE_PAY_SECRET}/${LINE_PAY_VERSION}${uri}${JSON.stringify(linePayBody)}${nonce}`
        const signature = Base64.stringify(HmacSHA256(string,LINE_PAY_SECRET))
        const headers = {
            "Content-Type": "application/json",
            "X-LINE-ChannelId": LINE_PAY_CHANNELID,
            "X-LINE-Authorization-Nonce": nonce,
            "X-LINE-Authorization": signature,
        }
        const url =`${LINE_PAY_SITE}/${LINE_PAY_VERSION}${uri}`;
        const linePayRes = await axios.post(url,linePayBody, {headers});
        if (linePayRes?.data?.returnCode !== "0000") {
            throw linePayRes
            // res.redirect(linePayRes?.data?.info?.paymentUrl.web);
        }

        // 購買貼圖群
        let ins_own_sticker = await table_own_sticker.insOwnSticker(connection,STICKER_GROUP_ID,login_email,orderId,2,PRICE)
        if (!ins_own_sticker.done_TF) {
            throw ins_own_sticker;
        }


        await connection.commit();
        response.status(200).json({
            done_TF: true,
            status: 'success',
            callbackUrl: (linePayRes?.data?.returnCode === "0000")?linePayRes?.data?.info?.paymentUrl.web:'',
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
 * 購買貼圖，且跟 ECPay 串接 API
 */
async function ECPay(request, response) {

    const data = request.body;
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(data.item.token, SECRET);
        let STICKER_GROUP_ID = item.STICKER_GROUP_ID
        let PRICE = item.PRICE
        let orderId = item['order'].orderId

        let base_param = {
            MerchantTradeNo: orderId, //請帶20碼uid, ex: f0a0d7e9fae1bb72bc93
            MerchantTradeDate,
            TotalAmount: PRICE.toString(),
            TradeDesc: '貼圖',
            ItemName: item['STICKER_NAME'],
            ReturnURL: `${HOST}payment?method=ECPayConfirm`,
            ClientBackURL: `${HOST}payment?method=ECPayClientReturn`,
        };

        let get_sticker_list = await table_own_sticker.getStickerList(connection,login_email,'',1,STICKER_GROUP_ID);
        if (get_sticker_list.length>0) {
            response.status(200).json({
                done_TF: true,
                status: 'success',
                callbackUrl: '',
                message: 'Already have',
            });
            return;
        }

        // // 購買貼圖群
        // let ins_own_sticker = await table_own_sticker.insOwnSticker(connection,STICKER_GROUP_ID,login_email,orderId,2,PRICE)
        // if (!ins_own_sticker.done_TF) {
        //     throw ins_own_sticker;
        // }

        const create = new ecpay_payment(options);

        // 注意：在此事直接提供 html + js 直接觸發的範例，直接從前端觸發付款行為
        const html = create.payment_client.aio_check_out_all(base_param);
        console.log('html',html);
        response.render('index', {
            title: 'Express',
            html,
        });
        // response.redirect(`/views/index.ejs`);

    } catch (e) {
        console.log('e',e)
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

async function ECPayConfirm(request, response) {
    console.log('req.body:', request.body);

    const { CheckMacValue } = request.body;
    const data = { ...request.body };
    delete data.CheckMacValue; // 此段不驗證

    const create = new ecpay_payment(options);
    const checkValue = create.payment_client.helper.gen_chk_mac_value(data);

    console.log(
        '確認交易正確性：',
        CheckMacValue === checkValue,
        CheckMacValue,
        checkValue,
    );

    // 交易成功後，需要回傳 1|OK 給綠界
    response.send('1|OK');
};

// 用戶交易完成後的轉址
async function ECPayClientReturn(request, response) {
    console.log('ECPayClientReturn:', request.body, request.query);

    const connection = await conn.getConnection();
    try {
        // // 購買貼圖群
        // let upd_own_sticker = await table_own_sticker.updOwnSticker(connection,1,orderId)
        // if (!upd_own_sticker.done_TF) {
        //     throw upd_own_sticker;
        // }
    } catch (e) {

    }

    response.redirect(`http://localhost:3000/#/stickerStore`)
    // res.render('return', { query: req.query });
};

/**
 * 帳號相關api
 */
exports.payment = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='LinePay') {
        LinePay(request,response);
    } else if (params.method=='ECPay') {
        ECPay(request,response);
    } else if (params.method=='ECPayConfirm') {
        ECPayConfirm(request,response);
    } else if (params.method=='ECPayClientReturn') {
        ECPayClientReturn(request,response);
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
