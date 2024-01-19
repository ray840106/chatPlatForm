
/**
 * 新增留言名單
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param EMAIL 留言EMAIL
 * @param CONTENT 留言內容
 * @param FLOOR 留言樓層
 * @param REPLY_ARTICLE_ID 留言ID
 * @param LEVEL 階層
 * @returns {Promise<unknown>}
 */
exports.insArticleReply = async function(conn,ARTICLE_ID,EMAIL,CONTENT,FLOOR,REPLY_ARTICLE_ID,LEVEL){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.article_reply (ARTICLE_ID,REPLY_AUTHOR,CONTENT,FLOOR,REPLY_ARTICLE_ID,LEVEL,INS_DATE) VALUES (?,?,?,?,?,?,sysdate()); '
            ,[ARTICLE_ID,EMAIL,CONTENT,FLOOR,REPLY_ARTICLE_ID,LEVEL]
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
 * 刪除留言名單
 * @param conn
 * @param SN 按讚序號
 * @returns {Promise<unknown>}
 */
exports.delArticleReply = async function(conn,EMAIL,ARTICLE_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.article_reply WHERE EMAIL=? and ARTICLE_ID=? '
            ,[EMAIL,ARTICLE_ID]
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
 * 文章留言
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param EMAIL 按讚EMAIL
 * @param REPLY_ARTICLE_ID 留言ID
 * @returns {Promise<unknown>}
 */
exports.getArticleReply = async function(conn,ARTICLE_ID='',EMAIL='',REPLY_ARTICLE_ID=''){
    try{
        let sql = " SELECT ARTICLE_ID,CONTENT,FLOOR,REPLY_AUTHOR,INS_DATE,REPLY_ARTICLE_ID,LEVEL,REPLY_COUNT,LIKE_COUNT FROM chat.article_reply where ARTICLE_ID is not null ";
        let parameter = []
        if (ARTICLE_ID!='') {
            sql += " and ARTICLE_ID=? "
            parameter.push(ARTICLE_ID)
        }
        if (EMAIL!='') {
            sql += " and REPLY_AUTHOR=? "
            parameter.push(EMAIL)
        }
        if (REPLY_ARTICLE_ID!='') {
            sql += " and REPLY_ARTICLE_ID=? "
            parameter.push(REPLY_ARTICLE_ID)
        }

        sql += " order by ins_date desc ";
        let getData = await conn.query(sql,parameter);
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 按讚文章
 * @param conn
 * @param REPLY_ARTICLE_ID 留言ID
 * @param int 增加或減少愛心數
 * @returns {Promise<unknown>}
 */
exports.updArticleReplyLike = async function(conn,REPLY_ARTICLE_ID,int){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.article_reply set LIKE_COUNT=LIKE_COUNT+? where REPLY_ARTICLE_ID=?; '
            ,[int,REPLY_ARTICLE_ID]
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
 * 回復留言
 * @param conn
 * @param REPLY_ARTICLE_ID 留言ID
 * @param int 增加或減少愛心數
 * @returns {Promise<unknown>}
 */
exports.updArticleReplyReply = async function(conn,REPLY_ARTICLE_ID,int){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.article_reply set REPLY_COUNT=REPLY_COUNT+? where REPLY_ARTICLE_ID=?; '
            ,[int,REPLY_ARTICLE_ID]
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