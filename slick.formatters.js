/***
 * Contains basic SlickGrid formatters.
 *
 * NOTE:  These are merely examples.  You will most likely need to implement something more
 *        robust/extensible/localizable/etc. for your use!
 *
 * @module Formatters
 * @namespace Slick
 */

(function ($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Formatters": {//设置显示格式
        "PercentComplete": PercentCompleteFormatter,//百分比
        "PercentCompleteBar": PercentCompleteBarFormatter,//百分比显示条
        "YesNo": YesNoFormatter,//显示是否
        "Checkmark": CheckmarkFormatter,//显示是否完成 就是一个钩钩
        "image":ImageFormatter,//显示图片
        "collection":collectionFormatter,//码表显示
        "format":formatFormatter,//日期&数字
        "valueExpression":valueExpressionFormatter,//表达式
      }
    }
  });

//function XXFormatter(row, cell, value, columnDef, dataContext){
  //  row:行数
  //  cell:列数
  //value:本cell的值
  //columnDef:本列属性
  //dataContext:本行的值
//}

    function valueExpressionFormatter(row, cell, value, columnDef, dataContext){
      var exstr=columnDef.valueExpression,colname=columnDef.field;

        for(var i in dataContext){
            eval("var "+i+" = \'"+ dataContext[i]+"\'");
        }
        eval(exstr);
        return   eval(exstr);

    }

  function formatFormatter(row, cell, value, columnDef, dataContext){
    var ft=columnDef.format;

    if(ft){

      //日期处理
      if(ft.match(/M|m|Y|y|D|d|H|h|S|s|q|Q/g)){
          var  newdate=new Date(Date.parse(value));
          return  newdate.format(ft);
      }else{//数字处理
         return formatNumber(value,ft);
      }
    }
    else {
      return value;
    }

  }

 function collectionFormatter(row, cell, value, columnDef, dataContext){  //码表处理 返回对应值
   return columnDef.collectionData[value] || value;
 }

  function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "-";
    } else if (value < 50) {
      return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
    } else {
      return "<span style='color:green'>" + value + "%</span>";
    }
  }

  function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "";
    }

    var color;

    if (value < 30) {
      color = "red";
    } else if (value < 70) {
      color = "silver";
    } else {
      color = "green";
    }

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
  }
  function YesNoFormatter(row, cell, value, columnDef, dataContext) {

    return value ? "yes" : "no";
  }

  function CheckmarkFormatter(row, cell, value, columnDef, dataContext) {

    return value ? "<img src='../images/tick.png'>" : "";
  }

  function ImageFormatter(row, cell, value, columnDef, dataContext){
    return "<img src='../images/icon/"+columnDef.image+"' style='width: 19px;height: 19px' />" ;
  }
  function DateYMFormatter(row, cell, value, columnDef, dataContext){
    if (value){
      var  newdate=new Date(Date.parse(value));
      return newdate.format("yyyy-MM")

    }
    else {
      return value;
    }

  }

   //日期处理
  Date.prototype.format = function(format)
  {
    var o = {
      "M+" : this.getMonth()+1, //month
      "d+" : this.getDate(),    //day
      "h+" : this.getHours(),   //hour
      "m+" : this.getMinutes(), //minute
      "s+" : this.getSeconds(), //second
      "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
      "S" : this.getMilliseconds() //millisecond
    }
    if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
        (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
      format = format.replace(RegExp.$1,
          RegExp.$1.length==1 ? o[k] :
              ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
  }
    //数字处理
    function formatNumber(num,pattern){
        var strarr = num?num.toString().split('.'):['0'];
        var fmtarr = pattern?pattern.split('.'):[''];
        var retstr='';

       // 整数部分
        var str = strarr[0];
        var fmt = fmtarr[0];
        var i = str.length-1;
        var comma = false;
        for(var f=fmt.length-1;f>=0;f--){
            switch(fmt.substr(f,1)){
                case '#':
                    if(i>=0 ) retstr = str.substr(i--,1) + retstr;
                    break;
                case '0':
                    if(i>=0) retstr = str.substr(i--,1) + retstr;
                    else retstr = '0' + retstr;
                    break;
                case ',':
                    comma = true;
                    retstr=','+retstr;
                    break;
            }
        }
        if(i>=0){
            if(comma){
                var l = str.length;
                for(;i>=0;i--){
                    retstr = str.substr(i,1) + retstr;
                    if(i>0 && ((l-i)%3)==0) retstr = ',' + retstr;
                }
            }
            else retstr = str.substr(0,i+1) + retstr;
        }

        retstr = retstr+'.';
       // 处理小数部分
        str=strarr.length>1?strarr[1]:'';
        fmt=fmtarr.length>1?fmtarr[1]:'';
        i=0;
        for(var f=0;f<fmt.length;f++){
            switch(fmt.substr(f,1)){
                case '#':
                    if(i<str.length) retstr+=str.substr(i++,1);
                    break;
                case '0':
                    if(i<str.length) retstr+= str.substr(i++,1);
                    else retstr+='0';
                    break;
            }
        }
        return retstr.replace(/^,+/,'').replace(/\.$/,'');
    }


})(jQuery$$);
