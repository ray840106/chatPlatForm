
/**
 * 查詢用戶資料
 * @param conn
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.userInfo = async function(conn,EMAIL) {
    try{
        let getData = await conn.query('select * from chat.user where EMAIL=?  ',[EMAIL]);
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 註冊填寫基本資料
 * @param conn
 * @param EMAIL 電子郵件
 * @param FIRST_NAME 名字
 * @param LAST_NAME 姓氏
 * @param COMPANY 公司名稱
 * @param PHONE_NUMBER 電話號碼
 * @param EMAIL 電子郵件
 * @param PASSWORD 密碼
 * @returns {Promise<unknown>}
 */
exports.register = async function(conn,EMAIL,FIRST_NAME,LAST_NAME,COMPANY,PHONE_NUMBER,EMAIL,PASSWORD){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.user (EMAIL,FIRST_NAME,LAST_NAME,COMPANY,PHONE_NUMBER) VALUES (?,?,?,?,?); ' +
            ' INSERT INTO chat.login (EMAIL,PASSWORD,LOGIN_EXP,LOGIN_COUNT) VALUES (?,?,sysdate() + 5/(24*60),0) '
            ,[EMAIL,FIRST_NAME,LAST_NAME,COMPANY,PHONE_NUMBER,EMAIL,PASSWORD]
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