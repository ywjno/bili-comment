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

    ajax("get", options, callback);
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
    if(!cid) return callback("cid" + lang.a1);

    var options = {
        url: 'http://live.bilibili.com/api/player?id=cid:'+cid,
        header:{
            Cookie: cookies ? cookies : ""
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

/**
 * 获取弹幕房间信息
 * 功能: 可以获取最近的10个弹幕和房管列表
 * @param live_id 直播间ID
 * @param callback
 */
api.getRoomInfo = function(live_id, callback) {
    if(!live_id) return callback("live id" + lang.a1);

    var options = {
        url: 'http://live.bilibili.com/ajax/msg',
        form: {
            roomid: live_id
        },
        gzip: true
    };

    ajax("post", options, callback);
};

/**
 * 获取直播间七日礼物赠送榜
 * @param live_id 直播间ID
 * @param callback
 */
api.getGiftRankList = function(live_id, callback) {
    if(!live_id) return callback("live id" + lang.a1);

    var options = {
        url: 'http://live.bilibili.com/gift/getTop?roomid=' + live_id,
        gzip: true
    };

    ajax("get", options, callback);
};

/**
 * 获取主播粉丝榜
 * @param live_id 直播间ID
 * @param callback
 */
api.getMedalRankList = function(live_id, callback) {
    if(!live_id) return callback("live id" + lang.a1);

    var options = {
        url: 'http://live.bilibili.com/liveact/ajaxGetMedalRankList',
        form: {
            roomid: live_id
        },
        gzip: true
    };

    ajax("post", options, callback);
};

function ajax(method, options, callback) {
    if(!method) method = "get";
    if(!request[method]) return false;

    request[method](options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(null, JSON.parse(body));
        } else {
            callback(lang.b1);
        }
    });
    return true;
}

module.exports = api;