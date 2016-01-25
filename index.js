/**
 * Created by Payne on 2016/1/18 0018.
 *
 */

var app = {
    Lang: require("./lang"),
    CommentClient: require("./lib/comment_client"),
    CommentRecorder: require("./lib/comment_recorder"),
    CommentSocket: require("./lib/v2/comment_socket"),
    CommentSocketV1: require("./lib/v1/comment_socket"),
    ConfigBuilder: require("./lib/config_builder"),
    LiveAPI: require("./lib/live")
};

app.cli = app.CommentClient;

module.exports = app;