const express = require('express')
const router = express.Router()
const conn = require("./models/db_conn");
let file_api = require('./controllers/file')
let auth_api = require('./controllers/auth')
let rooms_api = require('./controllers/rooms')
let payment_api = require('./controllers/payment')
let article_api = require('./controllers/article')
let friends_api = require('./controllers/friends')
let messages_api = require('./controllers/messages')
let stickers_api = require('./controllers/stickers')
let table_own_sticker = require("./models/table_own_sticker");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const {HmacSHA256} = require("crypto-js");
const Base64 = require("crypto-js/enc-base64");
const ecpay_payment = require("ecpay_aio_nodejs");
//const {LINE_PAY_SECRET,LINE_PAY_VERSION,LINE_PAY_CHANNELID,LINE_PAY_SITE,ECPAY_MERCHANTID, ECPAY_HASHKEY, ECPAY_HASHIV, HOST, SECRET}=process.env;

const SECRET='rayChatPlat'
const HOST='https://social.azurewebsites.net'
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
    login, register
 */
router.post('/auth', auth_api.auth)

/**
 CRUD Friend information
 */
router.post('/friends', friends_api.friends)

/**
 CRUD Room information
 */
router.post('/rooms', rooms_api.rooms)

/**
 CRUD Message information
 */
router.post('/messages', messages_api.messages)

/**
 CRUD file
 */
router.post('/file', file_api.file)

/**
 CRUD stickers
 */
router.post('/stickers', stickers_api.stickers)

/**
 CRUD article
 */
router.post('/article', article_api.article)

/**
 CRUD payment
 */
router.post('/payment', payment_api.payment)
router.get('/linePay/confirm',async (req,res)=>{
    const { transactionId,orderId } = req.query;
    const connection = await conn.getConnection();
    try{
        // 購買貼圖群
        let upd_own_sticker = await table_own_sticker.updOwnSticker(connection,1,orderId)
        if (!upd_own_sticker.done_TF) {
            throw upd_own_sticker;
        }

        let get_sticker_list = await table_own_sticker.getStickerList(connection,'',orderId)
        const linePayBody = {
            amount: get_sticker_list[0].PRICE,
            currency: 'TWD',
        }
        const uri = `/payments/${transactionId}/confirm`;
        const nonce = orderId;
        const string = `${LINE_PAY_SECRET}/${LINE_PAY_VERSION}${uri}${JSON.stringify(linePayBody)}${nonce}`
        const signature = Base64.stringify(HmacSHA256(string,LINE_PAY_SECRET))
        const headers = {
            "Content-Type": "application/json",
            "X-LINE-ChannelId": LINE_PAY_CHANNELID,
            "X-LINE-Authorization-Nonce": nonce,
            "X-LINE-Authorization": signature,
        }
        const url = `${LINE_PAY_SITE}/${LINE_PAY_VERSION}${uri}`;
        const linePayRes = await axios.post(url, linePayBody, { headers });
        res.redirect(`http://localhost:3000/#/stickerStore?orderId=${orderId}&done=${linePayRes?.data?.returnCode === '0000'}`)
    }catch (e) {
        res.status(500).json({
            status: 'error',
            code: 500,
            data: e,
            message: 'Internal Server Error',
        });
    }

})

router.get("/logout",(req,res) => {
    req.session.destroy();
    res.redirect(`/#/login`);
})

module.exports = router
