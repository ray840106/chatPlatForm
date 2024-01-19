const conn = require("../models/db_conn");
const table_files = require("../models/table_files");
const url = require("url");
const jwt = require("jsonwebtoken");

/**
 * 查詢檔案
 * @param myFile 檔案
 * @param login_email 登入帳號
 * @returns {Promise<{}>}
 */
exports.getFile = async function (POSITION, login_email) {
    let result = {}

    const connection = await conn.getConnection();
    try {

        // 驗證信箱格式
        let get_file = await table_files.getFile(connection,POSITION,login_email)
        for (let i=0;i<get_file.length;i++) {
            let file_id = get_file[i].FILE_ID;
            let file_name = get_file[i].FILE_NAME;
            let formatUrl = {
                protocol: process.env.PROTOCOL,
                hostname: process.env.HOSTNAME,
                port: process.env.PORT,
                pathname: `/${file_id}/${file_name}`,
            };
            get_file[i]['name'] =  file_name;
            get_file[i]['file_path'] =  url.format(formatUrl);
            get_file[i]['token'] = jwt.sign(get_file[i],  process.env.SECRET, { expiresIn: process.env.EXPIRES_IN });
        }

        result.data = get_file;
        result.done_TF = true;
        return result;

    } catch (e) {
        result.done_TF = false;
        return result;
    } finally {
        connection.release();
    }
}