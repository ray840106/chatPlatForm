
/**
 * 新增聊天室
 * @param conn
 * @param ROOMID 房間代號
 * @param TYPE 聊天室類型(manyToOne、oneOnOne)
 * @param EMAIL 使用者信箱
 * @returns {Promise<unknown>}
 */
exports.insRoom = async function(conn,ROOMID,TYPE,EMAIL){
    let result = {}
    try{
        let results = await conn.query(
            ' INSERT INTO chat.rooms (ROOMID,TYPE,EMAIL) VALUES (?,?,?); '
            ,[ROOMID,TYPE,EMAIL]
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
 * 註冊填寫基本資料
 * @param conn
 * @param EMAIL1 使用者信箱
 * @param EMAIL2 使用者信箱
 * @returns {Promise<unknown>}
 */
exports.getRooms = async function(conn,EMAIL1,EMAIL2){
    try{
        let getData = await conn.query(
            ' SELECT b.ROOMID,b.TYPE,a.EMAIL,b.EMAIL as FRIEND_EMAIL ' +
            ' FROM (select ROOMID,EMAIL,TYPE from chat.rooms where email=?) a ' +
            ' JOIN (select ROOMID,EMAIL,TYPE from chat.rooms where email<>?) b ' +
            ' ON a.ROOMID=b.ROOMID; '
            ,[EMAIL1,EMAIL2]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}

/**
 * 註冊填寫基本資料
 * @param conn
 * @param EMAIL 使用者信箱
 * @param EMAIL 使用者信箱
 * @param FRIEND_EMAIL 好友EMAIL
 * @returns {Promise<unknown>}
 */
exports.getRoom = async function(conn,EMAIL,EMAIL,FRIEND_EMAIL){
    try{
        let getData = await conn.query(
            ' SELECT b.ROOMID,b.TYPE,b.EMAIL ' +
            ' FROM (select ROOMID,EMAIL,TYPE from chat.rooms where email=?) a ' +
            ' JOIN (select ROOMID,EMAIL,TYPE from chat.rooms where email<>?) b ' +
            ' ON a.ROOMID=b.ROOMID where b.EMAIL=?; '
            ,[EMAIL,EMAIL,FRIEND_EMAIL]
        );
        return getData[0];
    } catch (e) {
        return e;
    }
}