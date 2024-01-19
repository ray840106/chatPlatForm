
/**
 * 新增按讚名單
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param EMAIL 按讚EMAIL
 * @returns {Promise<unknown>}
 */
exports.insArticleLike = async function(conn,ARTICLE_ID,EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.article_like (ARTICLE_ID,EMAIL,INS_DATE) VALUES (?,?,sysdate()); '
            ,[ARTICLE_ID,EMAIL]
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
 * 刪除按讚名單
 * @param conn
 * @param SN 按讚序號
 * @returns {Promise<unknown>}
 */
exports.delArticleLike = async function(conn,EMAIL,ARTICLE_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.article_like WHERE EMAIL=? and ARTICLE_ID=? '
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
 * 所有文章
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param EMAIL 按讚EMAIL
 * @returns {Promise<unknown>}
 */
exports.getArticleLike = async function(conn,ARTICLE_ID,EMAIL=''){
    try{
        let sql = " SELECT SN,ARTICLE_ID,EMAIL FROM chat.article_like where ARTICLE_ID=? ";
        let parameter = [ARTICLE_ID]
        if (EMAIL!='') {
            sql += " and EMAIL=? "
            parameter.push(EMAIL)
        }
        let getData = await conn.query(sql,parameter);
        return getData[0];
    } catch (e) {
        return e;
    }
}