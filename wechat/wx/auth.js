
//验证服务器有效性

const sha1 = require('sha1')

//定义配置对象 
const config = require('../config')

//引入工具模块
const {getUserDataAsync,formatData,parserXMLDataAsyc} = require('../utils/tool')
module.exports = () => {

    return async (req,res,next) => {
        // console.log(req.query);
        const {signature,echostr,timestamp,nonce} = req.query
        const {token} = config
    
        const arr = [timestamp,nonce,token];
        const arrSort = arr.sort();
        console.log(arrSort);
        const str = arr.join('')
        console.log(str); 
        const sha1Str = sha1(str)
        console.log(sha1Str);
    
        //sha1验证消息是否一样
        if (sha1Str===signature) {
            res.send(echostr)
        } else {
            res.end('error')
        }

        //测试服务器发送方式

        if (req.method === 'GET'){
            //验证消息是否来自服务器
           if (sha1Str===signature) {
               res.send(echostr)
           } else {
               res.end('error')
           }
        }  else if (req.method === 'POST'){
            //验证消息是否来自服务器
            if (sha1Str !== signature) {
               res.end('error')
           }
            
           //接收请求体数据 
           const xmlData = await getUserDataAsync(req);
        //    console.log(xmlData)
           /*
        开发者id      <xml><ToUserName><![CDATA[gh_df872f0c285d]]></ToUserName>
        用户id        <FromUserName><![CDATA[oWDtu1ZTaUIee5ZvNa3KydaXvvQ0]]></FromUserName>
        时间戳        <CreateTime>1542705154</CreateTime>
        消息类型      <MsgType><![CDATA[text]]></MsgType>
        内容          <Content><![CDATA[JJ]]></Content>
        微信消息id    <MsgId>6625868184229598630</MsgId>
                      </xml>
           */
           //将 xml解析为js对象

           const jsData = await parserXMLDataAsyc(xmlData)
        //    console.log(jsData)

        //    console.log(jsData.xml.Content)

           //格式化数据
           const message = formatData(jsData)
           console.log(message)
        //    console.log(message.FromUserName)

        let content = '12'
        if (message.MsgType === 'text') {
            if (message.Content === '1') {   //全匹配
                content = '我叫橙汁坤'
            } else if (message.Content === '2') {
                content = 'helloworld'
            }    
            // } else if (message.Content.match('敏')) {  //半匹配
            //     content = '你是说渣敏吗';
            // }
            
        }
      
        const replyMessage = '<xml>' +
        '<ToUserName><![CDATA['+message.FromUserName +']]></ToUserName> ' +
        '<FromUserName><![CDATA['+ message.ToUserName+']]></FromUserName> ' +
        '<CreateTime>'+Date.now()+'</CreateTime> ' +
        '<MsgType><![CDATA[text]]></MsgType>' +
        ' <Content><![CDATA['+ content+']]></Content> ' +
        '</xml>';
        console.log(11111111)
         //返回相应给服务器
         //UnhandledPromiseRejectionWarning: Error: Can't set headers after they are sent.
        res.send(replyMessage)    
        //    res.end('')



        }  else {
           res.end('error')
        }
    }

    
}

 