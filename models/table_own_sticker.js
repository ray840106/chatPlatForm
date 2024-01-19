
/**
 * 新增聊天室
 * @param conn
 * @param STICKER_GROUP_ID 貼圖群ID
 * @param EMAIL 購買使用者
 * @param ORDERID 訂單編號
 * @param PRICE 價錢
 * @returns {Promise<unknown>}
 */
exports.insOwnSticker = async function(conn,STICKER_GROUP_ID,EMAIL,ORDERID,STATUS,PRICE){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.own_sticker (STICKER_GROUP_ID,EMAIL,ORDERID,STATUS,PRICE,INS_DATE) VALUES (?,?,?,?,?,sysdate()); '
            ,[STICKER_GROUP_ID,EMAIL,ORDERID,STATUS,PRICE]
        );
        result['done_TF'] = true;
        result['results'] = results;
        return result;
    } catch (err) {
        result['done_TF'] = false;
        result['err'] = err;
        return result;
    }
}

/**
 * 購買紀錄
 * @param conn
 * @param EMAIL 使用者
 * @param ORDERID 訂單編號
 * @param STATUS 訂單狀態
 * @param STICKER_GROUP_ID 貼圖群編號
 * @returns {Promise<unknown>}
 */
exports.getStickerList = async function(conn,EMAIL='',ORDERID='',STATUS=-1,STICKER_GROUP_ID=''){
    try{
        let sql = ' SELECT STICKER_GROUP_ID,EMAIL,ORDERID,STATUS,PRICE,INS_DATE FROM chat.own_sticker WHERE EMAIL is not null ';
        let promise = []
        if (EMAIL!='') {
            sql += 'AND EMAIL=? ';
            promise.push(EMAIL)
        }
        if (ORDERID!='') {
            sql += 'AND ORDERID=? ';
            promise.push(ORDERID)
        }
        if (STATUS>=0) {
            sql += 'AND STATUS=? ';
            promise.push(STATUS)
        }
        if (STICKER_GROUP_ID!='') {
            sql += 'AND STICKER_GROUP_ID=? ';
            promise.push(STICKER_GROUP_ID)
        }
        let getData = await conn.query(sql,promise);
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 更新貼圖群
 * @param conn
 * @param STATUS 訂單狀態
 * @param ORDERID 訂單編號
 * @returns {Promise<unknown>}
 */
exports.updOwnSticker = async function(conn,STATUS,ORDERID){
    let result = {};
    try{
        let results = await conn.query(
            ' update chat.own_sticker set STATUS=?,UPD_DATE=sysdate() where ORDERID=?; '
            ,[STATUS,ORDERID]
        );
        result['done_TF'] = true;
        result['results'] = results;
        return result;
    } catch (err) {
        result['done_TF'] = false;
        result['err'] = err;
        return result;
    }
}