/**
 * Created by Payne on 2016/1/18 0018.
 *
 * Util 方法库
 */
var fs = require("fs");

var util = {};

util.Comment = require("./comment");

/**
 * 读入JSON文件
 * @param filename
 * @returns {null}
 */
util.readJSONFile = function(filename) {
    if(!fs.existsSync(filename)) return null;
    var data = fs.readFileSync(filename).toString();
    try{
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
};

/**
 * 获取Unix时间戳
 * @returns {number}
 */
util.getUnixTimeStamp = function() {
    return Math.round(Date.now() / 1000);
};

/**
 * 是否为空
 * @param text
 * @returns {boolean}
 */
util.isBlank = function (text){
    return (!text || text == '');
};

/**
 * 是否为正整数
 * @param num
 * @returns {boolean}
 */
util.isInt = function(num) {
    return /^[1-9]\d*$/.test(num);
};

/**
 * HTML解编码
 * @param str
 * @returns {*}
 */
util.html_decode = function (str)
{
    var s;
    if (str.length == 0) return "";
    s = str.replace(/&gt;/g, "&");
    s = s.replace(/&lt;/g, "<");
    s = s.replace(/&gt;/g, ">");
    s = s.replace(/&nbsp;/g, " ");
    s = s.replace(/&#39;/g, "\'");
    s = s.replace(/&quot;/g, "\"");
    s = s.replace(/<br>/g, "\n");
    return s;
};
util.replaceES = util.html_decode;

/**
 * 日期格式化
 * @param time Unix时间戳
 * @param fmt Format格式
 * @returns {*}
 * @constructor
 */
util.DateFormat = function (time, fmt) {
    time = new Date(time * 1000);
    var o = {
        "M+": time.getMonth() + 1, //月份
        "d+": time.getDate(), //日
        "h+": time.getHours(), //小时
        "m+": time.getMinutes(), //分
        "s+": time.getSeconds(), //秒
        "q+": Math.floor((time.getMonth() + 3) / 3), //季度
        "S": time.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (time.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

module.exports = util;