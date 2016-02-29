/**
 * Created by Payne on 2016/1/18 0018.
 *
 */

var app = {
    Lang: require("./lang"),
    CommentRecorder: require("./lib/comment_recorder"),
    CommentSocket: require("./lib/v2/comment_socket"),
    CommentSocketV1: require("./lib/v1/comment_socket"),
    LiveAPI: require("./lib/live")
};

module.exports = app;