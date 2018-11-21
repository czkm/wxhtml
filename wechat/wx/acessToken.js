//获取accessToken   有效期2小时 唯一

//读取本地文件  readAccessToken

// 请求access_token 存入本地

//本地有文件

// 读取本地文件 判断是否过期 isValidAccessToken
// 过期
// 重新获取 getAccessToken 
// 覆盖之前的文件 saveAccessToken
// 没有过期
// 直接使用 

//本地无文件
// 获取access_token(getAccessToken) 保存下来(saveAccessToken)

const {appID,appsecret} = require('../config')

const rp = require('request-promise-native')

const  {writeFile,readFile} = require('fs')

class Wechat {
    constructor () {

    }
// 获取access_token(getAccessToken) 
    getAccessToken () {
                   //https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
        const url ='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+appID+'&secret='+appsecret+''
    
    //发送请求  返回promise
    return new Promise((resolve,reject) =>{
        rp({method:'GET',url:url,json:true})
        .then(res => {
            console.log(res)
        //{ access_token: '15_XB9NjZ2kPietuRuV-6F5tP8qHksMTbr7Eu2R0FC1thUxDBus4mli-ZZ3SlMsBS0ftuGvmrmb2H-ZucMiF2tjpegRCc7Hb5F1HIcdZkkSw5GAmv98nMie1ld-LFsB1F93ikCaxhDFi5gKg6rZOSJgAEAAEV',
        // expires_in: 7200 }
        //设置过期时间-5分钟
            res.expires_in = Date.now() + (res.expires_in - 300) *1000
            //更改promise状态  改为成功
            resolve(res)
        })

        .catch(err => {
            console.log(err)
            reject('getAccessToken请求失败'+err)
            //更改promise状态  改为失败

        })
    })
    
    
   }

//保存下来(saveAccessToken)
   saveAccessToken (accessToken) {
    //将对象转换为字符串  
    accessToken = JSON.stringify(accessToken)
    //将access_token保存文件
    return new Promise((resolve,reject) => {
        writeFile('./accessToken.txt',accessToken,err => {
            if(!err){
                console.log("文件保存成功")
                resolve()
            }else{
                console.log("文件保存异常")
                reject(err)
            }
        })
    })

   }

//读取(readAccessToken)
    readAccessToken () {
  //读取本地的access_token文件
    return new Promise((resolve,reject) => {
        readFile('./accessToken.txt',(err,data) => {
            if(!err){
                console.log("文件读取成功")
                //将json字符串转换成js对象
                data = JSON.parse(data)
                resolve(data)
            }else{
                console.log("文件读取异常")
                reject("readAccessToken"+err)
            }
        })
    })

   } 
   
   
// 读取本地文件 判断是否过期 isValidAccessToken
    isValidAccessToken(data) {
        //验证传入的参数是否是有效的
        if(!data && !data.access_token && !data.expires_in){
            //acess_token无效
            return false
        }

        //检测access_token是否在有效期内
        return data.expires_in > Data.now()
        //如果过期时间大于现在时间 返回ture
    }

// 用来获取没有过期的access_token
    fetchAccessToken(){
      if (this.access_token && this.expires_in && this.isValidAccessToken(this)){
          //token有效 直接使用
          return Promise.resolve({
              access_token: this.access_token,
              express_in: this.expires_in
          })
      }
        // return new Promise((resolve,reject) => {
        //是fetchAccessToken的返回值
        return this.readAccessToken()
            .then(async res => {
                //本地有文件
                if(this.isValidAccessToken(res)){
                    //有效的
                return Promise.resolve(res)
                } else{
                //重新获取 getAccessToken 
                const res = await this.getAccessToken()
                //保存至本地
                await this.saveAccessToken(res)
                    
                // resolve(res)
                return Promise.resolve(res)


               
                }
            })
            .catch(async err => {
                //重新获取 getAccessToken 
                const res = await this.getAccessToken()
                //保存至本地
                await this.saveAccessToken(res)
                    
                // resolve(res)
                return Promise.resolve(res)

            })
                .then(res => {
                    //将access_token成功的内容挂载到this上
                    this.access_token = res.access_token
                    this.expires_in = res.expires_in

                    //返回res 包装了一层promise对象（成功）

                    //是this.readAccessToken()最终返回值
                    return new Promise.resolve(res)
                })
        // })
    }
}


//模拟测试
const w = new Wechat()

new Promise((resolve,reject) => {
    w.readAccessToken()
    .then(res => {
        //本地有文件
        if(w.isValidAccessToken(res)){
            //有效的
            resolve(res)
        } else{
        //重新获取 getAccessToken 
        w.getAccessToken()
        .then(res => {
            
            w.saveAccessToken(res)
                .then(() => {
                    resolve(res)
                })
        })

        }
    })
    .catch(err => {
        //本地无文件
        //重新获取 getAccessToken 
        w.getAccessToken()
            .then(res => {
                
                w.saveAccessToken(res)
                    .then(() => {
                        resolve(res)
                    })
            })
    })
}) .then(res => {
    console.log(res)
})
    
