require('dotenv').config()
let conn = require('../models/db_conn')
let table_user = require('../models/table_user')
let table_login = require('../models/table_login')
const axios = require('axios');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mobile = require('is-mobile');
const {v4: uuidv4} = require("uuid");
const { OAuth2Client } = require('google-auth-library')
//const { SECRET, EXPIRES_IN, GOOGLE_CLIENT_ID } = process.env;
const SECRET=rayChatPlat
const EXPIRES_IN=3h
const GOOGLE_CLIENT_ID=444195588094-gl9l6klt2v52a0sksl2vf29aslpd1m1c.apps.googleusercontent.com

/**
 * 註冊帳號
 */
async function register(request, response) {
    const {user} = request.body;
    const {EMAIL,PASSWORD,FIRST_NAME,LAST_NAME,COMPANY,PHONE_NUMBER} = user

    const connection = await conn.getConnection();
    try {
        let emailRule = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;

        // 驗證信箱格式
        if (!EMAIL || EMAIL.search(emailRule)== -1) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: 'Email address is invalid.',
            });
        }

        let user_info = await table_user.userInfo(connection,EMAIL)
        if (user_info.length>0) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: 'It seems you already have an account, please log in instead.',
            });
        }

        // generate a salt and hash on separate function calls
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(PASSWORD, salt);

        await table_user.register(connection,EMAIL,FIRST_NAME,LAST_NAME,COMPANY,PHONE_NUMBER,EMAIL,hash).then(function(results){
            response.status(200).json({
                status: 'success',
                done_TF: true,
                message: 'Thank you for registering with us. Your account has been successfully created.',
            });
        }).catch(err => {
            throw err;
        })
    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: {
                error: e
            },
            message: 'Internal Server Error',
        });
    } finally {
        connection.release();
    }

}

/**
 * 帳密登入
 */
async function login(request, response) {
    const {user ,verification} = request.body;
    const {EMAIL ,PASSWORD} = user;
    let errArray = [],success = false

    const connection = await conn.getConnection();
    try {
        if (!verification || !EMAIL || !PASSWORD) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: 'Invalid email or password. Please try again with the correct credentials.',
            });
        }

        //google 驗證前端所帶的token是否有效
        await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=6Lf4Q8AhAAAAAL1aW_s4LQjJX88Ejp7xBcr5MIkf&response=${verification}`).then(function (res) {
            success = res.data.success
        });

        if (!success) {
            return response.status(400).json({
                status: 'failed',
                data: {
                    done_TF: false
                },
                message: 'Invalid email or password. Please try again with the correct credentials.',
            });
        }

        let password_get = await table_login.passwordGet(connection,EMAIL)
        let login_exp = password_get[0].LOGIN_EXP;
        let login_count = password_get[0].LOGIN_COUNT;
        if (new Date()<login_exp && login_count>4) {
            return response.status(401).json({
                status: 'failed',
                data: [],
                message:
                    'Too many login attempts!\nPlease try again in five minutes!',
            });
        } else if (password_get.length>0) {
            const match = await bcrypt.compare(PASSWORD, password_get[0].PASSWORD);
            if (match) {
                let user_info = await table_user.userInfo(connection,EMAIL)

                user_info[0].authTF=true;
                user_info[0].clientIP=request.clientIp;

                request.session.EMAIL= user_info[0].EMAIL
                request.session.authTF= true;
                request.session.clientIP= request.clientIp;
                request.session.mobile= mobile({ ua: request });

                request.session['loginToken'] = jwt.sign(user_info[0],  SECRET, { expiresIn: EXPIRES_IN });
                let {done_TF,err} = await table_login.updLogin(connection,0,EMAIL)
                if (!done_TF) {
                    errArray.push(err);
                }

                response.status(200).json({
                    status: 'success',
                    done_TF: true,
                    message: 'You have successfully logged in.',
                });

            } else {
                if (login_count>4) {
                    let {done_TF,err} = await table_login.updLogin(connection,1,EMAIL)
                    if (!done_TF) {
                        errArray.push(err);
                    }
                } else {
                    let count = login_count+1;
                    let {done_TF,err} = await table_login.updErrorLogin(connection,count,EMAIL)
                    if (!done_TF) {
                        errArray.push(err);
                    }
                }
                return response.status(400).json({
                    status: 'failed',
                    data: {
                        done_TF: false
                    },
                    message: 'Invalid email or password. Please try again with the correct credentials.',
                });
            }

            if (errArray.length>0) {
                response.status(500).json({
                    status: 'error',
                    code: 500,
                    data: errArray,
                    message: 'Internal Server Error',
                });
            }

        }

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: {
                    error: e
                },
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }

}

/**
 * 使用者個人資訊
 */
async function userInfo(request, response) {
    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null

    const connection = await conn.getConnection();
    try {
        let { EMAIL } = jwt.verify(loginToken, SECRET);

        let user_info = await table_user.userInfo(connection,EMAIL)
        response.status(200).json({
            status: 'success',
            user_info: user_info[0],
            message: 'You have successfully logged in.',
        });

    } catch (e) {
        response.status(500).json({
            status: 'error',
            code: 500,
            data: {
                error: e
            },
            message: 'Internal Server Error',
        });
    } finally {
        connection.release();
    }

}

/**
 * google OAuth2登入
 */
async function googleLogin(request, response) {
    let {id_token,token} = request.body
    let success = false;

    const connection = await conn.getConnection();
    await connection.beginTransaction();
    try {

        //google recaptcha驗證前端所帶的token是否有效
        await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=6Lf4Q8AhAAAAAL1aW_s4LQjJX88Ejp7xBcr5MIkf&response=${token}`).then(function (res) {
            success = res.data.success
        });

        if (!success) {
            throw `Invalid email or password. Please try again with the correct credentials.`;
        }

        const client = new OAuth2Client(GOOGLE_CLIENT_ID)

        //google OAuth2將token和client_Id放入參數一起去做驗證
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: GOOGLE_CLIENT_ID
        })

        let {email,family_name,given_name,email_verified} = ticket.payload

        if (!email_verified) {
            throw `Invalid email or password. Please try again with the correct credentials.`;
        }

        let password_get = await table_login.passwordGet(connection,email)
        if (password_get.length>0) {
            let user_info = await table_user.userInfo(connection,email)

            user_info[0].authTF=true;
            user_info[0].clientIP=request.clientIp;

            request.session.EMAIL= user_info[0].EMAIL
            request.session.authTF= true;
            request.session.clientIP= request.clientIp;
            request.session.mobile= mobile({ ua: request });

            request.session['loginToken'] = jwt.sign(user_info[0],  SECRET, { expiresIn: EXPIRES_IN });
            let {done_TF,err} = await table_login.updLogin(connection,0,email)
            if (!done_TF) {
                await connection.rollback();
                throw err;
            }
        } else {
            // generate a salt and hash on separate function calls
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(uuidv4(), salt);

            let {done_TF,err} = await table_user.register(connection,email,family_name,given_name,"","",email,hash)
            if (!done_TF) {
                await connection.rollback();
                throw err;
            }

            if (done_TF) {
                let user_info = await table_user.userInfo(connection,email)

                user_info[0].authTF=true;
                user_info[0].clientIP=request.clientIp;

                request.session.EMAIL= user_info[0].EMAIL
                request.session.authTF= true;
                request.session.clientIP= request.clientIp;
                request.session.mobile= mobile({ ua: request });

                request.session['loginToken'] = jwt.sign(user_info[0],  SECRET, { expiresIn: EXPIRES_IN });
                let {done_TF,err} = await table_login.updLogin(connection,0,email)
                if (!done_TF) {
                    await connection.rollback();
                    throw err;
                }
            }
        }

        await connection.commit();
        response.status(200).json({
            status: 'success',
            done_TF: true,
            message: 'You have successfully logged in.',
        });

    } catch (e) {
        if (e.name=='TokenExpiredError') {
            response.status(401).send(e);
        } else {
            response.status(500).json({
                status: 'error',
                code: 500,
                data: e,
                message: 'Internal Server Error',
            });
        }
    } finally {
        connection.release();
    }


}

/**
 * 權限驗證
 */
async function baseInfo(request, response) {
    try {
        if (request.hasOwnProperty('session')) {
            response.status(200).json({
                status: 'success',
                authTF: request.session.authTF,
                EMAIL: request.session.EMAIL,
                mobile: request.session.mobile,
                loginToken: request.session.loginToken,
            });
        }

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
 * 更新loginToken
 */
async function tokenRefresh(request, response) {

    const params = request.query;
    let loginToken = (params.loginInfo != undefined) ? params.loginInfo.loginToken : null
    const connection = await conn.getConnection();
    try {
        let decoded = jwt.verify(loginToken, process.env.SECRET);
        let login_email = decoded.EMAIL;

        let user_info = await table_user.userInfo(connection,login_email)
        request.session['loginToken'] = jwt.sign(user_info[0],  SECRET, { expiresIn: EXPIRES_IN });
        response.status(200).json({
            status: 'success',
            loginToken: request.session.loginToken,
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
 * 帳號相關api
 */
exports.auth = (request, response) => {   //獲取info表全部數據

    const params = request.query;

    if (params.method=='register') {
        register(request, response)
    } else if (params.method=='login') {
        login(request, response)
    } else if (params.method=='userInfo') {
        userInfo(request, response)
    } else if (params.method=='googleLogin') {
        googleLogin(request, response)
    } else if (params.method=='baseInfo') {
        baseInfo(request, response)
    } else if (params.method=='tokenRefresh') {
        tokenRefresh(request, response)
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




