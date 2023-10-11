
/**
 * 新增檔案資訊
 * @param conn
 * @param FILE_ID 檔案ID
 * @param EMAIL 電子郵件
 * @param FILE_NAME 檔案名稱
 * @param POSITION 位置
 * @param INS_USER 新增者
 * @param STATE 狀態(1:新增、-1:刪除)
 * @param TYPE 檔案類型
 * @returns {Promise<unknown>}
 */
exports.insFile = async function(conn,FILE_ID,EMAIL,FILE_NAME,POSITION,INS_USER,STATE,TYPE){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.files (FILE_ID,EMAIL,FILE_NAME,POSITION,INS_USER,INS_DATE,STATE,TYPE) VALUES (?,?,?,?,?,sysdate(),?,?); '
            ,[FILE_ID,EMAIL,FILE_NAME,POSITION,INS_USER,STATE,TYPE]
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
 * 刪除檔案資訊
 * @param conn
 * @param FILE_ID 檔案ID
 * @returns {Promise<unknown>}
 */
exports.delFile = async function(conn,FILE_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.files WHERE FILE_ID=? '
            ,[FILE_ID]
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
 * 查詢檔案資訊
 * @param conn
 * @param POSITION 檔案ID
 * @param LOGIN_EMAIL 登入帳號
 * @returns {Promise<unknown>}
 */
exports.getFile = async function(conn,POSITION,LOGIN_EMAIL){
    try{
        let getData = await conn.query(
            ' SELECT FILE_ID,EMAIL,FILE_NAME,POSITION,INS_DATE,INS_USER,DEL_USER,DEL_DATE,STATE FROM chat.files WHERE POSITION=? and EMAIL=? '
            ,[POSITION,LOGIN_EMAIL]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}