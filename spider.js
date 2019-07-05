/**
 * Created by shenhao on 2018/5/7.
 */
var request = require('request')
var iconv = require('iconv-lite')
var headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.139 Safari/537.36'
 }

function startwork(options,encoding){
    options.encoding = null;
    options.headers = options.headers || headers;
    encoding = encoding || 'gb2312'
    return new Promise(function (resolve, reject) {
        request(options, function (err, res, body) {
            if (err) {
                reject(1);
            }
            if(options.response){
                options.response(resolve, reject,err, res, body);
            }else {
                var html;
                if (!err && res.statusCode == 200) {
                    html = iconv.decode(new Buffer(body, 'binary'), encoding)
                }
                if (typeof(html) != 'undefined') {
                    // console.log(options.url)
                    // console.log(html)
                    var patt = /Content-Type[^>]*?content=[""']*[""']?[^>]*>/
                    // console.log(typeof html)
                    var str = html.match(patt)
                    // console.log(JSON.stringify(str.split('charset=')).split('charset='))
                    if (str != null) {
                        str[0] = JSON.stringify(str[0])
                        // console.log(str[0].indexOf('charset='))
                        if (str[0].indexOf('charset=') == -1) {
                            str[0] = 'utf-8'
                        }else {
                            str[0] = str[0].split('charset=')[str[0].split.length-1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        }
                        html = iconv.decode(Buffer.from(body, 'binary'), str[0])

                    }
                    var patt1 = /<meta charset=[\""']?\D?\W?[^>]*>/
                    var str1 = html.match(patt1);
                    if (str1 != null) {
                        str1[0] = str1[0].split('charset=')[1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        html = iconv.decode(Buffer.from(body, 'binary'), JSON.stringify(str1[0]))
                    }
                }
                // console.log(JSON.stringify(html))

                // var f = res.headers['content-type'].indexOf('charset=')
                // console.log(res.headers['content-type'].split('charset=')[1])
                // console.log(JSON.stringify(iconv.decode(new Buffer(body, 'binary'), encoding)));
                // var patt = iconv.decode(new Buffer(body, 'binary'), encoding).match(/<meta http-equiv=[\""']?\D?\W?Content-Type[^>]*?content=[""']*[""']?[^>]*>/)
                // console.log(patt);
                // console.log(res.headers['content-type'].substring(f));
                //var html = iconv.decode(body, 'gb2312')
                //console.log(html);
                resolve(html);
                // console.log(body);
                // if (res.statusCode == 200) {
                //     console.log(body);
                // } else {
                //     reject(json.errmsg);
                // }
            }
        })
    })
}

function startworkSecond(options,encoding){

    options.encoding = null;
    options.headers = options.headers || headers;
    // options.timeout = 3000;
    encoding = encoding || 'gb2312';
    return new Promise(function (resolve, reject) {
        var r = request(options, function (err, res, body) {
            // clearTimeout(timer)
            if (err) {
                reject('spiderERR:'+err);
            }
            if(options.response){
                options.response(resolve, reject,err, res, body);
            }else {
                var html;
                if (!err && res.statusCode == 200) {
                    html = iconv.decode(Buffer.from(body, 'binary'), encoding)
                }else {
                    // console.log(res.statusCode)
                    // reject('spiderErrCode==:'+res.statusCode);
                }
                if (typeof(html) != 'undefined') {
                    var patt = /Content-Type[^>]*?content=[""']*[""']?[^>]*>/
                    var str = html.match(patt)
                    if (str != null) {
                        str[0] = JSON.stringify(str[0])
                        if (str[0].indexOf('charset=') == -1) {
                            str[0] = 'utf-8'
                        }else {
                            str[0] = str[0].split('charset=')[str[0].split.length-1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        }
                        html = iconv.decode(Buffer.from(body, 'binary'), str[0])
                    }
                    var patt1 = /<meta charset=[\""']?\D?\W?[^>]*>/
                    var str1 = html.match(patt1);
                    if (str1 != null) {
                        str1[0] = str1[0].split('charset=')[1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        html = iconv.decode(Buffer.from(body, 'binary'), JSON.stringify(str1[0]))
                    }
                }
                resolve(html);
            }
        })
        starTimer(r,options);
    })
}
function startworkThird(options,encoding){

    options.encoding = null;
    options.headers = options.headers || headers;
    // options.timeout = 3000;
    encoding = encoding || 'gb2312';
    return new Promise(function (resolve, reject) {
        var r = request(options, function (err, res, body) {
            // clearTimeout(timer)
            if (err) {
                reject('spiderERR:'+err);
            }
            // var cookie = res.headers['set-cookie'];
            // console.log(cookie);
            if(options.response){
                options.response(resolve, reject,err, res, body);
            }else {
                var html;
                if (!err && res.statusCode == 200) {
                    html = iconv.decode(Buffer.from(body, 'binary'), encoding)
                }else if (!err && res.statusCode == 302) {
                    reject(res)
                } else {
                    // console.log(res.statusCode)
                }
                if (typeof(html) != 'undefined') {
                    var patt = /Content-Type[^>]*?content=[""']*[""']?[^>]*>/
                    var str = html.match(patt)
                    if (str != null) {
                        str[0] = JSON.stringify(str[0])
                        if (str[0].indexOf('charset=') == -1) {
                            str[0] = 'utf-8'
                        }else {
                            str[0] = str[0].split('charset=')[str[0].split.length-1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        }
                        html = iconv.decode(Buffer.from(body, 'binary'), str[0])
                    }
                    var patt1 = /<meta charset=[\""']?\D?\W?[^>]*>/
                    var str1 = html.match(patt1);
                    if (str1 != null) {
                        str1[0] = str1[0].split('charset=')[1].replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g,"");
                        html = iconv.decode(Buffer.from(body, 'binary'), JSON.stringify(str1[0]))
                    }
                }
                resolve(html);
            }
        })
    })
}

function starTimer(r,options){
    if(options.timeout > 0){
        timer = setTimeout(function () {
            console.log('starTimer1')
            r.abort();
            console.log('starTimer2');
            reject('spiderERR1:ETimeOut');
            console.log('starTimer3')
        },options.timeout)
    }
}


// module.exports = {startwork:startwork}
module.exports = {startworkSecond:startworkSecond,startworkThird:startworkThird}