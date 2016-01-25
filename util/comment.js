/**
 * Created by Payne on 2016/1/18 0018.
 *
 */
var lang = require('../lang').Client;

var util = {};

const COMMENT_SERVER_LATEST_VERSION = 2;
const COMMENT_SERVER_VERSIONS = [1, 2];

/**
 * 检查弹幕服务器版本
 * @param v
 */
util.checkCommentServerVersion = function(v) {
    v = parseInt(v);
    var flag = false;
    for(var i = 0, len = COMMENT_SERVER_VERSIONS.length; i < len; i++) {
        if(COMMENT_SERVER_VERSIONS[i] == v) flag = true;
    }
    if(!flag) v = COMMENT_SERVER_LATEST_VERSION;
    return v;
};

/**
 * 命令行传入参数转配置对象
 * @param program
 * @return Object
 */
util.args2ConfigObject = function(program) {
    return {
        room: {
            live_id: program.live_id,
            live_url: program.live_url
        },
        settings: {
            showTime: !!program.show_time,
            showUserName: !!program.show_username,
            showWatcherNum: !!program.show_watcher_number,
            show_gift: !!program.show_gift,
            reconnect: false,//!!program.reconnect
            output: !!program.output,
            output_path: program.output_path,
            output_filename: program.output_filename
        },
        server: {
            host: program.host,
            port: program.port,
            version: util.checkCommentServerVersion(program.sver)
        }
    };
};

/**
 * 检查配置对象
 * @param run_config
 * @returns {number}
 */
util.checkConfigObject = function(run_config) {
    if(!run_config.room.live_id && !run_config.room.live_url) {
        return 2;
    }
    //直播间地址转直播间ID
    if(!run_config.room.live_id) {
        run_config.room.live_id = util.parseLiveUrl(run_config.room.live_url);
    }
    run_config.room.live_id = parseInt(run_config.room.live_id);
    if(run_config.room.live_id <= 1000) {
        return 4;
    }
    return -1;
};

/**
 * 生成直播间地址
 * @param live_id 直播间ID
 * @returns {string}
 */
util.getLiveUrl = function (live_id) {
    return "http://live.bilibili.com/" + live_id;
};

/**
 * 通过直播间URL获取直播间ID
 * @param url
 * @returns {*}
 */
util.parseLiveUrl = function (url){
    var reg = [
        /live.bilibili.com\/live\/(.*?).html/,
        /live.bilibili.com\/(.*?)\//
    ];
    if(reg[0].test(url)) { //旧的格式
        return url.match(reg[0])[1];
    }
    //新的格式
    url = url + "/";
    if(!reg[1].test(url)) return null;
    return (url.match(reg[1]))[1];
};

/**
 * 打印错误信息
 * @param code 错误代码
 * @param msg 错误消息
 * @returns {boolean}
 */
util.printError = function (code, msg){
    code = parseInt(code);
    console.log("啊喔, 发生了一个错误~\n".bold +
        "错误代码: " + code.toString().yellow.bold + "\n" +
        "错误信息: " + (msg ? msg : (lang.error(code).msg).yellow.bold));
    return false;
};

/**
 * [CMD] 输出到控制台
 * @param str
 */
util.cout = function (str) {
    if(str instanceof Array) {
        for(var i = 0, len = str.length; i < len; i++) {
            if(str[i] instanceof Array) {
                console.log.apply(this, str[i]);
            } else {
                console.log(str[i]);
            }
        }
    } else {
        console.log(str);
    }
};

module.exports = util;