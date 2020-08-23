const { EEXIST } = require("constants");


/**
 * @description 获取样式
 * @param {*} element 
 */
function  getStyle(element){
   if(!element.style){
       element.style={}
   }
   for(let prop in element.computedStyle){
       var p = element.computedStyle.value;
      element.style[prop] = element.computedStyle[prop].value;

      if(element.style[prop].toString().match(/px$/)){
          element.style[prop] = parseInt(element.style[prop]);
      }
      if(element.style[prop].toString().match(/^[0-9\.]+$/)){
          element.style[prop] = parseInt(element.style[prop]);
      }
   }

   return element.style;
}



/**
 * @description 布局函数
 * @param {*} element 
 * 目前仅判断flex布局模式
 */
function layout(element){
    if(!element.computedStyle){
        return;
    }
    var elementStyle = getStyle(element);
    if(elementStyle.display !== 'flex'){
        return;
    }
    var items = element.children.filter(item=>item.ype==='element');
    items.sort((a,b)=>{return (a.order||0)-(b.order||0)});
    var style = computedStyle;
   
    ['width','height'].forEach(size=>{
        if(style[size]==='auto'||style[size]===''){
            style[size]=null;
        }
    })
    // 设置flex中相关属性的默认值
    if(!style.flexDirection||style.flexDirection==='auto'){
        style.flexDirection = 'row'; 
    }else if(!style.alignItems||style.alignItems==='auto'){
        style.alignItems='stretch';
    }else if(!style.justifyContent||style.justifyContent=='auto'){
        style.justifyContent = 'flex-start';
    }else if(!style.alignContent||style.alignContent==='auto'){
        style.alignContent = 'stretch';
    }else if(!style.flexWrap || style.flexWrap ==='auto'){
        style.flexWrap = 'nowrap';
    }

    var mainSize,mainStart,mainEnd,mainSign,mainBase,
        crossSize,crossStart,crossEnd,crossSign,crossBase;

    // 将布局的属性转换成mainSize，crossSize等变量，方便使用
    if(style.flexDirection==='row'){
        mainSize = 'width';
        mainStart = 'left';
        mainEnd = 'right';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }

    if(style.flexDirection === 'row-reverse'){
        mainSize = 'width';
        mainStart = 'right';
        mainEnd = 'left';
        mainSign = -1;
        mainBase = style.width;

        crossSize = 'height';
        crossStart = 'top';
        crossEnd = 'bottom';
    }
    if(style.flexDirection==='column'){
        mainSize = 'height';
        mainStart = 'top';
        mainEnd = 'bottom';
        mainSign = +1;
        mainBase = 0;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }

    if(style.flexDirection === 'column-reverse'){
        mainSize = 'height';
        mainStart = 'bottom';
        mainEnd = 'top';
        mainSign = -1;
        mainBase = style.height;

        crossSize = 'width';
        crossStart = 'left';
        crossEnd = 'right';
    }
    if(style.flexWrap === 'wrap-reverse'){
        var tmp = crossStart;
        crossStart = crossEnd;
        crossEnd = tmp;
        crossSign = -1;
    }else{
        crossBase = 0;
        crossSign = 1;
    }
   
    var isAutoMainSize = false;
    // 自适应尺寸
    if(!style[mainSize]){
        elementStyle[mainSize] = 0;
        for(var i = 0; i <items.length;i++){
            var item = items[i];
            if(itemStyle[mainSize] !== null||itemStyle[mainSize]!==0){
                elementStyle[mainSize] = elementStyle[mainSize];
            }
            isAutoMainSize = true;
        }
    }

    var flexLine = [];
    var flexLines = [flexLine];

    var mainSpace = elementStyle[mainSize];
    var crossSpace = 0;
    for(var i=0;i<items.length;i++){
        var item = items[i];
        var itemStyle = getStyle(item);
        if(itemStyle[mainSize]===null){
            itemStyle[mainSize]=0; //没有设置主轴尺寸，则给个默认值0
        }


        if(itemStyle.flex){
            flexLine.push(item);
        }else if(style.flexWrap === 'noWrap'&&isAutoMainSize){
            mainSpace -=itemStyle[mainSize];
            if(itemStyle[crossSize]!==null&&temStyle[crossSize]!==(void 0)){
                crossSpace = Math.max(crossSpace,itemStyle[crossSize])
            }
            flexLine.push(item)
        }else{
            if(itemStyle[mainSize]>style[mainSize]){
                itemStyle[mainSize] = style[mainSize];
            }
            if(mainSpace<itemStyle[mainSize]){
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLine = [item];
                flexLines.push(flexLine);
                mainSpace = style[mainSize];
                crossSpace = 0;
            }else {
                flexLine.push(item);
            }
            if(itemStyle[crossSize]!==null&&itemStyle[crossSize]){
                crossSpace = Math.max(crossSpace,itemStyle[crossSize])
            }
            mainSpace -=itemStyle[mainSize];
        }
    }
   flexLine.mainSpace = mainSpace;
    
   // ‘no-wrap’处理
   if(style.flexWrap==='no-wrap'||isAutoMainSize){
       flexLine.crossSpace = (style[crossSize]!==nudefined)?style[crossSize]:crossSpace;
   }else{
       flexLine.crossSpace = crossSpace;
   }
   // 进行等比压缩
   if(mainSpace<0){

       var scale = style[mainSize]/(style[mainSize]-mainSpace);
       var currentMain = mainBase;
       for(var i=0;i<items.length;i++){
           var item = items[i];
           var itemStyle = getStyle(item);
           if(itemStyle.flex){
               itemStyle[mainSize]=0;
           }
           itemStyle[mainSize] = itemStyle[mainSize]*scale;
           itemStyle[mainStart] = currentmain;
           itemStyle[mainEnd] = itemStyle[mainStart]+mainSign*itemStyle[mainSize];
           currentMain = itemStyle[mainEnd];
       }
   }else{
       flexLines.forEach(items=>{
           var mainSpace = items.mainSpace;
           var flexTotal = 0;
           for(var i=0;i<items.length;i++){
               var item = items[i];
               var itemStyle = getStyle(item);

               if((itemStyle.flex!==null)&&(itemStyle.flex!==(void 0))){
                   flexTotal +=itemStyle.flex;
                   continue;
               }
           }
           if(flexTotal>0){
               var currentMain = mainbase;
               for(var i=0;i<items.length;i++){
                   var item = items[i];
                   var itemStyle = getStyle(item);

                   if(itemStyle.flex){
                       itemStyle[mainSize] = (mainSpace/flexTotal)*itemStyle.flex;
                   }
                   itemStyle[mainStart] = currentmain;
                   itemStyle[mainEnd] = itemStyle[mainStart]+mainSign*itemStyle[mainSize];
                   currentMain = itemStyle[mainEnd];
               }
           }else{
               if(style.justifyContent ==='flex-start'){
                   var currentMain = mainBase;
                   var step = 0;
               }
               if(style.justifyContent === 'flex-end'){
                   var currentMain = mainSpace/2*mainSign+mainBase;
                   var step = 0;
               }
               if(style.justifyContent === 'center'){
                    var currentMain = mainSpace/2*mainSign+mainBase;
                    var step = 0;
               }
               if(style.justifyContent === 'space-between'){
                    var currentMain = mainSpace;
                    var step = mainSpace/(item.length-1)*mainSign;
                }
                if(style.justifyContent === 'space-around'){
                    var step = mainSpace/item.length * mainSign;
                    var currentMain = step/2+mainBase;
                }
                for(var i=0;i<items.length;i++){
                    var item = items[i];
                    itemStyle[mainStart,currentMain];
                    itemStyle[mainEnd] = itemStyle[mainStart]+mainSign*itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd]+step;
                }


                var crossSpace;

                if(!style[crossSize]){
                    crossSpace = 0;
                    elementStyle[crossSize]=0;
                    for(var i=0;i<flexLines.length;i++){
                        elementStyle[crossSize] = elementStyle[crossSize]+flexLine
                    }
                }else{
                    crossSpace = style[crossSize];
                    for(var i=0;i<flexLines.length;i++){
                        crossSpace -=flexLines[i].crossSpace;
                    }
                }

                if(style.flexWrap === 'wrap-reverse'){
                    crossBase = style[crossSize];
                }else{
                    crossBase = 0;
                }
                var lineSize = style[crossSize]/flexLines.length;
                var step;
                if(style.alignContent === 'flex-end'){
                    crossBase += 0;
                    step = 0;
                }
                if(style.alignContent ==='flex-end'){
                    crossBase +=crossSign*crossSpace;
                    step = 0;
                }
                if(style.alignContent ==='center'){
                     crossBase +=crossSign*crossSpace/2;
                     step = 0;
                }
                if(style.alignContent ==='space-between'){
                    crossBase +=0;
                    step = crossSpace/(flexLines.length-1);
                }
                if(style.alignContent ==='space-around'){
                  step +=crossSpace/(flexLines.length);
                  crossBase = crossSpace*step/2;
                }
                if(style.alignContent === 'stretch'){
                    crossbase +=0;
                    step = 0;
                }

                flexLines.forEach(function(items){
                    var lineCrossSize = style.alignContent==='stretch'?
                      items.crossSpace+crossSpace/flexLines.length:items.crossSpace;
                    for(var i=0;i<items.length;i++){
                        var item = items[i];
                        var itemStyle = getStyle(item);
                        var align = itemStyle.alignSelf || style.alignitems;
                        if(itemStyle[crossSize]===null){
                            itemStyle[crossSize]=(align==='stretch')?lineCrossSize:0;
                        }
                        if(align==='flex-start'){
                            itemStyle[crossStart] = crossBase;
                            itemStyle[crossEnd] = itemStyle[crossStart]+crossSign*itemStyle[crossSize];
                        }
                        if(align==='flex-end'){
                            itemStyle[crossEnd] = crossBase+crossSign*lineCrossSize;
                            itemStyle[crossStart] = itemStyle[crossStart]-crossSign*itemStyle[crossSize];
                        }
                        if(align==='center'){
                            itemStyle[crossStart] = crossBase+crossSign*(lineCrossSize-itemStyle[crossSize])/2;
                            itemStyle[crossEnd] = itemStyle[crossStart]+crossSign*itemStyle[crossSize];
                        }
                        if(align==='stretch'){
                            itemStyle[crossStart] = crossBase;
                            itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)));
                            itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart]);
                        }
                    }

                    crossBase +=crossSign*(lineCrossSize+step);
                })
           }
       })
   }

}

module.exports = layout;