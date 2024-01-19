
/**
 * 新增文章照片
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @param IMG_SRC 照片
 * @param ORD 順序
 * @returns {Promise<unknown>}
 */
exports.insArticlePhoto = async function(conn,ARTICLE_ID,IMG_SRC,ORD){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.article_photo (ARTICLE_ID,IMG_SRC,ORD) VALUES (?,?,?); '
            ,[ARTICLE_ID,IMG_SRC,ORD]
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
 * 刪除文章照片
 * @param conn
 * @param ARTICLE_ID 文章ID
 * @returns {Promise<unknown>}
 */
exports.delArticlePhoto = async function(conn,ARTICLE_ID){
    let result = {}
    try{
        let results = await conn.query(
            ' DELETE FROM chat.article_photo WHERE ARTICLE_ID=? '
            ,[ARTICLE_ID]
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
 * 文章照片
 * @param conn
 * @param EMAIL 電子郵件
 * @returns {Promise<unknown>}
 */
exports.getArticlePhoto = async function(conn,ARTICLE_ID){
    try{
        let sql = ' SELECT ARTICLE_ID,IMG_SRC,ORD FROM chat.article_photo where ARTICLE_ID=? order by ord ';
        let getData = await conn.query(sql,[ARTICLE_ID]);
        return getData[0];
    } catch (e) {
        return e;
    }
}