/**
 * Created by Payne on 2016/1/18 0018.
 *
 * [Library] 助手配置生成器
 *
 * 功能：
 * 1. 生成助手所需要的配置文件
 */
var fs = require("fs");
var program = require('commander');
var colors = require('colors');
var util = require('../util');

//Command 配置
program
    .version('1.1.0')
    .option('-c, --config <path>', 'Set Config File Path (default: config.json)')
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

    .option('-h, --host <url>', 'Set Comment Server host')
    .option('-p, --port <url>', 'Set Comment Server port', parseInt)

    .option('--sver <url>', 'Set Comment Server version', parseInt)
    .parse(process.argv);

if(program.h) return false;

var run_config = util.Comment.args2ConfigObject(program);
var state = util.Comment.checkConfigObject(run_config);
if(state >= 0) {
    return util.Comment.printError(state);
}
fs.writeFileSync((program.config ? program.config : "config.json"), JSON.stringify(run_config));
console.log("success!".bold.green);