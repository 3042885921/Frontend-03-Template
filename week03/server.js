/**
* @file: description
* @author: dongjing03
* @Date: 2020-08-04 20:37:58
* @LastEditors: dongjing03
* @LastEditTime: 2020-08-05 10:05:25
 */
const http = require('http');

http.createServer((request,response)=>{
    let body=[];
    request.on('error',(err)=>{
        console.log(err)
    }).on('data',(data)=>{
        body.push(data.toString());
    }).on('end',()=>{
        body = Buffer.concat(body).toString();
        console.log('body',body);
        response.writeHead(200,{'Content-Type':'text/html'});
        response.end(`<html meta=a >
        <head>
           <style>
               body div #myid {
                   width: 100px;
                   background-color: #ff5000;
               }
               body div img {
                   width: 30px;
                   background-color: #ff1111;
               }
           </style>
        </head>
        <body>
           <div>
               <img id="myid" />
               <img />
           </div>
        </body>`);
    });
}).listen(8088);

console.log('server started');