var request = require('request');
var xmlreader = require('xmlreader');

var lang = {
    a1: ' is empty',
    b1: 'failed to connect to server'
};

var api = {};

/**
 * 获取直播间信息
 * @param live_id 直播间ID
 * @param callback 回调函数
 * @returns {*}
 */
api.getLivePageInfo = function(live_id, callback){
    if(!live_id) return callback("live id" + lang.a1);

    var options = {
        url: 'http://live.bilibili.com/live/getInfo?roomid=' + encodeURIComponent(live_id),
        gzip: true
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            return callback(null, info);
        }else{
            return callback(lang.b1);
        }
    });
};

api.getLiveInfo = api.getLivePageInfo;

/**
 * 获取播放器信息
 * @param cid Comment房间ID
 * @param cookies 附带的Cookies(用于登录)
 * @param callback 回调函数
 * @returns {*}
 */
api.getPlayerInfo = function(cid, cookies, callback){
    if(!cid) return callback("cid"+lang.a1);

    var options = {
        url: 'http://interface.bilibili.com/player?id=cid:'+cid,
        header:{
            Cookie:cookies?cookies:""
        },
        gzip: true
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            xmlreader.read('<data>' + body + '</data>', function (err, res){
                if(err) return callback(err);
                return callback(null,res.data);
            });
        }else{
            return callback(lang.b1);
        }
    });
};

module.exports = api;