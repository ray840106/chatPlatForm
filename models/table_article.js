
/**
 * 新增文章
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param AUTHOR 發文EMAIL
 * @param CONTENT 內文
 * @returns {Promise<unknown>}
 */
exports.insArticle = async function(conn,ARTICLE_ID,AUTHOR,CONTENT){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.article (ARTICLE_ID,AUTHOR,CONTENT,INS_DATE) VALUES (?,?,?,sysdate()); '
            ,[ARTICLE_ID,AUTHOR,CONTENT]
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
 * 更新文章
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param CONTENT 內文
 * @returns {Promise<unknown>}
 */
exports.updArticle = async function(conn,ARTICLE_ID,CONTENT){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.article set CONTENT=? where ARTICLE_ID=?; '
            ,[CONTENT,ARTICLE_ID]
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
 * 刪除文章
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.delArticle = async function(conn,ARTICLE_ID ,EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.article WHERE ARTICLE_ID=? and AUTHOR=? '
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
 * 所有文章
 * @param conn
 * @param EMAIL 電子郵件
 * @param ARTICLE_ID 文章ID
 * @returns {Promise<unknown>}
 */
exports.getArticles = async function(conn,EMAIL='',ARTICLE_ID=''){
    try{
        let sql = "SELECT ARTICLE_ID,AUTHOR,INS_DATE,CONTENT,REPLY_COUNT,LIKE_COUNT FROM chat.article where ARTICLE_ID is not null ";
        let parameter = []
        if (EMAIL!='') {
            sql += " and AUTHOR=? "
            parameter.push(EMAIL)
        }
        if (ARTICLE_ID!='') {
            sql += " and ARTICLE_ID=? "
            parameter.push(ARTICLE_ID)
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
 * @param ARTICLE_ID 文章ID
 * @param int 增加或減少愛心數
 * @returns {Promise<unknown>}
 */
exports.updArticleLike = async function(conn,ARTICLE_ID,int){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.article set LIKE_COUNT=LIKE_COUNT+? where ARTICLE_ID=?; '
            ,[int,ARTICLE_ID]
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
 * 留言文章
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param CONTENT 內文
 * @returns {Promise<unknown>}
 */
exports.updArticleReply = async function(conn,ARTICLE_ID,int){
    let result = {}
    try{
        let results = await conn.query(
            ' update chat.article set REPLY_COUNT=REPLY_COUNT+? where ARTICLE_ID=?; '
            ,[int,ARTICLE_ID]
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