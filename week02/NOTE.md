### 有限状态机

1. 每一个状态都是一个机器
   - 每一个机器里，我们都可以做计算，存储，输出
   - 所有的这些机器的接受的输入是一致的
   - 状态机的每一个机器本身没有状态，如果我们用函数来表示的话，他应该是纯函数（无副作用）
2. 每一个机器知道下一个的状态
   - 每个机器都有确定的下一个状态（Moore）
   - 每个机器根据输入决定下一个状态（Mealy）



Js中的有限状态机（Mealy）

  ```javascript
//每一个函数是一个状态
function state(input){ //函数参数就是输入
  //在函数中，可以自由的编写代码，处理每个状态的逻辑
  return next; //返回值作为下一个状态
}

//调用
while(input){
  state = state(input); //把状态机的返回值作为下一个状态
}
  ```

### 浏览器工作原理
  从一个url输入到浏览器显示发生的步骤：
    url解析 ==》 html parse ==》 dom ==》 dom with css ==> dom with position ==> bitmap




### http请求：

1. ISO-OSI 七层网络模型
   物理层 数据链路层  网络层 传输层 会话层 表示层 应用层
 

2. http请求总结

   content-type是一个必要的字段，需要有默认的值

   body是KV形式

   不同的content-type影响body的格式

3. 实现一个http请求需要经过5步
   - 第一步 设计一个http请求的类
   - 第二步 实现send
   - 第三步 发送请求
   - 第四步 ResponseParser
   - 第五步 BodyParser

