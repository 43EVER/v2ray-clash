# justmysocks-clash

## 介绍
将 justmysocks 订阅转为 clash 订阅，当前使用百度智能云的 cfc 部署。

## 工作原理
使用 HTTP 触发器，通过 query 将订阅链接传给服务端，服务端请求订阅链接拿到各个协议的服务器，按照模板生成订阅文件回传。

:warning: **只支持 v2ray tcp 和 ss 协议**（即 justmysocks 默认配置），其他的未经测试。
