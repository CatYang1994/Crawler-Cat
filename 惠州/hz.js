var spider = require('../../spider');
var fs = require("fs");
var async = require('async');
var xlsx = require('node-xlsx');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var sheets = '';
var mysql  = require('mysql');
var transcoding = require('../../utf-gbk');
var hzHomeUrl = 'http://bbs.xizi.com/searcher.php';
var headers = {
    'Referer': 'http://bbs.xizi.com/searcher.php',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36',
}

var connection = mysql.createConnection({
    // host     : '118.24.157.218',
    // host : '192.168.42.1',
    host:'localhost',
    user     : 'root',
    password : 'password',
    port: '3306',
    database: 'JZB_Comments',
});
var verifyhash = '';
function getExcel() {
    sheets = xlsx.parse('惠州-学校汇总.xlsx');
    sheets.forEach(function (sheet) {
        // console.log(sheet['data'][0][0]);
        for (var rowId in sheet['data']) {
            schoolIdArray.push(sheet['data'][rowId][0]);
            schoolNameArray.push(sheet['data'][rowId][1]);
            // addressArray.push(sheet['data'][rowId][2]);
            // longtitudeArray.push(sheet['data'][rowId][3]);
            // latitudesArray.push(sheet['data'][rowId][4]);
            // areaCodeArray.push(sheet['data'][rowId][5]);
        }
        spider.startworkSecond({'url':hzHomeUrl,'headers':headers},'gbk')
            .then(function (codeData) {
                verifyhash = cheerio.load(codeData)('input[name="verify"]').val();
                searchSchool();
            })

    })
}
var schoolIdArray = [];
var schoolNameArray = [];
// var addressArray = [];
// var longtitudeArray = [];
// var latitudesArray = [];
// var areaCodeArray = [];
function getIndex(callback) {
    fs.readFile('index.txt', 'utf8', function(err, data){
        var array = data.split(',');
        // console.log(array[array.length-2]);
        callback(array[array.length-2]);
    });
}
function setIndex(index,callback) {
    var writerStream = fs.createWriteStream('index.txt', {'flags': 'a'});
// 使用 utf8 编码写入数据
    writerStream.write(index+',', 'utf-8');
// 标记文件末尾
    writerStream.on('finish', function () {
        // console.log("写入完成。");
        callback();
    });
    writerStream.end();

    writerStream.on('error', function (err) {
        console.log(err.stack);
    });
}
function setCommentsName(name,callback) {
    var writerStream = fs.createWriteStream('commentsName.txt', {'flags': 'a'});
// 使用 utf8 编码写入数据
    writerStream.write(name+',', 'utf-8');
// 标记文件末尾
    writerStream.on('finish', function () {
        // console.log("写入完成。");
        callback();
    });
    writerStream.end();

    writerStream.on('error', function (err) {
        console.log(err.stack);
    });
}
function getCommentsName(callback) {
    fs.readFile('commentsName.txt', 'utf8', function(err, data){
        var array = data.split(',');
        // console.log(array[array.length-2]);
        callback(array[array.length-2]);
    });
}
getExcel();
var headers1 = {
    'Accept' :'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    // 'Accept-Encoding': 'gzip, deflate',
    'Accept-Language': 'en,zh;q=0.9,zh-CN;q=0.8',
    'Cache-Control': 'max-age=0',
    'Connection': 'keep-alive',
    'Content-Type': 'application/x-www-form-urlencoded',
    'Host': 'bbs.xizi.com',
    'Origin': 'http://bbs.xizi.com',
    'Referer': 'http://bbs.xizi.com/searcher.php',
    // 'Upgrade-Insecure-Requests': 1,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
}
var schoolName = '';
var haveBeenTocommentName = false;
function searchSchool() {
    getIndex(function (index) {
        var area = ['博罗','惠城','惠东','惠阳','龙门'];
        schoolName = schoolNameArray[index];
        // schoolName = '一中';
        for (var i = 0; i < area.length; i++) {
            schoolName = schoolName.replace(area[i],'');
        }
        schoolName = schoolName.replace('惠州','');
        schoolName = schoolName.replace('市','').replace('区','');

        if (schoolName.indexOf('-') > -1) {
            schoolName = schoolName.split('-')[0];
        }
        if (schoolName.indexOf('(') > -1) {
            schoolName = schoolName.split('(')[0];
        }
        if (schoolName.indexOf('（') > -1) {
            schoolName = schoolName.split('（')[0];
        }
        var checkname = schoolName;
       schoolName = transcoding.utf2gb(escape(schoolName)).toUpperCase()
        var searchUrl = {
            url:'http://bbs.xizi.com/searcher.php',
            headers:headers1,
            method: "POST",
            body:'keyword='+schoolName+'&verify='+verifyhash+'&step=2&type=thread'
        }
        spider.startworkSecond(searchUrl,'gbk')
            .then(function (searchData) {
                // console.log(cheerio.load(searchData)('.main_min dl').eq(0).find('dt a').text());
                var pages = [];
                if (cheerio.load(searchData)('.pages').html() != null) {
                    // console.log(parseInt(cheerio.load(searchData)('.pages>a').eq(-1).text().substring(1).substring(1).substring(1)));
                    for (var i = 1; i < parseInt(cheerio.load(searchData)('.pages>a').eq(-1).text().substring(1).substring(1).substring(1))+1; i++) {
                        pages.push(i);
                    }
                }else {
                    pages.push(1)
                }
                var curr = 1;
                async.eachLimit(pages,1,function (searchSchoolIndex,nextSearchSchoolPage) {
                    spider.startworkSecond({'url':'http://bbs.xizi.com/searcher.php?keyword='+schoolName+'&type=thread&threadrange=1&username=&starttime=&endtime=&fid=&sortby=postdate&page='+searchSchoolIndex},'gbk')
                        .then(function (data) {
                            console.log('共 '+pages.length+' 页');
                            console.log('目前爬取第 '+curr+' 页');
                            // console.log(cheerio.load(data)('.main_min dl').eq(0).find('dt a').text());
                            async.eachLimit(cheerio.load(data)('.main_min dl'),1,function (dlItem,dlNext) {
                                // 判断学校名字和帖子名是否包含
                                if (cheerio.load(dlItem)('dt a').text().indexOf(checkname) != -1) {//判断是否存在关键词
                                    if (parseInt(cheerio.load(dlItem)('.num').text()) > 1) {//回复是否大于1
                                        if (parseInt(cheerio.load(dlItem)('.author cite').text()) > 2000) {//判断2000年之后的
                                            var commentsName = cheerio.load(dlItem)('dt a').text();
                                            getCommentsName(function (name) {
                                                if (name == commentsName) {
                                                    haveBeenTocommentName = true;
                                                }
                                                console.log(name);
                                                if (name == undefined) {
                                                    haveBeenTocommentName = true;
                                                }
                                                if (haveBeenTocommentName) {
                                                    setCommentsName(commentsName,function () {//获取爬取到那个
                                                        var commentUrl = 'http://bbs.xizi.com/'+cheerio.load(dlItem)('dt a').attr('href');
                                                        // var commentUrl = 'http://bbs.xizi.com/thread-4594488-1-1.html'
                                                        spider.startworkSecond({'url':commentUrl,'headers':headers1},'gbk')
                                                            .then(function (commentsData) {
                                                                var commentsDataPage = [];
                                                                if (cheerio.load(commentsData)('.pages').html() != null) {
                                                                    for (var i = 1; i < parseInt(cheerio.load(commentsData)('.pages').children().eq(-1).text())+1; i++) {
                                                                        commentsDataPage.push(i);
                                                                    }
                                                                } else {
                                                                    commentsDataPage.push(1)
                                                                }
                                                                var first = 1;
                                                                async.eachLimit(commentsDataPage,1,function (commentsPageItem,nextCommentsPage) {
                                                                    var commentUrlPage = commentUrl.split('-')[0] +'-'+ commentUrl.split('-')[1] +'-'+ commentsPageItem+'-' + commentUrl.split('-')[3];
                                                                    spider.startworkSecond({'url':commentUrlPage,'headers':headers1},'gbk')
                                                                        .then(function (nextCommentsData) {
                                                                            // console.log(cheerio.load(nextCommentsData)('.f14.mb10').text().trim())
                                                                            var firstComment = cheerio.load(nextCommentsData)('#pw_content .read_t').eq(0).find('.f14.mb10').text().trim();
                                                                            var commentsTitle = cheerio.load(nextCommentsData)('#subject_tpc span').text().trim() +' ## '+ firstComment;
                                                                            var firstCommentClientName = cheerio.load(nextCommentsData)('#pw_content .read_t').eq(0).find('.username a').text().trim();
                                                                            var type = '';
                                                                            if (commentsTitle.indexOf('?') >= 0|| commentsTitle.indexOf('？') >= 0) {
                                                                                type = '问答'
                                                                            }else {
                                                                                type = '点评'
                                                                            }
                                                                            console.log(cheerio.load(nextCommentsData)('#subject_tpc').text().trim() )
                                                                            // console.log(commentsTitle);
                                                                            async.eachLimit(cheerio.load(nextCommentsData)('#pw_content .read_t'),1,function (commentsIndex,nextIndex) {
                                                                                if (first == 1) {
                                                                                    first += 1;
                                                                                    nextIndex()
                                                                                }else {
                                                                                    var $ = cheerio.load(commentsIndex);
                                                                                    var cammentTime = '';
                                                                                    if ($('.s3').text().trim().indexOf('天') != -1 || $('.s3').text().trim().indexOf('分钟前') != -1) {
                                                                                        var date=new Date();
                                                                                        var year=date.getFullYear(); //获取当前年份
                                                                                        var mon=date.getMonth()+1; //获取当前月份
                                                                                        var da=date.getDate(); //获取当前日
                                                                                        var h=date.getHours(); //获取小时
                                                                                        var m=date.getMinutes(); //获取分钟
                                                                                        var oldTime = $('.s3').text().trim();
                                                                                        if ($('.s3').text().trim().indexOf('前天') != -1) {
                                                                                            da = da-2;
                                                                                            oldTime = oldTime.split('前天')[1];
                                                                                        }
                                                                                        if ($('.s3').text().trim().indexOf('昨天') != -1) {
                                                                                            da = da-1;
                                                                                            oldTime = oldTime.split('昨天')[1];
                                                                                        }
                                                                                        if ($('.s3').text().trim().indexOf('今天') != -1) {
                                                                                            oldTime = oldTime.split('今天')[1];
                                                                                        }
                                                                                        if ($('.s3').text().trim().indexOf('分钟前') != -1) {
                                                                                            m = parseInt($('.s3').text().trim().substring(1).substring(1).substring(1))-m
                                                                                            if (m < 0) {
                                                                                                m = "00";
                                                                                            }
                                                                                            oldTime = h +':' +m
                                                                                        }
                                                                                        cammentTime = year+'-'+mon+'-'+da+oldTime
                                                                                        // console.log(year+'-'+mon+'-'+da+oldTime);
                                                                                    }else {
                                                                                        cammentTime = $('.s3').text().trim();
                                                                                    }
                                                                                    var clientName = $('.readName a').text().trim();
                                                                                    var commentsContent = cheerio.load(commentsIndex)('.f14.mb10').text().trim()
                                                                                    var date = new Date();
                                                                                    var Y = date.getFullYear() + '-';
                                                                                    var M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
                                                                                    var D = date.getDate() + ' ';
                                                                                    var h = date.getHours() + ':';
                                                                                    var m = date.getMinutes() + ':';
                                                                                    var s = date.getSeconds();
                                                                                    // console.log(Y+M+D+h+m+s); //呀麻碟
                                                                                    var setTime = Y+M+D+h+m+s;
                                                                                    connection.query('INSERT INTO huizhou SET  ?',{
                                                                                        id:0,
                                                                                        school_id:schoolIdArray[index],
                                                                                        school_name:schoolNameArray[index],
                                                                                        comments_title:commentsTitle,
                                                                                        comments_client_name:firstCommentClientName,
                                                                                        type:type,
                                                                                        // address:addressArray[index],
                                                                                        client_name:clientName,
                                                                                        comments_content:commentsContent,
                                                                                        comments_time:cammentTime,
                                                                                        set_time:setTime,
                                                                                        // longtitude:longtitudeArray[index],
                                                                                        // latitude:latitudesArray[index],
                                                                                        // area_code:areaCodeArray[index]
                                                                                    },function (err,data) {
                                                                                        if (err) {
                                                                                            console.log('INSERT ERROR-',err.message);
                                                                                            setTime(function () {
                                                                                                nextIndex();
                                                                                            },1000)
                                                                                        }else {
                                                                                            console.log('插入成功');
                                                                                            setTime(function () {
                                                                                                nextIndex();
                                                                                            },1000)
                                                                                        }
                                                                                    })

                                                                                }
                                                                            },function (err) {
                                                                                if (err) {
                                                                                    console.log('commentsIndexErr -- '+err)
                                                                                }
                                                                                setTimeout(function () {
                                                                                    nextCommentsPage();
                                                                                },3000)
                                                                            })
                                                                        })
                                                                        .catch(function (err) {
                                                                            console.log('commentsPageItemErr -- '+err);
                                                                        })
                                                                },function (err) {
                                                                    if (err) {
                                                                        console.log('commentsPageItemErr --- '+err);
                                                                    }
                                                                    setTimeout(function () {
                                                                        dlNext();
                                                                    },5000);
                                                                })
                                                            })
                                                    })
                                                }else {
                                                    dlNext();
                                                }
                                            })

                                        }else {
                                            dlNext();
                                        }
                                    }else {
                                        dlNext();
                                    }
                                }else {
                                    dlNext();
                                }
                            },function (err) {
                                if (err) {
                                    console.log('dlItemErr -- ' + err);
                                }
                                curr++;
                                nextSearchSchoolPage();
                            })
                        })
                        .catch(function (err) {
                            console.log('dataErr == '+err)
                        })
                },function (err) {
                    if (err) {
                        console.log('nextSearchSchoolPageErr --- '+err);
                    }
                    console.log('等待五秒，下一间学校');
                    setTimeout(function () {
                        getIndex(function (index) {
                            var index = parseInt(index)+1;
                            setIndex(index,function () {
                                searchSchool();
                            })
                        })
                    },6000);
                })

            })
            .catch(function (err) {
                console.log(err);
            })
    })
}