require('dotenv').config()
let conn = require('../db/db_conn')
let table_files = require('../db/table_files')
const fs = require('fs');
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');
const url = require("url");
const table_messages = require("../db/table_messages");

/**
 * 上傳檔案
 * @param myFile 檔案
 * @param login_email 登入帳號
 * @returns {Promise<{}>}
 */
async function upload(myFile,login_email,place) {
    let {name,mimetype} = myFile
    let result = {},errArray=[];

    const connection = await conn.getConnection();
    try {

        let fileID = uuidv4();
        if (fs.existsSync(`./public/${fileID}`)) {
            fileID = uuidv4();
        } else {
            fs.mkdirSync(`./public/${fileID}`);
        }

        //  mv() method places the file inside public directory
        myFile.mv(`./public/${fileID}/${name}`, async function (err) {
            if (err) {
                fs.rmdirSync(`./public/${fileID}`)
            }
        });

        let ins_file = await table_files.insFile(connection,fileID,login_email,name,place,login_email,1,mimetype)
        if (!ins_file.done_TF) {
            errArray.put(ins_file.err)
            fs.unlinkSync(`./public/${fileID}/${name}`)
            fs.rmdirSync(`./public/${fileID}`)
        }

        result.uploadFile = {
            name: name, path: `/${fileID}/${name}`,fileID:fileID
        };

        result.done_TF = errArray.length==0;
        result.errArray = errArray;
        return result;

    } catch (e) {
        result.done_TF = false;
        result.errArray = e;
        return result;
    } finally {
        connection.release();
    }
}

/**
 * 刪除檔案
 * @param myFile 檔案
 * @param fileID 檔案編號
 * @returns {Promise<{}>}
 */
async function delFile(fileName, fileID) {
    let result = {},errArray=[];

    const connection = await conn.getConnection();
    try {

        let del_file = await table_files.delFile(connection,fileID)
        if (!del_file.done_TF) {
            errArray.push(del_file.err);
        } else {
            fs.unlinkSync(`./public/${fileID}/${fileName}`)
            fs.rmdirSync(`./public/${fileID}`)
        }

        result.done_TF = errArray.length==0;
        result.errArray = errArray;
        return result;

    } catch (e) {
        result.done_TF = false;
        result.errArray = e;
        return result;
    } finally {
        connection.release();
    }
}

/**
 * 查詢檔案
 * @param myFile 檔案
 * @param login_email 登入帳號
 * @returns {Promise<{}>}
 */
async function getFile(POSITION, login_email) {
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

/**
 * 取得大頭照
 */
async function getHeadshot(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        // 驗證信箱格式
        let get_file = await getFile('headshot',login_email)
        response.status(200).json({
            status: 'success',
            get_file: get_file.data[0],
            message: 'Success',
        });
    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: e,
            message: 'Internal Server Error',
        });
    }
}

/**
 * 上傳大頭照
 */
async function uploadHeadshot(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let get_file = await getFile('headshot',login_email)

        if (get_file.data.length>0) {
            let fileID = get_file.data[0].FILE_ID
            let fileName = get_file.data[0].FILE_NAME

            let del_file = await delFile(fileName, fileID)
            if (!del_file.done_TF) {
                response.status(500).json({
                    status: 'error',
                    code: 500,
                    error: del_file.errArray,
                    message: 'Internal Server Error',
                });
            }
        }

        if (request.files) {
            let upload_file = await upload(request.files.file,login_email,'headshot');
            if (!upload_file.done_TF) {
                response.status(500).json({
                    status: 'error',
                    code: 500,
                    error: upload_file.errArray,
                    message: 'Internal Server Error',
                });
            }
        }

        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'Success',
        });

    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            done_TF: true,
            data: e,
            message: 'Internal Server Error',
        });
    }
}

/**
 * 上傳訊息檔案
 */
async function uploadMessage(request, response) {
    const {loginInfo,token} = request.query;
    let errArray=[];

    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginInfo.loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let item = jwt.verify(token, process.env.SECRET);
        let ROOMID = item.ROOMID

        if (request.files) {
            const {mimetype,name} = request.files.file;

            let textType = 3;
            if (mimetype.includes('image')) {
                textType = 3;
            } else if (mimetype.includes('application')){
                textType = 4;
            }

            await upload(request.files.file,login_email,'message').then(async function (res) {
                if (res.done_TF) {
                    let formatUrl = {
                        protocol: process.env.PROTOCOL,
                        hostname: process.env.HOSTNAME,
                        port: process.env.PORT,
                        pathname: res.uploadFile.path,
                    };
                    let fileUrl = url.format(formatUrl)
                    let ins_message = await table_messages.insMessage(connection,ROOMID,fileUrl,textType,login_email,res.uploadFile.fileID)
                    if (!ins_message.done_TF) {
                        errArray.push(ins_message);
                        let del_file = await delFile(name,res.fileID)
                        if (!del_file.done_TF) {
                            response.status(500).json({
                                status: 'error',
                                code: 500,
                                error: del_file.errArray,
                                message: 'Internal Server Error',
                            });
                        }

                        response.status(500).json({
                            status: 'error',
                            code: 500,
                            error: ins_message.errArray,
                            message: 'Internal Server Error',
                        });
                    }
                } else {
                    response.status(500).json({
                        status: 'error',
                        code: 500,
                        error: res.errArray,
                        message: 'Internal Server Error',
                    });
                }
            });

            let get_messages = await table_messages.getMessages(connection,ROOMID)

            response.status(200).json({
                status: 'success',
                get_messages: get_messages,
                message: 'Success',
            });

        } else {
            response.status(400).json({
                status: 'error',
                code: 400,
                message: 'File is null.',
            });
        }

    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: e,
            message: 'Internal Server Error',
        });
    } finally {
        connection.release();
    }
}

/**
 * 帳號相關api
 */
exports.file = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='uploadHeadshot') {
       uploadHeadshot(request, response)
    } else if (params.method=='getHeadshot') {
       getHeadshot(request, response)
    } else if (params.method=='uploadMessage') {
       uploadMessage(request, response)
    }
    /**
     * 錯誤呼叫
     */
    else {
        response.status(500).json({
            status: 'error',
            code: 500,
            message: '方法錯誤!',
        });
    }

}




