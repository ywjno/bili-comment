/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Language] 记录器语言包
 */

var lang = {};

const ERROR_LIST = [
    "comment文件夹无法在当前文件夹内创建",
    "指定的弹幕存储文件夹不存在"
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