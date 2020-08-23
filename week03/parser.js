const css  = require('css');
const layout = require('../week04/layout');
const EOF = Symbol('EOF');
const { match } = require('assert');

let currentToken = null; 

let currentAttrbute=null; //属性
let stack = [{type:'document',children:[]}];
let currentTextNode = null;


//存储css规则
let cssRules=[];
function addCSSRules(text){
  let ast = css.parse(text);
  console.log(JSON.stringify(ast,null,"  "));
  cssRules.push(...ast.stylesheet.rules);
}

/**
 * @description 复合选择器
 * @param {*} element 
 * @param {*} selector
 * 这里仅处理简单选择器：类选择器，id，元素
 */
function match(element,selector){
    //用attrbute判断当前元素是否是文本节点，如果是文本节点，就直接结束
    if(!selector||!element.attributes){
        return false;
    }
    if(selector.charAt(0)=='#'){
      var attr = element.attributes.filter(attr=>attr.name=='id')[0];
      if(attr&&attr.value===selector.replace('#','')){
          return true;
      }
    }else if(selector.charAt(0)=='.'){
      var attr = element.attributes.filter(attr=>attr.name==='class')[0];
      if(attr&&attr.value===selector.replace('.','')){
          return true;
      }
    }else{
        if(element.tagName===selector){
            return true;
        }
    }
    return false;
}

/**
 * 
 * @param {*} selector 
 */
function specificity(selector){
 var p = [0,0,0,0];
 var selectorParts = selector.split(' ');
 for(var part of selectorParts){
     if(part.charAt(0)=='#'){
         p[1] += 1;
     }else if(part.charAt(0)=='.'){
         p[2] += 1;
     }else {
         p[3] += 1;
     }
 }
 return p;

}

function compare(sp1, sp2) {
    if (sp1[0] - sp2[0]) {
      return sp1[0] - sp2[0];
    }
    if (sp1[1] - sp2[1]) {
      return sp1[1] - sp2[1];
    }
    return sp1[3] - sp2[3];
  }


// 计算css
function computeCss(element){
    // 获取父元素序列
   var elements = stack.slice().reverse();
   if( !element.computedStyle ){
       element.computedStyle = {};
   }
   for(let rule of rules){
    // 简单选择器
     var selectorParts = rule.selectors[0].split(' ') .reverse();
   
    // 简单选择器最后一个reverse的0跟当前元素计算是否匹配
    if(!match(element,selectorParts[0])){
        continue;
    }

    let matched = false;
    var j=1; //当前选择器的位置
    for(var i = 0;i < elements.length ;i++){
        if(match(elements[i],selectorParts[j])){
            // 如果元素能够匹配到选择器，则j进行自增的操作
            j++;
        }
    }
    // 如果所有选择器都被匹配到，则匹配成功
    if(j>=selectorParts.length){
        matched = true;
    }

    if(matched){
      console.log('element',element,'matched rule',rule);
      var sp = specificity(rule.selectors[0]);
      var computedStyle = element.computedStyle;
      for(var declaration of rule.declarations){
          if(!computedStyle[declaration.property]){
              computedStyle[declaration.property]={};
          }
          if(!computedStyle[declaration.property].specificity){
              computedStyle[declaration.property].value = declaration.value;
              computedStyle[declaration.property].specificity = sp;
          }else if(compare(computedStyle[declaration.property].specificity,sp)<0){
              computedStyle[declaration.property].value = declaration.value;
              computedStyle[declaration.property].specificity = sp;
          }

      }
      console.log(element.computedStyle);
    }



    }
}


function emit(token) {
  let top = stack[stack.length -1];
  if(token.type=='startTag'){
      let element={
          type:'element',
          children:[],
          attributes:[]
      };
      element.tagName = token.tagName;
      for (let p in token) {
        if (p != "type" && p != "tagName") {
          element.attributes.push({
            name: p,
            value: token[p]
          });
        }
      }
      // 计算css
      computeCss(element);
      top.children.push(element);
      if(!token.isSelfClosing){
          stack.push(element);
      }
      currentTextNode =null;
  }else if(token.type == 'endTag'){
      if(top.tagName!=token.tagName){
          throw new Error("Tag start end doesn't match!");
      }else{
          //-----------遇到style标签，执行添加css规则的操作--------
          if(top.tagname =='style'){
              addCSSRules(top.children[0].content);
          }
          layout(top);
          stack.pop();
      }
  }else if(token.type =='text'){
      if(currentTextNode==null){
          currentTextNode ={
              type:'text',
              content:''
          }
          top.children.push(currentTextNode);
      }
      currentTextNode.content +=token.content;
  }
}

const EOF = Symbol("EOF");
/**
 * @description 第一步开始解析数据
 * @param {*} c
 */
function data(c) {
  if (c == "<") {
    return tagOpen;
  } else if (c == EOF) {
    //错误
    emit({
      type: "EOF",
    });
    return;
  } else {
    emit({
      type: "text",
      content: c,
    });
    return data;
  }
}

/**
 * @description 标签解析
 * @param {*} c
 */
function tagOpen(c) {
  if (c == "/") {
    return endTagOpen;
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: "startTag",
      tagName: "",
    };
    return tagName(c);
  } else {
    return;
  }
}

/**
 * @description 结束标签
 * @param {*} c
 */
function endTagOpen(c) {
  if (c.match(/^[a-zA_Z]$/)) {
    currentToken = {
      type: "endTag",
      tagName: "",
    };
    return tagnName(c);
  } else if (c == ">") {
  } else if (c == EOF) {
  } else {
  }
}

/**
 * @description 标签名字解析
 * @param {*} c
 */
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    //4种有效的空白符结束：tab符，换行符，禁止符和空格<html prop
    return beforeAttributeName;
  } else if (c == "/") {
    //<div/>
    currentToken.tagname += c;
    return selfClosingStartTag;
  } else if (c.match(/^[a-zA-Z]$/)) {
    return tagName;
  } else if (c == ">") {
    emit(currentToken);
    // 普通的开始标签，继续回到data状态解析下一个标签
    return data;
  } else {
    return tagName;
  }
}

/**
 * @description 是否进行属性解析
 * @param {*} c
 */
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f]$/)) {
    // 4种有效的空白符结束：tab  换行  禁止  空格
    return beforeAttributeName;
  } else if (c == "/" || c == ">" || c == EOF) {
    return afterAttributeName(c);
  } else if (c == "=") {
  } else {
    currentAttrbute = {
      name: "",
      value: "",
    };
    console.log("curretAttribute", currentAttribute);
    return attributeName(c);
  }
}

/**
 * @description 属性名字解析
 * @param {*} c
 */
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    return afterAttributeName(c);
  } else if (c == "=") {
    return beforeAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == '"' || c == "'" || c == "<") {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}

/**
 * @description 属性值解析
 * @param {*} c
 */
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == "/" || c == ">" || c == EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return dobuleQuotedAttributeValue;
  } else if (c == "'") {
    return singleQuotedAttributeValue;
  } else if (c == ">") {
  } else {
    return UnquotedAttributeValue(c);
  }
}

/**
 * @description 双引号包裹的属性值
 * @param {*} c 
 */
function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}

/**
 * @description 单引号包裹属性值
 * @param {*} c 
 */
function singleQuotedAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c == "\u0000") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}
/**
 * @description 
 * @param {*} c 
 */
function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName;
  } else if (c == "/") {
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}
function UnquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c == "/") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c == ">") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c == "\u0000") {
  } else if (c == '"' || c == "'" || c == "<" || c == "=" || c == "`") {
  } else if (c == EOF) {
  } else {
    currentAttribute.value += c;
    return UnquotedAttributeValue;
  }
}
function selfClosingStartTag(c) {
  if (c == "c") {
    currentToken.isSelfClosing = true;
    return data;
  } else if (c === "EOF") {
  } else {
  }
}

// 状态机实现
module.exports.parseHTML = function parseHTML(html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
};
