const axios = require('axios')
const base64 = require('base-64')
const yaml = require('js-yaml')
const fs = require('fs')
const process = require('process')

function parse_ss(server_conf) {
    let tmp = server_conf.split('#')
    let name = tmp[1]
    let conf = base64.decode(tmp[0])

    // @ 前为 cipher + password，后为 server+port
    tmp = conf.split('@')
    cipher_password = tmp[0].split(':')
    server_port = tmp[1].split(':')

    return {
        type: "ss",
        name,
        cipher: cipher_password[0],
        password: cipher_password[1],
        server: server_port[0],
        port: server_port[1],
    }
}

function parse_vmess(server_conf) {
    let conf = JSON.parse(base64.decode(server_conf))
    let result  = {
        type: "vmess",
        name: conf["ps"],
        server: conf["add"],
        port: conf["port"],
        uuid: conf["id"],
        alterId: conf["aid"],
        cipher: "auto",
        network: conf["net"],
    }
    return result
}

function parse_server(server) {
    const tmp = server.split('://')
    const protocol_name = tmp[0]
    let server_conf = tmp.slice(1).join('://')
    if (protocol_name == "ss") {
        return parse_ss(server_conf)
    } else if (protocol_name == "vmess") {
        return parse_vmess(server_conf)
    }
}

async function convert(url) {
    // 1. 从订阅拿服务器
    const resp = await axios.get(url)
    // 2. 解析
    const servers = base64.decode(resp.data).split('\n').map(parse_server)

    // 3. 读取 模板
    let tpl = yaml.load(fs.readFileSync(`${__dirname}/../assets/default.yaml`, {encoding: 'utf-8'}))

    // 4. 填充
    let names =  servers.map(item => item['name'])
    tpl['proxies'] = servers
    tpl['proxy-groups'][1]['proxies'] = names

    return yaml.dump(tpl)
}

exports.handler = async (event, context, callback) => {
    const url = event.queryStringParameters.url
    const data = await convert(url)
    callback(null, {
        "isBase64Encoded": false,
        "statusCode": 200,
        "headers": {"Content-Type": 'text/html; charset=utf-8'},
        "body": data
    })
}