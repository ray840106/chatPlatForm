
/**
 * 新增好友
 * @param conn
 * @param EMAIL 電子郵件
 * @param FRIEND_EMAIL 好友EMAIL
 * @param STATE 狀態(-200:申請加入好友，-201:好友請求，1:互相為好友，-1:封鎖狀態)
 * @returns {Promise<unknown>}
 */
exports.insFriend = async function(conn,EMAIL,FRIEND_EMAIL,STATE){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.friends (EMAIL,FRIEND_EMAIL,STATUS) VALUES (?,?,?); '
            ,[EMAIL,FRIEND_EMAIL,STATE]
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
 * 更新好友狀態
 * @param conn
 * @param STATE 狀態(-200:申請加入好友，1:互相為好友，-1:封鎖狀態)
 * @param EMAIL 電子郵件
 * @param FRIEND_EMAIL 好友EMAIL
 * @returns {Promise<unknown>}
 */
exports.updFriend = async function(conn,STATE,EMAIL,FRIEND_EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.friends set STATUS=? where EMAIL=? and FRIEND_EMAIL=?; '
            ,[STATE,EMAIL,FRIEND_EMAIL]
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
 * 刪除好友
 * @param conn
 * @param EMAIL 電子郵件
 * @param FRIEND_EMAIL 好友EMAIL
 * @returns {Promise<unknown>}
 */
exports.delFriend = async function(conn,EMAIL,FRIEND_EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.friends WHERE EMAIL=? and FRIEND_EMAIL=? '
            ,[EMAIL,FRIEND_EMAIL]
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
 * 查詢好友清單
 * @param conn
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.getFriends = async function(conn,EMAIL){
    try{
        let getData = await conn.query(
            '  SELECT FRIEND_EMAIL,STATUS FROM chat.friends a where a.email= ? order by STATUS '
            ,[EMAIL]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 查詢好友
 * @param conn
 * @param FRIEND_EMAIL 好友EMAIL
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.getFriend = async function(conn,FRIEND_EMAIL,EMAIL){
    try{
        let getData = await conn.query(
            ' SELECT b.EMAIL,a.STATUS,b.FIRST_NAME,b.LAST_NAME,b.COMPANY,b.PHONE_NUMBER ' +
            ' FROM chat.friends a ' +
            ' left join chat.user b on a.FRIEND_EMAIL=b.email ' +
            ' where b.email= ? and a.email=? '
            ,[FRIEND_EMAIL,EMAIL]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}