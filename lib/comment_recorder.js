/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 弹幕记录器
 *
 * 功能：
 * 1. 处理弹幕数据存储方法
 * 2. 对外提供读取弹幕数据的方法
 */

var fs = require('fs');

var lang = require("../lang").Recorder;
var util = require("../util");

/**
 * [Class] 记录器
 * @param path 写文件路径 （默认写到运行目录下的Comment文件夹）
 * @param filename 写文件名 (默认是 "%t.bili" , %t = Unix时间戳)
 * @constructor
 */
var Writer = function(path, filename) {
    //弹幕保存配置
    var wOption = {
        flags: 'a',
        encoding: null,
        mode: '0666'
    };

    if(path) { //指定了路径
        if (!fs.existsSync(path)) throw lang.error(1);
    } else {
        path = "comment";
        try{
            if (!fs.existsSync(path)) {
                fs.mkdirSync(path);
            }
        } catch (e){
            throw lang.error(0);
        }
    }

    this.fileName = (filename || "%t.bili").replace("%t", util.getUnixTimeStamp().toString());
    this.path = path;
    this.targetPath = this.path + '/' + this.fileName;
    this.stream = fs.createWriteStream(this.targetPath, wOption);

    //WRITE HEADER
    this.stream.write(new Buffer([0x43, 0x99]));
};

/**
 * 写入数据到流中
 * @param type (0 head 1 content)
 * @param data
 * @returns {boolean}
 */
Writer.prototype.write = function(type, data) {
    if(data instanceof Buffer) {
        return this.stream.write(data);
    }
    if(data instanceof Object) {
        data = JSON.stringify(data);
    }

    this.stream.write(new Buffer(data));
    switch(type) {
        case 0:
            this.stream.write(new Buffer([0x00,0x00]));
            break;
        case 1:
            this.stream.write(new Buffer([0x00]));
            break;
    }
};


module.exports = {
    Writer: Writer,
    Reader: null
};