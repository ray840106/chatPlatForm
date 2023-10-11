
/**
 * 新增聊天室內容
 * @param conn
 * @param ROOMID 聊天室ID
 * @param CONTENT 內容
 * @param TYPE 內容類型(1:文字、2:貼圖、3:圖片、4:檔案)
 * @param INS_USER 新增使用者
 * @param FILE 檔案類型
 * @returns {Promise<unknown>}
 */
exports.insMessage = async function(conn,ROOMID,CONTENT,TYPE,INS_USER,FILE=null){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.messages (ROOMID,CONTENT,TYPE,INS_USER,INS_DATE,FILE) VALUES (?,?,?,?,now(),?); '
            ,[ROOMID,CONTENT,TYPE,INS_USER,FILE]
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
 * 查詢聊天室內容
 * @param conn
 * @param ROOMID 聊天室ID
 * @returns {Promise<unknown>}
 */
exports.getMessages = async function(conn,ROOMID){
    try{
        let getData = await conn.query(
            ' SELECT ROOMID,CONTENT,TYPE,FILE,INS_USER,INS_DATE,FILE_TYPE,FILE_NAME FROM ( ' +
            '   SELECT a.ROOMID,a.CONTENT,a.TYPE,a.FILE,a.INS_USER,a.INS_DATE,b.TYPE as FILE_TYPE,b.FILE_NAME ' +
            '   FROM chat.messages a ' +
            '   LEFT JOIN chat.files b ON a.FILE=b.FILE_ID ' +
            '   UNION ' +
            '   SELECT a.ROOMID,a.CONTENT,a.TYPE,a.FILE,a.INS_USER,a.INS_DATE,b.TYPE as FILE_TYPE,b.FILE_NAME ' +
            '   FROM chat.messages a ' +
            '   RIGHT JOIN chat.files b ON a.FILE=b.FILE_ID ' +
            ' ) AS U ' +
            ' where U.ROOMID= ? ' +
            ' order by INS_DATE '
            ,[ROOMID]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}