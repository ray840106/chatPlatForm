
/**
 * 查詢密碼
 * @param conn
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.passwordGet = async function(conn,EMAIL){
    try{
        let getData = await conn.query('select PASSWORD,LOGIN_EXP,LOGIN_COUNT from chat.login where EMAIL=? ',[EMAIL])
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 更新登入次數與有效時間
 * @param conn
 * @param LOGIN_COUNT 登入次數
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.updLogin = async function(conn,LOGIN_COUNT,EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.login set LOGIN_COUNT=?,LOGIN_EXP = DATE_ADD( sysdate(), INTERVAL 5 minute) where EMAIL=?; '
            ,[LOGIN_COUNT,EMAIL]
        )
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
 * 更新登入次數與有效時間
 * @param conn
 * @param LOGIN_COUNT 登入次數
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.updErrorLogin = async function(conn,LOGIN_COUNT,EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.login set LOGIN_COUNT=? where EMAIL=?; '
            ,[LOGIN_COUNT,EMAIL]
        )
        result['done_TF'] = true;
        result['results'] = results;
        return result;
    } catch (err) {
        result['done_TF'] = false;
        result['err'] = err;
        return result;
    }
}