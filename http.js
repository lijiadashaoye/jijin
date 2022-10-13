import fs, {
    readFile,
    readFileSync,
    unlink,
    writeFile,
    existsSync

} from 'fs';
import http from 'http';
import https from 'http';
import xlsx from 'node-xlsx';

http.createServer((req, res) => {
    if (req.url != '/favicon.ico') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Max-Age', '100000');
        res.setHeader('Cache-Control', 'max-age=2000');
        res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        res.setHeader('Referer-Policy', 'strict-origin-when-cross-origin');

        var k = req.url.slice(1).split('/'),
            url = '';
        // 读取excel文件
        if (k[0] === 'wenjian') {
            res.setHeader('Content-Type', 'application/octet-stream') // 二进制流数据（如常见的文件下载）
            let data = readFileSync('./JiJin.xlsx')
            let sheet = JSON.stringify(xlsx.parse(data)[0]);
            res.end(sheet)
        }
        // 获取页面使用的以存储的数据文件
        if (k[0] === 'getPageData') {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            if (existsSync('./pageData.json')) {
                let data = readFileSync('./pageData.json');
                res.end(data)
            } else {
                res.end('[]')
            }
        }
        // 获取页面使用的以存储的数据文件
        if (k[0] === 'shouyi') {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            if (existsSync('./shouyi.json')) {
                let data = readFileSync('./shouyi.json');
                res.end(data)
            } else {
                res.end('[]')
            }
        }

        // 获取基金持仓数据
        if (k[0] === 'chicang') {
            url = `http://fund.10jqka.com.cn/web/fund/stockAndBond/${k[1]}`;
            res.setHeader('Content-Type', 'text/html;charset=gbk')
            http.get(url,
                (req) => {
                    var datas = '';
                    req.on('data', (data) => {
                        datas += data;
                    });
                    req.on('end', () => {
                        res.end(datas)
                    });
                })
        }
        // 存储页面使用的数据到文件
        if (k[0] === 'savePageData') {
            res.setHeader('Content-Type', 'application/json;charset=utf-8')
            var data = '';
            req.on('data', function (mock) {
                data += mock
            })
                .on('end', function () {
                    unlink('./pageData.json', err => {
                        writeFile('./pageData.json', data, e => {
                            var k = e ? 'false' : data;
                            res.end(k)
                        })
                    });
                })
        }
        // 存储页面使用的数据到文件
        if (k[0] === 'reset') {
            res.setHeader('Content-Type', 'application/json;charset=utf-8')
            // 删除基金数据文件
            unlink('./pageData.json', err => {
                var k = err ? 'false' : 'true';
                res.end(k)
            });
        }
    } else {
        res.end('')
    }

}).listen(5555)