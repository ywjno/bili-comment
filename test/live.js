/**
 * Created by Payne on 2016/1/24 0024.
 */

var live = require("../lib/live");

var room_id = "23058";
live.getRoomInfo(room_id, function(err, data) {
    console.log("getRoomInfo: ", err, data);
});

live.getGiftRankList(room_id, function(err, data) {
    console.log("getGiftRankList: ", err, data);
});

live.getPlayerInfo(room_id, "", function(err, data) {
    console.log("getPlayerInfo: ", err, data);
});

live.getLivePageInfo(room_id, function(err, data) {
    console.log("getLivePageInfo: ", err, data);
});

live.getMedalRankList(room_id, function(err, data) {
    console.log("getMedalRankList: ", err, data);
});
