/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 弹幕服务器 Socket V2
 *
 * 功能：
 * 1. 连接XMLSocket的弹幕服务器
 */

var net = require('net'),
    events = require('events'),
    util = require('util');

const DEFAULT_COMMENT_HOST = "livecmt-1.bilibili.com";
const DEFAULT_COMMENT_PORT = 788;

/**
 * Bilibili 弹幕服务器 XMLSocket
 * @param base 配置数据
 * @constructor
 */
function Client(base) {
    var self = this;
    events.EventEmitter.call(this);

    //加载配置
    if(!(base instanceof Object)) return ;
    if(!base.host) base.host = DEFAULT_COMMENT_HOST;
    if(!base.port) base.port = DEFAULT_COMMENT_PORT;
    this.base = base;

    this.ver = 1;//Socket版本号
    this.state = 0; //0 未连接 1 连接中
    this.buffer = require("./comment_parser"); //缓冲区
    this.timer = null;
    this.client = new net.Socket();
    this.client.setEncoding('binary');

    this.buffer.setCallback(function(key, value) {
        self.emit(key, value);
    });

    /**
     * [Event] Socket接收到数据
     */
    this.client.on('data', function(data) {
        data = new Buffer(data, "binary");
        if(data.length >= 1){
            self.buffer.readSocketData(data);
        }
    });

    /**
     * [Event] Socket遇到错误
     */
    this.client.on('error', function(error) {
        afterCloseSocket();
        //TODO: reConnect
        self.emit('server_error', error);
    });

    /**
     * [Event] Socket关闭连接
     */
    this.client.on('close', function() {
        afterCloseSocket();
        self.emit('close');
    });

    function afterCloseSocket() {
        self.state = 0;

        clearTimeout(self.timer);
        self.timer = null;
    }

    /**
     * [Event] 心跳包
     */
    this.timerHandler = function() {
        self.sendSocketData(16, 16, 1, 2);
    };
}
util.inherits(Client, events.EventEmitter);

/**
 * [方法] 连接到弹幕服务器
 * @param live_id Comment房间ID
 * @param userId 用户ID
 */
Client.prototype.connect = function(live_id, userId) {
    var self = this;
    if (this.state != 0) return;

    this.client.connect(self.base.port, self.base.host, function() {
        var data = {};
        data.roomid = live_id;
        if(!userId) { //length
            userId = 100000000000000 + parseInt((200000000000000 * Math.random()).toFixed(0));
        }
        data.uid = userId;

        var buf = JSON.stringify(data);
        self.sendSocketData(16 + buf.length, 16, self.ver, 7, 1, buf);
        self.state = 1;

        //连接发起成功
        self.timer = setInterval(self.timerHandler, 20 * 1000);
    });
};
/**
 * [方法] 直接发送数据到弹幕服务器
 * @param data
 * @returns {boolean}
 */
Client.prototype.send = function(data) {
    if(this.client.write(data)){
        this.state = 1;
        return true;
    }else{
        return false;
    }
};

/**
 * [方法] 中断连接
 */
Client.prototype.disconnect = function() {
    this.client.destory();
};

/**
 * 发送Socket数据
 * @param total_len
 * @param head_len
 * @param version
 * @param param4
 * @param param5
 * @param data
 * @returns {Buffer}
 */
Client.prototype.sendSocketData = function(total_len, head_len, version, param4, param5, data) {
    var bufferData = new Buffer(total_len);
    bufferData.writeUInt32BE(total_len, 0);
    bufferData.writeUInt16BE(head_len, 4);
    bufferData.writeUInt16BE(version, 6);
    bufferData.writeUInt32BE(param4, 8);
    bufferData.writeUInt32BE(param5 || 1, 12);
    if(data) bufferData.write(data, head_len);
    this.send(bufferData);
};
exports.Client = Client;