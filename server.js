const http = require('http')
const fs = require('fs')
const path = require('path')
const host = 'localhost'
const port = 8000

const user = {
    id: 123,
    username: 'testuser',
    password: 'qwerty'
}

function getCookie(req, cookName) {
    const list = {};
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return null;

    cookieHeader.split(`;`).forEach(function (cookie) {
        let [name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });
    return list[cookName];
}

function isUserAuthorized(req) {
    const userId = getCookie(req, 'userId')
    return (userId == user.id)
}

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
        if (isUserAuthorized(req)) {
            req.setEncoding('utf8');
            let body = ''
            req.on("data", (chunk) => {
                body += chunk
            });
            const { filename, content } = body
            if (content) {
                let createContent = fs.createWriteStream(
                    `./files/${filename}`
                )
                createContent.write(content)
                createContent.end()
            }
            res.end('success')
        } else {
            res.writeHead(401)
            res.end(' Unauthorized')
        }
    } else if (req.url == '/delete' && req.method == 'POST') {
        if (isUserAuthorized(req)) {
            req.setEncoding('utf8');
            req.on("data", (body) => {
                const { filename } = JSON.parse(body)
                console.log(filename);
                fs.unlink(`./files/${filename}`, err => {
                    if (err) {
                        res.writeHead(500).end('Internal Server Error');
                    } else {
                        res.end('success')
                    }
                })
            });
        }
    } else if (req.url == '/redirected' && req.method == 'GET') {
        res.writeHead(200)
        res.end('redirected')
    } else if (req.url == '/redirect' && req.method == 'GET') {
        res.writeHead(301, {
            'Location': '/redirected'
        })
        res.end()
    } else if (req.url == '/auth' && req.method == "POST") {
        let body = ''
        req.setEncoding('utf8');
        req.on("data", (chunk) => {
            body += chunk
        });
        req.on('end', () => {
            try {
                const { username, password } = JSON.parse(body)
                if (username == user.username && password == user.password) {
                    res.writeHead(200, {
                        "set-cookie": `userId=${user.id}; authorized=true; MAX_AGE=172800;domain=localhost; path=/api`
                    })
                    res.end()
                } else {
                    res.writeHead(401)
                    res.end(' Unauthorized')
                }
            } catch (err) {
                console.log(err)
                res.writeHead(400)
                res.end('Bad Request')
            }
        })
    } else {
        res.writeHead(405)
        res.end('HTTP metod not allowed')
    }
}

const server = http.createServer(requestListener)

server.listen(port, host, () => {
    console.log(`server listen http://${host}:${port}`);
})
