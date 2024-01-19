
/**
 * 新增聊天室
 * @param conn
 * @param STICKER_ID 貼圖ID
 * @param GROUP_ID 貼圖群ID
 * @param ORD 排序
 * @param IMG_SRC 圖片
 * @returns {Promise<unknown>}
 */
exports.insSticker = async function(conn,STICKER_ID,GROUP_ID,ORD,IMG_SRC){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.sticker (STICKER_ID,GROUP_ID,ORD,IMG_SRC) VALUES (?,?,?,?); '
            ,[STICKER_ID,GROUP_ID,ORD,IMG_SRC]
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
 * @param GROUP_ID 貼圖群ID
 * @returns {Promise<unknown>}
 */
exports.getSticker = async function(conn,GROUP_ID){
    try{
        let sql = ' SELECT STICKER_ID,GROUP_ID,ORD,IMG_SRC FROM chat.sticker WHERE GROUP_ID=? ORDER BY ORD ';
        let getData = await conn.query(sql,[GROUP_ID]);
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 更新貼圖群
 * @param conn
 * @param STICKER_NAME 貼圖名稱
 * @param PRICE 價錢
 * @param PREVIEW 預覽圖片
 * @param EMAIL 作者
 * @returns {Promise<unknown>}
 */
exports.updSticker = async function(conn,STICKER_NAME,PRICE,PREVIEW,EMAIL){
    let result = {};
    try{
        let results = await conn.query(
            ' update chat.sticker_group set STICKER_NAME=? ,PRICE=? ,PREVIEW=?,UPD_DATE=sysdate() where PAINTER=?; '
            ,[STICKER_NAME,PRICE,PREVIEW,EMAIL]
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
exports.delSticker = async function(conn,STICKER_GROUP_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.sticker WHERE GROUP_ID=?; '
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