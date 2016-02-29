/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 弹幕数据解析器 V2
 *
 * 功能：
 * 1. 解析XMLSocket的弹幕服务器的回传信息
 */

var parser = {};

parser.buffer = new Buffer(0);
parser.callback = null;

/**
 * 设置解析器回调函数
 * @param callback
 * @returns {boolean}
 */
parser.setCallback = function(callback) {
    if(!(callback instanceof Function)) return false;
    this.callback = callback;
    return true;
};

/**
 * 读Socket数据
 * @param data
 */
parser.readSocketData = function(data) {
    if(!parser.callback) return ;

    this.buffer = Buffer.concat([this.buffer, data]);
    this.packetParser();
};

/**
 * 解析数据包
 */
parser.packetParser = function() {
    if(!parser.callback) return ;

    while(this.buffer.length > 0) {
        var packageLen = this.buffer.readUInt32BE(0);
        if(this.buffer.length < packageLen) return ;//数据未接收完成 中断解析

        if(this.buffer.length < 6) return ; //异常包
        var headLen = this.buffer.readUInt16BE(4);
        if(packageLen < headLen) return ; //异常包

        var _parser_Index = this.buffer.readUInt32BE(8);
        var jsonData;
        switch(_parser_Index) {
            case 3:
                this.callback('login_success', this.buffer.readUInt32BE(headLen));
                break;
            case 5:
                jsonData = this.buffer.slice(headLen, packageLen).toString('utf8');
                try {
                    jsonData = JSON.parse(jsonData);
                } catch (e) {
                    return this.callback('error', '意外的新弹幕信息');
                }
                this.callback('newCommentString', jsonData);
                break;

            /*case 6:
             jsonData = buffer.slice(headLen).toString('utf8');
             try {
             jsonData = JSON.parse(jsonData);
             } catch (e) {
             return this.callback('error', '意外的滚动信息');
             }
             this.callback('newScrollMessage', jsonData);
             break;
             */

            case 8:
                /*jsonData = this.buffer.slice(headLen, packageLen).toString('utf8');
                try {
                    jsonData = JSON.parse(jsonData);
                } catch (e) {
                    return this.callback('error', '连接握手数据异常');
                }*/
                this.callback('connected');
                break;

            case 17:
                this.callback('error', 'Server Updated');
                break;
        }

        this.buffer = this.buffer.slice(packageLen);
    }
};

module.exports = parser;