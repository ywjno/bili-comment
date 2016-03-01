/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 弹幕助手客户端
 *
 * 功能：
 * 1. 命令行版本的BiliComment
 *
 */
var colors = require('colors');
var util = require('../util');

var Recorder = require('./comment_recorder.js');
var lang = require('../lang').Client;

(function() {
    var program = require('commander');
    var run_config;//运行配置

    var speech_sync_spawn = require('child_process').spawnSync;
    var speech_text_cache = "";
    var play_speech_func;

    //Main
    (function() {
        if(!init()) return ;

        run_config.nowclient = connectCommentServer(run_config.room.live_id);

    })();
    //-----------------------------------------------------------
    /**
     * [方法] 初始化
     */
    function init() {
        return init_load_args() && init_load_config();
    }

    /**
     * [初始化] Command参数读入
     * @returns {boolean}
     */
    function init_load_args() {
        //Command 配置
        program
            .version('2.1.1')
            .option('-c, --config <path>', 'Set Config File Path')
            .option('-i, --live_id <id>', 'Set Live ID', parseInt)
            .option('-u, --live_url <url>', 'Set Live URL')
            .option('-t, --show_time', 'Show time when displaying comments')
            .option('-U, --show_username', 'Show username when displaying comments')
            .option('-w, --show_watcher_number', 'Show watcher number when displaying comments')
            .option('-g, --show_gift', 'Show received gifts when displaying comments')
            //.option('-r, --reconnect', 'Reconnect socket when disconnected')
            .option('-o, --output', 'Output comments')
            .option('-p, --output_path <dir>', 'Output comments to this dir (default: comment/)')
            .option('-f, --output_filename <filename>', 'Output comments to this filename (default: %t.log, %t == unix timestamp)')

            .option('-h, --host <host>', 'Set Comment Server host')
            .option('-p, --port <port>', 'Set Comment Server port', parseInt)

            .option('--sver <version>', 'Set Comment Server version', parseInt)
            .parse(process.argv);

        if(program.h) return false;
        //展示Intro消息
        util.Comment.cout(lang.INTRO);

        return true;
    }

    /**
     * [初始化] Comment参数处理
     * @returns {boolean}
     */
    function init_load_config() {
        if(program.config) { //优先级最高, 使用配置文件
            run_config = util.readJSONFile(program.config);
            if(!run_config) return util.Comment.printError(0);
            if(!run_config.room || !(run_config.room instanceof Object) || !run_config.settings || !(run_config.settings instanceof Object)) return util.Comment.printError(1);
        } else {
            run_config = util.Comment.args2ConfigObject(program);
        }

        var state = util.Comment.checkConfigObject(run_config);
        if(state >= 0) {
            return util.Comment.printError(state);
        }

        //初始化弹幕记录器 （当且仅当允许输出时）
        try{
            if(run_config.settings.output) run_config.recorder = new Recorder.Writer(run_config.settings.output_path, run_config.settings.output_filename);
        } catch (e) {
            return util.Comment.printError(101, e);
        }

        //展示配置
        util.Comment.cout([
            lang.HEADINGS[0],
            [lang.options[0].bold, lang.choices[run_config.settings.showTime ? 1 : 0]],
            [lang.options[1].bold, lang.choices[run_config.settings.showUserName ? 1 : 0]],
            [lang.options[2].bold, lang.choices[run_config.settings.showWatcherNum ? 1 : 0]],
            [lang.options[6].bold, lang.choices[run_config.settings.show_gift ? 1 : 0]],
            [lang.options[7].bold, "v" + run_config.server.version],
            //[lang.options[3].bold, lang.choices[run_config.settings.reconnect ? 1 : 0]],
            [lang.options[4].bold, lang.choices[run_config.settings.output ? 1 : 0]]
        ]);
        if(run_config.settings.output) util.Comment.cout([[lang.options[5].bold, run_config.recorder.targetPath]]);
        util.Comment.cout(lang.BR);

        //展示直播间信息
        util.Comment.cout([
            lang.HEADINGS[1],
            [lang.room_info[0].bold, run_config.room.live_id.toString().cyan],
            [lang.room_info[1].bold, util.Comment.getLiveUrl(run_config.room.live_id).cyan],
            lang.BR
        ]);

        //写记录文件头
        if(run_config.recorder) {
            run_config.recorder.write(0, {
                server: run_config.server,
                room: run_config.room,
                settings: run_config.settings
            });
        }

        //config play speech method for different operating system
        switch (process.platform) {
            case 'darwin':
                play_speech_func = function (text) {
                    speech_sync_spawn("say", [text]);
                }
                break;
            case 'win32':
                play_speech_func = function (text) {
                    // todo implement play speech function
                }
                break;
            default:
                play_speech_func = function (text) {
                    // do_nothing
                }
        }

        return true;
    }

    //Add play_speech function
    function play_speech(text) {
        if (text !== speech_text_cache) {
            play_speech_func(text);
            speech_text_cache = text;
        }
    }

    /**
     * 连接弹幕服务器
     * @param cid
     * @returns {*|Client}
     */
    function connectCommentServer(cid){
        var CommentSocket = require('./v' + run_config.server.version + '/comment_socket').Client;

        var server = new CommentSocket({
            host: run_config.server.host,
            port: run_config.server.port
        });

        server.on('server_error', function(error) {
            util.Comment.printError(900, "服务器发生错误: " + error);
        });

        server.on('close', function() {
            util.Comment.printError(3);
            if(run_config.settings.reconnect) server.connect(cid);
        });

        server.on('error', function(error) {
            util.Comment.printError(901, "发生错误: " + error);
        });

        /**
         * [Event] 登陆成功 / 心跳包
         */
        server.on('login_success', function(num) {
            if(run_config.settings.showWatcherNum) util.Comment.cout(("[系统] 在线人数 " + num.toString()).bold.yellow);

            if(run_config.recorder){ //记录下来
                run_config.recorder.write(1, {action:"watcherNum", num:num});
            }
        });

        /**
         * [Event] 有新的弹幕或者信息
         */
        server.on('newCommentString', function(data) {
            //server bili-live: playtime(stime) mode fontsize color timestamp(date) rnd pool bili-userID bili-danmuID message
            //xml: stime mode fontsize color date pool? bili-userID bili-danmuID
            var date, msg, username = '', text = '', info;

            //普通视频 length==2 ; live length==3
            if(!data && !data.cmd) return util.Comment.cout("[系统] ".bold.yellow + "异常数据".red);

            switch(data.cmd){ //操作命令
                case 'DANMU_MSG': //弹幕
                    info = data.info;//ignore other arguments

                    //获取时间
                    date = info[0][4];
                    msg = info[1];
                    date = util.DateFormat(date, 'hh:mm:ss');//yyyy-MM-dd

                    //获取发布者名称
                    if(info.length >= 3){
                        username = randomColorText(info[2][1]).bold;
                    }

                    if(run_config.settings.showTime) text += ('[' + date + '] ').toString().yellow;
                    text += lang.comment_cmds[data.cmd].bold.green;
                    if(run_config.settings.showUserName) text += username + ": ";

                    text += util.replaceES(msg).bold;
                    util.Comment.cout(text);

                    //Add play speech
                    play_speech(msg);

                    break;
                case 'SEND_GIFT': //礼物
                    info = data.data;//ignore other arguments

                    if(run_config.settings.show_gift) {
                        date = util.DateFormat(info.timestamp, 'hh:mm:ss');
                        if(run_config.settings.showTime) text += ('[' + date + '] ').toString().yellow;
                        text += lang.comment_cmds[data.cmd].bold.magenta;
                        text += (info.uname).bold.cyan + info.action + info.giftName.bold.red + ("*" + info.num).bold;

                        util.Comment.cout(text);

                        //Add play speech
                        play_speech("up主在此墙裂感谢!" + info.uname + info.action + info.giftName + "乘以" + info.num);
                    }
                    break;
                case 'WELCOME':
                    info = data.data;//ignore other arguments

                    text += lang.comment_cmds[data.cmd].bold.red;
                    text += info.uname.bold.red + " ";
                    if (info.isadmin) {
                        text += lang.vip_types[1];
                    } else if (info.svip) {
                        text += lang.vip_types[2];
                    } else if (info.vip) {
                        text += lang.vip_types[0];
                    }
                    text += "进入直播间".bold;

                    util.Comment.cout(text);
                    break;
                case 'SYS_GIFT':
                    if(run_config.settings.show_gift) {
                        text += lang.comment_cmds[data.cmd].bold.green;
                        text += data.msg.bold;
                    }
                    break;
                default:
                    //console.log(data);
            }

            //save Danmu Info
            if(run_config.recorder){
                run_config.recorder.write(1, data);
            }
        });

        /**
         * [Event] 滚动信息
         *
         * data -> json {text:"",highlight:?,bgcolor:?,flash:?,tooltip:?}
         */
        server.on('newScrollMessage', function(data) {

        });

        /**
         * [Event] 未知数据包
         */
        server.on('unknown_bag', function(data) {
            util.Comment.printError(902, "异常数据: " + data);
        });

        server.connect(cid);
        return server;

        function randomColorText(text){
            var _colors = ['yellow', 'red', 'green', 'cyan', 'magenta'];
            return colors[_colors[Math.ceil(Math.random() * _colors.length - 1)]](text);
        }
    }
})();