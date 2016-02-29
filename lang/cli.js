/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Language] 客户端语言包
 */
var colors = require('colors');

var lang = {};

lang["INTRO"] = "☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆\n\n".bold +
    '欢迎使用 '.bold + "Bili直播弹幕助手".green.bold + ' !\n' +
    '本助手意在帮助播主快速查看直播弹幕\n'.bold +
    "启动客户端支持使用命令行参数, 详情请看快速入门介绍.\n".yellow.bold +
    ('默认使用配置方法, 请访问 ' + "http://bili.micblo.com/#config/tool".bold + ' 快速生成配置文件~\n').yellow.bold +
    '作者的直播间: '.bold + "http://live.bilibili.com/19386".yellow.bold + '.\n' +
    '如果存在Bug或者要提一些建议, 欢迎访问: '.bold + "http://bili.micblo.com/".yellow.bold + '\n\n' +
    '☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆☆';

lang["BR"] = "============================";
lang["HEADINGS"] = [
    "==========配置信息==========",
    "=========直播间信息========="
];

lang.choices = [
    "×".red.bold,
    "√".green.bold
];

lang.options = [
    "是否显示弹幕发射时间\t: ",
    "是否显示弹幕发送者\t: ",
    "是否显示直播间人数\t: ",
    "是否断线重连      \t: ",
    "是否保存弹幕数据  \t: ",
    "弹幕文件位置      \t: ",
    "是否显示礼物      \t: ",
    "弹幕服务器版本    \t: "
];

lang.room_info = [
    "直播间ID (live id)   \t: ",
    "直播间地址 (live url) \t: "
];

lang.comment_cmds = {
    'DANMU_MSG': "[弹幕] ",
    'SEND_GIFT': "[礼物] ",
    'WELCOME': "[欢迎] ",
    'SYS_GIFT': "[系统] "
};

lang.vip_types = [
    "老爷", "房管", "年费老爷"
];

const ERROR_LIST = [
    "配置文件不存在或已损坏",
    "配置文件模型异常",
    "未设置一个直播间ID(live id) 或者直播间URL(live url)",
    "连接已中断",
    "暂时不支持直播ID小于等于1000的直播间"
];

/**
 * 错误信息生成器
 * @param code 错误代码
 * @returns {{code: (Number|*), msg: string}}
 */
lang.error = function(code) {
    code = parseInt(code);
    return ERROR_LIST[code] ? {
        code: code,
        msg: ERROR_LIST[code]
    } : {
        code: code,
        msg: "未知错误"
    }
};

module.exports = lang;