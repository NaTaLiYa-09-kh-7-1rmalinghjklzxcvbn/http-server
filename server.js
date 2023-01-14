const http = require('http')
const fs = require('fs')
const path = require('path')
const host = 'localhost'
const port = 8000

const requestListener = (req, res) => {
    if (req.method == 'GET' && req.url == '/') {
        try {
            const dirName = fs.readdirSync(path.join(__dirname, '/files'))
            let body = ''
            dirName.forEach((file) => {
                body += file
            })
            res.writeHead(200)
            res.end(body)
        } catch (err) {
            res.writeHead(500)
            res.end('Internal server error')
        }
    } else if (req.url == '/post' && req.method == 'POST') {
        res.writeHead(200)
        res.end('success')
    } else if (req.url == '/delete' && req.method == 'DELETE') {
        res.writeHead(200)
        res.end('success')
    } else if (req.url == '/redirected' && req.method == 'GET') {
        res.writeHead(200)
        res.end('redirected')
    } else if (req.url == '/redirect' && req.method == 'GET') {
        res.writeHead(301, {
            'Location': '/redirected'
        })
        res.end()
    } else {
        res.writeHead(405)
        res.end('HTTP metod not allowed')
    }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
    console.log(`server listen http://${host}:${port}`);
})