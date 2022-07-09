const fuck = require('../lib')

async function main() {
    console.log(fuck.handler({
        queryStringParameters: {
            url: 'just my socks subscribe url'
        }
    }, undefined, (data) => {
        console.log(data)
    }))
}


main()