# bili-comment - Bilibili 直播弹幕助手 #

* 下载和开发文档: [API Documentation](http://bili.micblo.com/)
* 快速配置工具: [Config](http://bili.micblo.com/#config/tool)

`Bilibili 直播弹幕助手` 是一个帮助播主快速查看直播弹幕的工具。

##功能 ##

1. 连接bilibili弹幕服务器(支持原弹幕服务器和XMLSocket的弹幕服务器)
2. 看弹幕、看礼物、看老爷（大雾）
3. 储存弹幕和其它信息

## 安装 ##

> 需要安装: Node.js (开发环境 : v5.0.0)
>
> 需要 `npm install --registry=http://r.cnpmjs.org` 初始化必要的 `node_modules`

## 使用 ##

现在的`Bilibili 直播弹幕助手`支持两种启动的方式。第一种是带命令行参数运行，第二种是通过读取配置文件运行。

前者为专家模式，专家们可以运行`node cli -h`查看帮助，或者利用命令行生成配置文件（查看帮助: `node configBuilder -h`）。

后者为简单的方法，可以通过命令行程序或者网页端生成的配置文件启动助手。

### 配置 ###

* 快速配置工具: [Config](http://bili.micblo.com/#config/tool)

将生成的 `config.json` 文件保存到助手根目录。

### 使用 ###

#### Windows ####

在Windows下，使用记事本，将以下代码复制并粘贴到记事本，保存为 `run.cmd` (注意:格式必须为 `.cmd`!)。

```
node cli -c {替换为配置文件的相对路径}
pause
```

如:
```
node cli -c sample/config.json
pause
```

以后只需要双击运行 `run.cmd` 就可以了。

#### Linux ####

通过Bash或者其它手段建启动脚本，老司机们都会啦。

## 二次开发 ##

`Bilibili 直播弹幕助手` 预留了方便`Node.js`程序猿调用的接口。

`require("index.js")`可以访问`Bilibili 直播弹幕助手`的内部库。

- `Lang`: 语言包
- `CommentClient`: 弹幕客户端
- `CommentRecorder`： 弹幕记录器
- `CommentSocket`： 弹幕服务器Socket
- `ConfigBuilder`： 助手配置文件生成器
- `LiveAPI`: 直播间API SDK
