//引入服务器
const express = require('express');

//引入auth模块
const auth =require('./wx/auth')

//创建APP对象
const app = express();





//服务器有效性
app.use(auth())

//监听端口
app.listen(8080,() => console.log("服务器启动成功"))