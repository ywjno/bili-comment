/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 弹幕服务器 Socket
 *
 * 功能：
 * 1. 连接弹幕服务器
 */

var net = require('net'),
    events = require('events'),
    util = require('util');

const DEFAULT_COMMENT_HOST = "livecmt-1.bilibili.com";
const DEFAULT_COMMENT_PORT = 88;

/**
 * Bilibili 弹幕服务器 Socket
 * @param base 配置数据
 * @constructor
 */
function Client(base) {
    var self = this;
    events.EventEmitter.call(this);

    if(!(base instanceof Object)) return ;
    if(!base.host) base.host = DEFAULT_COMMENT_HOST;
    if(!base.port) base.port = DEFAULT_COMMENT_PORT;
    this.base = base;

    this.state = 0; //0 未连接 1 待命 2 数据接收未完成
    this.buffer_data = null; //缓冲区的数据
    this.buffer_length = 0; //缓冲区的总大小
    this.timer = null;
    this.client = new net.Socket();
    this.client.setEncoding('binary');

    /**
     * [Event] Socket接收到数据
     */
    this.client.on('data', function(data) {
        data = new Buffer(data, "binary");
        if(data.length >= 1){
            if(self.state == 1) { //可以开始接收数据了
                var parser_index = data.readUInt16BE(0);
                var parser_length = getBDataLength(parser_index);

                if(parser_length == -1){
                    //未知状况
                    /**self.state == 2;
                    this.buffer_data=bdata;
                    this.buffer_return parser_length;**/
                    return;
                }else if(parser_length == 0){
                    parser_length = data.readUInt16BE(2);
                }
                self.buffer_data = new Buffer(0);
                self.buffer_length = parser_length;
            }
            self.buffer_data = Buffer.concat([self.buffer_data,data]);
            if(self.buffer_length >= self.buffer_data.length){ //接收完毕
                self.state = 1;
                if(self.buffer_length == self.buffer_data.length){
                    self.deliverData(self.buffer_data);
                }else{
                    self.emit('unknown_bag', self.buffer_data);
                }
            }
            //未接收完毕的继续
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

}
util.inherits(Client, events.EventEmitter);

/**
 * [方法] 连接到弹幕服务器
 * @param cid Comment房间ID
 * @param uid 用户ID
 * @param pwd 用户密码
 */
Client.prototype.connect = function(cid, uid, pwd) {
    var self = this;
    if (this.state != 0) return;
    this.client.connect(self.base.port, self.base.host, function() {
        var length;
        if(pwd && uid) { //length
            length = 20;
        }else{
            length = 12;
        }
        var data = new Buffer(length);
        data.writeUInt16BE(0x101, 0);
        data.writeUInt16BE(length,2);
        if(!uid) uid = 0;
        data.writeUInt32BE(cid, 4);
        data.writeUInt32BE(uid, 8);
        if(pwd) data.write(pwd);
        self.send(data);
        self.state = 1;
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
 * [方法] 发送未打包的数据到弹幕服务器(直传)
 * @param name
 * @param para
 * @returns {boolean}
 */
Client.prototype.sendUnPacked = function(name, para) {
    var data = pack_data(name, para);
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
 * [方法] 分发已接收的数据
 * @param data 待分发的数据
 * @returns {*}
 */
Client.prototype.deliverData = function (data){
    var self = this;
    if(data.length < 2) return this.emit('error', '意外的数据包');

    var jsonLength, jsonData;
    var index = data.readUInt16BE(0);
    switch(index){
        case 1:
            if(!this.timer){
                this.timer = setInterval(function(){
                    if(self.state == 1){
                        var rs = new Buffer(4);
                        rs.writeUInt16BE(258,0);
                        rs.writeUInt16BE(4,2);
                        self.send(rs);
                    }
                }, 10 * 1000);
            }
            this.emit('login_success', data.readUInt32BE(2));
            break;

        case 4:
            if(data.length <= 4) return this.emit('error', '接收异常的弹幕');
            jsonLength = data.readUInt16BE(2);
            jsonData = data.slice(4).toString('utf8');
            if(data.length != jsonLength) return this.emit('error', '意外的新弹幕信息');
            try{
                jsonData = JSON.parse(jsonData);
            } catch (e) {
                return this.emit('error', '意外的新弹幕信息');
            }

            this.emit('newCommentString', jsonData);
            break;

        case 6:
            if(data.length <= 4) return this.emit('error', '接收异常的滚动信息');
            jsonLength = data.readUInt16BE(2);
            jsonData = data.slice(4).toString('utf8');
            if(data.length != jsonLength) this.emit('error', '意外的滚动信息');
            try{
                jsonData = JSON.parse(jsonData);
            } catch (e) {
                return this.emit('error', '意外的滚动信息');
            }
            this.emit('newScrollMessage', jsonData);
            break;

        case 17:
            this.emit('error', 'Server Updated');
            break;
    }
};

/**
 * 获取各个分类的数据包的长度
 * @param index
 * @returns {*}
 */
function getBDataLength(index){
    switch(index){
        case 0:
            return 0;
        case 1:
            return 6;
        case 2:
            return 0;
        case 3:
            return 0;
        case 4:
            return 0;
        case 5:
            return 0;
        case 6:
            return 0;
        case 7:
            return 0;
        case 8:
            return 4;
        case 16:
            return 3;
        case 17:
            return 2;
        default:
            return -1;
    }
}

/**
 * [辅助] 打包数据报
 * @param type 数据类型
 * @param data 待发送数据
 * @returns {Buffer}
 */
function pack_data(type, data) {
    var bufferData = new Buffer(4 + data.length);
    bufferData.writeUInt16BE(type, 0);
    bufferData.writeUInt16BE(4 + data.length, 2);
    bufferData.write(data, 4);
    return bufferData;
}
exports.Client = Client;