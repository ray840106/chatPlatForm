
/**
 * 新增聊天室
 * @param conn
 * @param GROUP_ID 貼圖群ID
 * @param EMAIL 作者
 * @param PRICE 價錢
 * @param STICKER_NAME 貼圖名稱
 * @param PREVIEW 預覽圖片
 * @param STICKER_GROUP_ID 貼圖群ID
 * @returns {Promise<unknown>}
 */
exports.insStickerGroup = async function(conn,GROUP_ID,EMAIL,PRICE,STICKER_NAME,PREVIEW,PREVIEW_INDEX){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.sticker_group (STICKER_GROUP_ID,PAINTER,PRICE,STICKER_NAME,PREVIEW,PREVIEW_INDEX,INS_DATE) VALUES (?,?,?,?,?,?,sysdate()); '
            ,[GROUP_ID,EMAIL,PRICE,STICKER_NAME,PREVIEW,PREVIEW_INDEX]
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
 * 查詢貼圖群
 * @param conn
 * @param EMAIL 作者
 * @param STICKER_GROUP_ID 貼圖群ID
 * @returns {Promise<unknown>}
 */
exports.getStickerGroup = async function(conn,EMAIL='',STICKER_GROUP_ID=''){
    try{
        let sql = ' SELECT STICKER_GROUP_ID,PAINTER,PRICE,PREVIEW,STICKER_NAME,PREVIEW_INDEX FROM chat.sticker_group A ';
        let parameter = [];
        if (EMAIL!=''){
            sql += " WHERE PAINTER=? ";
            parameter.push(EMAIL);
        }
        if (STICKER_GROUP_ID!=''){
            sql += " WHERE STICKER_GROUP_ID=? ";
            parameter.push(STICKER_GROUP_ID);
        }
        if (STICKER_GROUP_ID==''&&EMAIL=='') {
            sql += " WHERE NOT EXISTS (SELECT distinct STICKER_GROUP_ID FROM chat.own_sticker B WHERE A.STICKER_GROUP_ID=B.STICKER_GROUP_ID and B.STATUS=1) ";
        }
        let getData = await conn.query(sql,parameter);
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 更新貼圖群
 * @param conn
 * @param STICKER_GROUP_ID 貼圖群ID
 * @param STICKER_NAME 貼圖名稱
 * @param PRICE 價錢
 * @param PREVIEW 預覽圖片
 * @param PREVIEW_INDEX 預覽圖片index
 * @returns {Promise<unknown>}
 */
exports.updStickerGroup = async function(conn,STICKER_GROUP_ID,STICKER_NAME,PRICE,PREVIEW,PREVIEW_INDEX){
    let result = {};
    try{
        let results = await conn.query(
            ' update chat.sticker_group set STICKER_NAME=? ,PRICE=? ,PREVIEW=?,PREVIEW_INDEX=?,UPD_DATE=sysdate() where STICKER_GROUP_ID=?; '
            ,[STICKER_NAME,PRICE,PREVIEW,PREVIEW_INDEX,STICKER_GROUP_ID]
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
 * 刪除貼圖群
 * @param conn
 * @param STICKER_GROUP_ID 貼圖群ID
 * @returns {Promise<unknown>}
 */
exports.delStickerGroup = async function(conn,STICKER_GROUP_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.sticker_group WHERE STICKER_GROUP_ID=?; '
            ,[STICKER_GROUP_ID]
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