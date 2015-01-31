/*
@id {7eeff186-cfb4-f7c3-21f2-a15f210dca49}
@name FakeSmile
@version 0.1.32
@description SMIL implementation in ECMAScript
@creator David Leunen (leunen.d@gmail.com)
@homepageURL http://leunen.d.free.fr/fakesmile
@ff_min_version 2.0
@ff_max_version 3.0.*
*/
// ==UserScript==
// @name           smil
// @namespace      svg.smil
// ==/UserScript==
/* http://sizzlejs.com
Copyright 2009, The Dojo Foundation
MIT, BSD and GPL Licenses */
(function(){var p=/((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[]+)+|[>+~])(\s*,\s*)?/g,v=0,z=Object.prototype.toString;var A=function(E,g,m,l){m=m||[];g=g||document;if(g.nodeType!==1&&g.nodeType!==9){return[]}if(!E||typeof E!=="string"){return m}var o=[],b,h,a,i,k,d,F=true;p.lastIndex=0;while((b=p.exec(E))!==null){o.push(b[1]);if(b[2]){d=RegExp.rightContext;break}}if(o.length>1&&u.exec(E)){if(o.length===2&&y.relative[o[0]]){h=x(o[0]+o[1],g)}else{h=y.relative[o[0]]?[g]:A(o.shift(),g);while(o.length){E=o.shift();if(y.relative[E]){E+=o.shift()}h=x(E,h)}}}else{var j=l?{expr:o.pop(),set:B(l)}:A.find(o.pop(),o.length===1&&g.parentNode?g.parentNode:g,q(g));h=A.filter(j.expr,j.set);if(o.length>0){a=B(h)}else{F=false}while(o.length){var c=o.pop(),f=c;if(!y.relative[c]){c=""}else{f=o.pop()}if(f==null){f=g}y.relative[c](a,f,q(g))}}if(!a){a=h}if(!a){throw"Syntax error, unrecognized expression: "+(c||E)}if(z.call(a)==="[object Array]"){if(!F){m.push.apply(m,a)}else{if(g.nodeType===1){for(var n=0;a[n]!=null;n++){if(a[n]&&(a[n]===true||a[n].nodeType===1&&w(g,a[n]))){m.push(h[n])}}}else{for(var n=0;a[n]!=null;n++){if(a[n]&&a[n].nodeType===1){m.push(h[n])}}}}}else{B(a,m)}if(d){A(d,g,m,l)}return m};A.matches=function(b,a){return A(b,null,null,a)};A.find=function(g,d,f){var h,j;if(!g){return[]}for(var a=0,b=y.order.length;a<b;a++){var i=y.order[a],j;if((j=y.match[i].exec(g))){var c=RegExp.leftContext;if(c.substr(c.length-1)!=="\\"){j[1]=(j[1]||"").replace(/\\/g,"");h=y.find[i](j,d,f);if(h!=null){g=g.replace(y.match[i],"");break}}}}if(!h){h=d.getElementsByTagName("*")}return{set:h,expr:g}};A.filter=function(k,l,g,a){var c=k,b=[],n=l,o,h;while(k&&l.length){for(var m in y.filter){if((o=y.match[m].exec(k))!=null){var f=y.filter[m],d,i;h=false;if(n==b){b=[]}if(y.preFilter[m]){o=y.preFilter[m](o,n,g,b,a);if(!o){h=d=true}else{if(o===true){continue}}}if(o){for(var D=0;(i=n[D])!=null;D++){if(i){d=f(i,o,D,n);var j=a^!!d;if(g&&d!=null){if(j){h=true}else{n[D]=false}}else{if(j){b.push(i);h=true}}}}}if(d!==undefined){if(!g){n=b}k=k.replace(y.match[m],"");if(!h){return[]}break}}}k=k.replace(/\s*,\s*/,"");if(k==c){if(h==null){throw"Syntax error, unrecognized expression: "+k}else{break}}c=k}return n};var y=A.selectors={order:["ID","NAME","TAG"],match:{ID:/#((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,CLASS:/\.((?:[\w\u00c0-\uFFFF_-]|\\.)+)/,NAME:/\[name=['"]*((?:[\w\u00c0-\uFFFF_-]|\\.)+)['"]*\]/,ATTR:/\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,TAG:/^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,CHILD:/:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,POS:/:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,PSEUDO:/:((?:[\w\u00c0-\uFFFF_-]|\\.)+)(?:\((['"]*)((?:\([^\)]+\)|[^\2\(\)]*)+)\2\))?/},attrMap:{"class":"className","for":"htmlFor"},attrHandle:{href:function(a){return a.getAttribute("href")}},relative:{"+":function(g,d,h){var j=typeof d==="string",f=j&&!/\W/.test(d),i=j&&!f;if(f&&!h){d=d.toUpperCase()}for(var a=0,b=g.length,c;a<b;a++){if(c=g[a]){while((c=c.previousSibling)&&c.nodeType!==1){}g[a]=i||c&&c.nodeName===d?c:c===d}}if(i){A.filter(d,g,true)}},">":function(b,h,a){if(typeof h==="string"&&!/\W/.test(h)){h=a?h:h.toUpperCase();for(var f=0,g=b.length;f<g;f++){var c=b[f];if(c){var d=c.parentNode;b[f]=d.nodeName===h?d:false}}}else{for(var f=0,g=b.length;f<g;f++){var c=b[f];if(c){b[f]=typeof h==="string"?c.parentNode:c.parentNode===h}}if(typeof h==="string"){A.filter(h,b,true)}}},"":function(c,g,a){var d=v++,f=e;if(!g.match(/\W/)){var b=g=a?g:g.toUpperCase();f=r}f("parentNode",g,d,c,b,a)},"~":function(c,g,a){var d=v++,f=e;if(typeof g==="string"&&!g.match(/\W/)){var b=g=a?g:g.toUpperCase();f=r}f("previousSibling",g,d,c,b,a)}},find:{ID:function(d,b,a){if(typeof b.getElementById!=="undefined"&&!a){var c=b.getElementById(d[1]);return c?[c]:[]}},NAME:function(c,b,a){if(typeof b.getElementsByName!=="undefined"&&!a){return b.getElementsByName(c[1])}},TAG:function(b,a){return a.getElementsByTagName(b[1])}},preFilter:{CLASS:function(d,h,f,g,a){d=" "+d[1].replace(/\\/g,"")+" ";for(var c=0,b;(b=h[c])!=null;c++){if(b){if(a^(b.className&&(" "+b.className+" ").indexOf(d)>=0)){if(!f){g.push(b)}}else{if(f){h[c]=false}}}}return false},ID:function(a){return a[1].replace(/\\/g,"")},TAG:function(c,b){for(var a=0;b[a]===false;a++){}return b[a]&&q(b[a])?c[1]:c[1].toUpperCase()},CHILD:function(b){if(b[1]=="nth"){var a=/(-?)(\d*)n((?:\+|-)?\d*)/.exec(b[2]=="even"&&"2n"||b[2]=="odd"&&"2n+1"||!/\D/.test(b[2])&&"0n+"+b[2]||b[2]);b[2]=(a[1]+(a[2]||1))-0;b[3]=a[3]-0}b[0]=v++;return b},ATTR:function(b){var a=b[1].replace(/\\/g,"");if(y.attrMap[a]){b[1]=y.attrMap[a]}if(b[2]==="~="){b[4]=" "+b[4]+" "}return b},PSEUDO:function(b,g,d,f,a){if(b[1]==="not"){if(b[3].match(p).length>1){b[3]=A(b[3],null,null,g)}else{var c=A.filter(b[3],g,d,true^a);if(!d){f.push.apply(f,c)}return false}}else{if(y.match.POS.test(b[0])){return true}}return b},POS:function(a){a.unshift(true);return a}},filters:{enabled:function(a){return a.disabled===false&&a.type!=="hidden"},disabled:function(a){return a.disabled===true},checked:function(a){return a.checked===true},selected:function(a){a.parentNode.selectedIndex;return a.selected===true},parent:function(a){return !!a.firstChild},empty:function(a){return !a.firstChild},has:function(a,c,b){return !!A(b[3],a).length},header:function(a){return/h\d/i.test(a.nodeName)},text:function(a){return"text"===a.type},radio:function(a){return"radio"===a.type},checkbox:function(a){return"checkbox"===a.type},file:function(a){return"file"===a.type},password:function(a){return"password"===a.type},submit:function(a){return"submit"===a.type},image:function(a){return"image"===a.type},reset:function(a){return"reset"===a.type},button:function(a){return"button"===a.type||a.nodeName.toUpperCase()==="BUTTON"},input:function(a){return/input|select|textarea|button/i.test(a.nodeName)}},setFilters:{first:function(b,a){return a===0},last:function(b,d,c,a){return d===a.length-1},even:function(b,a){return a%2===0},odd:function(b,a){return a%2===1},lt:function(a,c,b){return c<b[3]-0},gt:function(a,c,b){return c>b[3]-0},nth:function(a,c,b){return b[3]-0==c},eq:function(a,c,b){return b[3]-0==c}},filter:{CHILD:function(d,a){var i=a[1],c=d;switch(i){case"only":case"first":while(c=c.previousSibling){if(c.nodeType===1){return false}}if(i=="first"){return true}c=d;case"last":while(c=c.nextSibling){if(c.nodeType===1){return false}}return true;case"nth":var b=a[2],f=a[3];if(b==1&&f==0){return true}var j=a[0],g=d.parentNode;if(g&&(g.sizcache!==j||!d.nodeIndex)){var k=0;for(c=g.firstChild;c;c=c.nextSibling){if(c.nodeType===1){c.nodeIndex=++k}}g.sizcache=j}var h=d.nodeIndex-f;if(b==0){return h==0}else{return(h%b==0&&h/b>=0)}}},PSEUDO:function(b,g,f,a){var i=g[1],d=y.filters[i];if(d){return d(b,f,g,a)}else{if(i==="contains"){return(b.textContent||b.innerText||"").indexOf(g[3])>=0}else{if(i==="not"){var c=g[3];for(var f=0,h=c.length;f<h;f++){if(c[f]===b){return false}}return true}}}},ID:function(b,a){return b.nodeType===1&&b.getAttribute("id")===a},TAG:function(b,a){return(a==="*"&&b.nodeType===1)||b.nodeName===a},CLASS:function(b,a){return a.test(b.className)},ATTR:function(b,d){var f=d[1],h=y.attrHandle[f]?y.attrHandle[f](b):b[f]!=null?b[f]:b.getAttribute(f),a=h+"",c=d[2],g=d[4];return h==null?c==="!=":c==="="?a===g:c==="*="?a.indexOf(g)>=0:c==="~="?(" "+a+" ").indexOf(g)>=0:!g?a&&h!==false:c==="!="?a!=g:c==="^="?a.indexOf(g)===0:c==="$="?a.substr(a.length-g.length)===g:c==="|="?a===g||a.substr(0,g.length+1)===g+"-":false},POS:function(b,g,d,a){var f=g[2],c=y.setFilters[f];if(c){return c(b,d,g,a)}}}};var u=y.match.POS;for(var s in y.match){y.match[s]=RegExp(y.match[s].source+/(?![^\[]*\])(?![^\(]*\))/.source)}var B=function(b,a){b=Array.prototype.slice.call(b);if(a){a.push.apply(a,b);return a}return b};try{Array.prototype.slice.call(document.documentElement.childNodes)}catch(t){B=function(a,b){var f=b||[];if(z.call(a)==="[object Array]"){Array.prototype.push.apply(f,a)}else{if(typeof a.length==="number"){for(var c=0,d=a.length;c<d;c++){f.push(a[c])}}else{for(var c=0;a[c];c++){f.push(a[c])}}}return f}}(function(){var c=document.createElement("form"),a="script"+(new Date).getTime();c.innerHTML="<input name='"+a+"'/>";var b=document.documentElement;b.insertBefore(c,b.firstChild);if(!!document.getElementById(a)){y.find.ID=function(g,f,d){if(typeof f.getElementById!=="undefined"&&!d){var h=f.getElementById(g[1]);return h?h.id===g[1]||typeof h.getAttributeNode!=="undefined"&&h.getAttributeNode("id").nodeValue===g[1]?[h]:undefined:[]}};y.filter.ID=function(d,g){var f=typeof d.getAttributeNode!=="undefined"&&d.getAttributeNode("id");return d.nodeType===1&&f&&f.nodeValue===g}}b.removeChild(c)})();(function(){var a=document.createElement("div");a.appendChild(document.createComment(""));if(a.getElementsByTagName("*").length>0){y.find.TAG=function(g,b){var c=b.getElementsByTagName(g[1]);if(g[1]==="*"){var d=[];for(var f=0;c[f];f++){if(c[f].nodeType===1){d.push(c[f])}}c=d}return c}}a.innerHTML="<a href='#'></a>";if(a.firstChild&&typeof a.firstChild.getAttribute!=="undefined"&&a.firstChild.getAttribute("href")!=="#"){y.attrHandle.href=function(b){return b.getAttribute("href",2)}}})();if(document.querySelectorAll){(function(){var b=A,a=document.createElement("div");a.innerHTML="<p class='TEST'></p>";if(a.querySelectorAll&&a.querySelectorAll(".TEST").length===0){return}A=function(d,f,h,g){f=f||document;if(!g&&f.nodeType===9&&!q(f)){try{return B(f.querySelectorAll(d),h)}catch(c){}}return b(d,f,h,g)};A.find=b.find;A.filter=b.filter;A.selectors=b.selectors;A.matches=b.matches})()}if(document.getElementsByClassName&&document.documentElement.getElementsByClassName){(function(){var a=document.createElement("div");a.innerHTML="<div class='test e'></div><div class='test'></div>";if(a.getElementsByClassName("e").length===0){return}a.lastChild.className="e";if(a.getElementsByClassName("e").length===1){return}y.order.splice(1,0,"CLASS");y.find.CLASS=function(c,b){return b.getElementsByClassName(c[1])}})()}function r(c,j,k,f,i,g){var h=c=="previousSibling"&&!g;for(var a=0,b=f.length;a<b;a++){var d=f[a];if(d){if(h&&d.nodeType===1){d.sizcache=k;d.sizset=a}d=d[c];var l=false;while(d){if(d.sizcache===k){l=f[d.sizset];break}if(d.nodeType===1&&!g){d.sizcache=k;d.sizset=a}if(d.nodeName===j){l=d;break}d=d[c]}f[a]=l}}}function e(c,j,k,f,i,g){var h=c=="previousSibling"&&!g;for(var a=0,b=f.length;a<b;a++){var d=f[a];if(d){if(h&&d.nodeType===1){d.sizcache=k;d.sizset=a}d=d[c];var l=false;while(d){if(d.sizcache===k){l=f[d.sizset];break}if(d.nodeType===1){if(!g){d.sizcache=k;d.sizset=a}if(typeof j!=="string"){if(d===j){l=true;break}}else{if(A.filter(j,[d]).length>0){l=d;break}}}d=d[c]}f[a]=l}}}var w=document.compareDocumentPosition?function(b,a){return b.compareDocumentPosition(a)&16}:function(b,a){return b!==a&&(b.contains?b.contains(a):true)};var q=function(a){return a.nodeType===9&&a.documentElement.nodeName!=="HTML"||!!a.ownerDocument&&q(a.ownerDocument)};var x=function(i,a){var f=[],d="",c,g=a.nodeType?[a]:a;while((c=y.match.PSEUDO.exec(i))){d+=c[0];i=i.replace(y.match.PSEUDO,"")}i=y.relative[i]?i+"*":i;for(var b=0,h=g.length;b<h;b++){A(i,g[b],f)}return A.filter(d,f)};window.Sizzle=A})();
/* Copyright 2008 David Leunen
GPL Licence */
var mpf=25;var splinePrecision=25;var svgns="http://www.w3.org/2000/svg";var smilanimns="http://www.w3.org/2001/smil-animation";var smil2ns="http://www.w3.org/2001/SMIL20";var smil21ns="http://www.w3.org/2005/SMIL21";var smil3ns="http://www.w3.org/ns/SMIL30";var timesheetns="http://www.w3.org/2007/07/SMIL30/Timesheets";var xlinkns="http://www.w3.org/1999/xlink";var animators=new Array();var id2anim=new Object();var animations=new Array();var timeZero;function initSMIL(){if(document.documentElement.getAttribute("smiling")=="fake"){return}document.documentElement.setAttribute("smiling","fake");smile(document);timeZero=new Date();for(var a=0;a<animators.length;a++){animators[a].register()}window.setInterval(animate,mpf)}function getURLCallback(a){if(a.success){smile(parseXML(a.content,document))}}function xhrCallback(){if(this.readyState==4&&this.status==200&&this.responseXML!=null){smile(this.responseXML)}}function smile(q){var f=window.XMLHttpRequest?new XMLHttpRequest():window.ActiveXObject?new ActiveXObject("MSXML2.XMLHTTP.3.0"):null;if(f){f.overrideMimeType("text/xml");f.onreadystatechange=xhrCallback}var o=q.getElementsByTagName("*");for(var g=0;g<o.length;g++){var e=o.item(g);var c=e.namespaceURI;var p=e.localName;if((p.toLowerCase()=="link"&&e.getAttribute("rel")=="timesheet"&&e.getAttribute("type")=="application/smil+xml")||((c==timesheetns||c==smil3ns)&&p=="timesheet")){var a=e.getAttribute(p=="timesheet"?"src":"href");if(a&&a.length>0){if(f){f.open("GET",a,false);f.send(null)}else{if(window.getURL&&window.parseXML){getURL(a,getURLCallback)}}}continue}var n=document.implementation;if((c==svgns&&!n.hasFeature("http://www.w3.org/TR/SVG11/feature#SVG-animation","1.1"))||(c==smilanimns&&!n.hasFeature(smilanimns,"1.1"))||(c==smil2ns&&!n.hasFeature(smil2ns,"2.0"))||(c==smil21ns&&!n.hasFeature(smil21ns,"2.1"))||(c==smil3ns&&!n.hasFeature(smil3ns,"3.0"))||(c==timesheetns&&!n.hasFeature(timesheetns,"1.0"))){if(p=="set"||p=="animate"||p=="animateColor"||p=="animateMotion"||p=="animateTransform"){var k=getTargets(e);var m=new Array();for(var h=0;h<k.length;h++){var l=k[h];var d=new Animator(e,l,h);animators.push(d);m[h]=d}e.animators=m;var b=e.getAttribute("id");if(b){id2anim[b]=e}}}}}function getTargets(b){if(b.hasAttribute("select")){return select(b)}var a=b.getAttributeNS(xlinkns,"href");if(a!=null&&a!=""){return[document.getElementById(a.substring(1))]}else{var c=b.parentNode;if(c.localName=="item"&&(c.namespaceURI==timesheetns||c.namespaceURI==smil3ns)){return select(c)}return[c]}return[]}function select(b){var a=b.getAttribute("select");var c=b.parentNode;while(c&&c.nodeType==1){if(c.localName=="item"&&(c.namespaceURI==timesheetns||c.namespaceURI==smil3ns)){a=c.getAttribute("select")+" "+a}c=c.parentNode}return Sizzle(a)}function getEventTargetsById(c,b){var a=null;if(c=="prev"){a=b.previousSibling;while(a&&a.nodeType!=1){a=a.previousSibling}}if(a==null){a=document.getElementById(c)}if(a==null){a=id2anim[c]}if(a==null){return null}if(a.animators){return a.animators}return[a]}Animator.prototype={register:function(){var b=this.anim.getAttribute("begin");if(!b){b="0"}this.schedule(b,this.begin);var a=this.anim.getAttribute("end");if(a){this.schedule(a,this.finish)}},schedule:function(o,f){var p=this;var k=o.split(";");for(var m=0;m<k.length;m++){var e=k[m].trim();if(e.length>11&&e.substring(0,10)=="wallclock("){var s=new Date();s.setISO8601(e.substring(10,e.length-1));var d=new Date();var q=s-d;f.call(p,q)}else{if(isNaN(parseInt(e))){var h=0;var n=e.indexOf("+");if(n==-1){n=e.indexOf("-")}if(n!=-1){h=toMillis(e.substring(n).replace(/ /g,""));e=e.substring(0,n).trim()}n=e.indexOf(".");var a=new Array();if(n==-1){a=[this.target]}else{var c=e.substring(0,n);if(c.indexOf("index(")==0){c=c.substring(6,c.length-1)+this.index}a=getEventTargetsById(c,this.anim)}var b=e.substring(n+1);var r=funk(f,p,h);for(var g=0;g<a.length;g++){var l=a[g];if(l==null){continue}l.addEventListener(b,r,false)}}else{e=toMillis(e);f.call(p,e)}}}},getCurVal:function(){if(this.attributeType=="CSS"){return this.target.style.getPropertyValue(this.attributeName)}else{return this.target.getAttributeNS(this.namespace,this.attributeName)}},begin:function(offset){if(this.restart=="never"||(this.running&&this.restart=="whenNotActive")){return}if(this.running){this.finish()}if(offset!=null&&offset>=0){var me=this;var myself=this.begin;var call=function(){myself.call(me)};window.setTimeout(call,offset);return}this.startTime=new Date();if(offset&&offset<0){this.startTime.setTime(this.startTime.getTime()+offset);if(this.startTime<timeZero){return}}this.stop();this.running=true;var initVal=this.getCurVal();this.realInitVal=initVal;if(!initVal&&propDefaults[this.attributeName]){initVal=propDefaults[this.attributeName]}if(this.anim.nodeName=="set"){this.step(this.to)}this.iteration=0;if(this.values){this.animVals=this.values.split(";");for(var i=0;i<this.animVals.length;i++){this.animVals[i]=this.animVals[i].trim()}}else{this.animVals=new Array();if(this.from){this.animVals[0]=this.from}else{this.animVals[0]=initVal}if(this.by&&this.animVals[0]){this.animVals[1]=this.add(this.normalize(this.animVals[0]),this.normalize(this.by))}else{this.animVals[1]=this.to}}if(this.animVals[this.animVals.length-1]){this.freezed=this.animVals[this.animVals.length-1];if(this.animVals[0]){if((this.animVals[0].substring(0,1)=="#"||colors[this.animVals[0]]||(this.animVals[0].length>5&&this.animVals[0].trim().substring(0,4)=="rgb("))&&(this.freezed.substring(0,1)=="#"||colors[this.freezed]||(this.freezed.length>5&&this.freezed.trim().substring(0,4)=="rgb("))){this.color()}else{var cp=new Array();var oneVal=this.animVals[0];var qualified=getUnit(oneVal);cp[0]=qualified[0];this.unit=qualified[1];for(var i=1;i<this.animVals.length;i++){var oneVal=this.animVals[i];var qualified=getUnit(oneVal);if(qualified[1]==this.unit){cp[i]=qualified[0]}else{cp=this.animVals;break}}this.animVals=cp}}}this.iterBegin=this.startTime;animations.push(this);for(var i=0;i<this.beginListeners.length;i++){this.beginListeners[i].call()}var onbegin=this.anim.getAttribute("onbegin");if(onbegin){eval(onbegin)}},normalize:function(a){return a},add:function(d,c){return""+(parseFloat(d)+parseFloat(c))},f:function(d){var e=this.anim;var b=this.computedDur;if(isNaN(b)){return true}var f=this.iterBegin;var i=d-f;var g=i/b;if(g>=1){return this.end()}var c=parseFloat(this.iteration);if(this.repeatCount&&this.repeatCount!="indefinite"&&(c+g)>=this.repeatCount){if(this.fill=="freeze"){this.freezed=this.valueAt(this.repeatCount-c)}return this.end()}if(this.repeatDur&&this.repeatDur!="indefinite"&&(d-this.startTime)>=toMillis(this.repeatDur)){if(this.fill=="freeze"){var a=toMillis(this.repeatDur)/b;this.freezed=this.valueAt(a-Math.floor(a))}return this.end()}if(e.localName=="set"){return true}var h=this.valueAt(g);this.step(h);return true},isInterpolable:function(f,e){var b=(!isNaN(f)&&!isNaN(e));if(!b&&f.trim().indexOf(" ")!=-1&&e.trim().indexOf(" ")!=-1){var a=f.trim().split(" ");var d=e.trim().split(" ");b=true;if(a.length==d.length){for(var c=0;c<d.length;c++){if(!this.isInterpolable(a[c],d[c])){return false}}}}return b},valueAt:function(d){var g=this.animVals;if(d==1){return g[g.length-1]}if(this.calcMode=="discrete"||!this.isInterpolable(g[0],g[1])){if(this.keyTimes){for(var b=1;b<this.keyTimes.length;b++){if(this.keyTimes[b]>d){return g[b-1]}}return g[g.length-1]}var e=g.length;var f=Math.floor(d*e);return g[f]}else{var a;if(this.keyTimes){for(var b=1;b<this.keyTimes.length;b++){if(this.keyTimes[b]>d){a=b-1;var c=this.keyTimes[a];d=(d-c)/(this.keyTimes[b]-c);break}}}else{var e=g.length-1;a=Math.floor(d*e);d=(d%(1/e))*e}if(this.calcMode=="spline"){d=this.spline(d,a)}return this.interpolate(this.normalize(g[a]),this.normalize(g[a+1]),d)}},spline:function(e,a){var g=this.keySplines[a];var c=g.getTotalLength();var d=c/splinePrecision;for(var b=0;b<=c;b+=d){var f=g.getPointAtLength(b);if(f.x>e){var h=g.getPointAtLength(b-d);e-=h.x;e/=f.x-h.x;return h.y+((f.y-h.y)*e)}}var f=g.getPointAtLength(c);var h=g.getPointAtLength(c-d);e-=h.x;e/=f.x-h.x;return h.y+((f.y-h.y)*e)},interpolate:function(g,f,d){if(!this.isInterpolable(g,f)){if(d<0.5){return g}else{return f}}if(g.trim().indexOf(" ")!=-1){var a=g.split(" ");var e=f.split(" ");var b=new Array();for(var c=0;c<e.length;c++){b[c]=parseFloat(a[c])+((e[c]-a[c])*d)}return b.join(" ")}return parseFloat(g)+((f-g)*d)},step:function(c){if(this.unit){c+=this.unit}var a=this.attributeName;var b=this.attributeType;if(b=="CSS"){if(a=="font-size"&&!isNaN(c)){c+="px"}this.target.style.setProperty(a,c,"")}else{this.target.setAttributeNS(this.namespace,a,c)}},end:function(){if(!this.repeatCount&&!this.repeatDur){return this.finish()}else{this.iteration++;var now=new Date();if(this.repeatCount&&this.repeatCount!="indefinite"&&this.iteration>=this.repeatCount){return this.finish()}else{if(this.repeatDur&&this.repeatDur!="indefinite"&&(now-this.startTime)>=toMillis(this.repeatDur)){return this.finish()}else{if(this.accumulate=="sum"){var curVal=this.getCurVal();if(!curVal&&propDefaults[this.attributeName]){curVal=propDefaults[this.attributeName]}if(this.by&&!this.from){this.animVals[0]=curVal;this.animVals[1]=this.add(this.normalize(curVal),this.normalize(this.by))}else{for(var i=0;i<this.animVals.length;i++){this.animVals[i]=this.add(this.normalize(curVal),this.normalize(this.animVals[i]))}}this.freezed=this.animVals[this.animVals.length-1]}this.iterBegin=now;for(var i=0;i<this.repeatIterations.length;i++){if(this.repeatIterations[i]==this.iteration){this.repeatListeners[i].call()}}var onrepeat=this.anim.getAttribute("onrepeat");if(onrepeat){eval(onrepeat)}}}}return true},finish:function(offset){if(this.min&&this.min!="indefinite"){var now=new Date();if((now-this.startTime)>=toMillis(this.min)){return true}}if(offset&&offset>0){var me=this;var myself=this.finish;var call=function(){myself.call(me)};window.setTimeout(call,offset);return true}if(offset&&offset<0){var now=new Date();now.setTime(now.getTime()+offset);if(now<this.startTime){return true}}var fill=this.fill;var kept=true;if(fill=="freeze"){this.freeze()}else{this.stop();this.step(this.realInitVal);kept=false}if(this.running){for(var i=0;i<this.endListeners.length;i++){this.endListeners[i].call()}var onend=this.anim.getAttribute("onend");if(onend){eval(onend)}this.running=false}return kept},stop:function(){for(var a=0;a<animations.length;a++){if(animations[a]==this){animations.splice(a,1);break}}},freeze:function(){this.step(this.freezed)},addEventListener:function(e,d,a){if(e=="begin"){this.beginListeners.push(d)}else{if(e=="end"){this.endListeners.push(d)}else{if(e.length>7&&e.substring(0,6)=="repeat"){var c=e.substring(7,e.length-1);this.repeatListeners.push(d);this.repeatIterations.push(c)}}}},getPath:function(){var b=this.anim.getElementsByTagNameNS(svgns,"mpath")[0];if(b){var c=b.getAttributeNS(xlinkns,"href");return document.getElementById(c.substring(1))}else{var e=this.anim.getAttribute("path");if(e){var a=createPath(e);return a}}return null},translation:function(){if(this.by&&this.by.indexOf(",")==-1){this.by=this.by+",0"}this.normalize=function(b){var a=b.replace(/,/g," ").replace(/ +/," ").split(/ /);if(a.length==1){a[1]="0"}a[0]=parseFloat(a[0]);a[1]=parseFloat(a[1]);return a};this.add=function(e,d){var c=e[0]+d[0];var f=e[1]+d[1];return c+","+f};this.isInterpolable=function(b,a){return true};this.interpolate=function(e,d,b){var a=e[0]+((d[0]-e[0])*b);var c=e[1]+((d[1]-e[1])*b);return a+","+c}},color:function(){this.isInterpolable=function(b,a){return true};this.interpolate=function(i,h,e){var d=Math.round(i[0]+((h[0]-i[0])*e));var c=Math.round(i[1]+((h[1]-i[1])*e));var a=Math.round(i[2]+((h[2]-i[2])*e));var f="rgb("+d+","+c+","+a+")";return f};this.normalize=function(b){var a=toRGB(b);if(a==null){return toRGB(propDefaults[this.attributeName])}return a};this.add=function(d,c){var e=new Array();for(var f=0;f<d.length;f++){e.push(Math.min(d[f],255)+Math.min(c[f],255))}return e.join(",")}},d:function(){this.isInterpolable=function(b,a){return true};this.interpolate=function(l,m,f){var p="";var n=l.myNormalizedPathSegList;var c=m.myNormalizedPathSegList;var e;var o;for(var d=0;d<n.numberOfItems&&d<c.numberOfItems;d++){e=n.getItem(d);o=c.getItem(d);typeFrom=e.pathSegType;typeTo=o.pathSegType;if(typeFrom==1||typeTo==1){p+=" z "}else{var k=e.x+((o.x-e.x)*f);var h=e.y+((o.y-e.y)*f);if(typeFrom==2||typeTo==2){p+=" M "}else{if(typeFrom==4||typeTo==4){p+=" L "}else{var b=e.x1+((o.x1-e.x1)*f);var j=e.y1+((o.y1-e.y1)*f);var a=e.x2+((o.x2-e.x2)*f);var g=e.y2+((o.y2-e.y2)*f);p+=" C "+b+","+j+" "+a+","+g+" "}}p+=k+","+h}}return p};this.normalize=function(a){var b=createPath(a);return b}}};function Animator(b,f,e){this.anim=b;this.target=f;this.index=e;b.targetElement=f;this.attributeType=b.getAttribute("attributeType");this.attributeName=b.getAttribute("attributeName");if(this.attributeType!="CSS"&&this.attributeType!="XML"){if(propDefaults[this.attributeName]&&this.target.style){this.attributeType="CSS"}else{this.attributeType="XML"}}if(this.attributeType=="XML"&&this.attributeName){this.namespace=null;var l=this.attributeName.indexOf(":");if(l!=-1){var d=this.attributeName.substring(0,l);this.attributeName=this.attributeName.substring(l+1);var a=f;while(a&&a.nodeType==1){var j=a.getAttributeNS("http://www.w3.org/2000/xmlns/",d);if(j){this.namespace=j;break}a=a.parentNode}}}if(this.attributeName=="d"){this.d()}else{if(this.attributeName=="points"){this.isInterpolable=function(m,i){return true};this.interpolate=function(s,t,o){var p=new Array();var n,u,r,q;for(var m=0;m<s.length&&m<t.length;m++){n=s[m].split(",");u=t[m].split(",");r=parseFloat(n[0])+((parseFloat(u[0])-n[0])*o);q=parseFloat(n[1])+((parseFloat(u[1])-n[1])*o);p.push(r+","+q)}return p.join(" ")};this.normalize=function(o){var m=o.split(" ");for(var n=m.length-1;n>=0;n--){if(m[n]==""){m.splice(n,1)}}return m}}}this.from=b.getAttribute("from");this.to=b.getAttribute("to");this.by=b.getAttribute("by");this.values=b.getAttribute("values");if(this.values){this.values=this.values.trim();if(this.values.substring(this.values.length-1)==";"){this.values=this.values.substring(0,this.values.length-1)}}this.calcMode=b.getAttribute("calcMode");this.keyTimes=b.getAttribute("keyTimes");if(this.keyTimes){this.keyTimes=this.keyTimes.split(";");for(var c=0;c<this.keyTimes.length;c++){this.keyTimes[c]=parseFloat(this.keyTimes[c])}this.keyPoints=b.getAttribute("keyPoints");if(this.keyPoints){this.keyPoints=this.keyPoints.split(";");for(var c=0;c<this.keyPoints.length;c++){this.keyPoints[c]=parseFloat(this.keyPoints[c])}}}this.keySplines=b.getAttribute("keySplines");if(this.keySplines){this.keySplines=this.keySplines.split(";");for(var c=0;c<this.keySplines.length;c++){this.keySplines[c]=createPath("M 0 0 C "+this.keySplines[c]+" 1 1")}}this.dur=b.getAttribute("dur");if(this.dur&&this.dur!="indefinite"){this.computedDur=toMillis(this.dur)}this.max=b.getAttribute("max");if(this.max&&this.max!="indefinite"){this.computedMax=toMillis(this.max);if(!isNaN(this.computedMax)&&this.computedMax>0&&(!this.computedDur||this.computedDur>this.computedMax)){this.computedDur=this.computedMax}}this.min=b.getAttribute("min");if(this.min){this.computedMin=toMillis(this.min);if(!this.computedDur||this.computedDur<this.computedMin){this.computedDur=this.computedMin}}this.fill=b.getAttribute("fill");this.type=b.getAttribute("type");this.repeatCount=b.getAttribute("repeatCount");this.repeatDur=b.getAttribute("repeatDur");this.accumulate=b.getAttribute("accumulate");this.additive=b.getAttribute("additive");this.restart=b.getAttribute("restart");if(!this.restart){this.restart="always"}this.beginListeners=new Array();this.endListeners=new Array();this.repeatListeners=new Array();this.repeatIterations=new Array();var k=b.localName;if(k=="animateColor"){this.color()}else{if(k=="animateMotion"){this.isInterpolable=function(m,i){return true};this.getCurVal=function(){var m=this.target.transform;if(m&&m.animVal.numberOfItems>0){var i=m.animVal;return decompose(i.getItem(0).matrix,"translate")}else{return"0,0"}};this.path=this.getPath();if(this.path){this.valueAt=function(n){var m=this.path.getTotalLength();var i=this.path.getPointAtLength(n*m);return i.x+","+i.y}}else{this.translation()}this.freeze=function(){var i=this.valueAt(1);this.step(i)};if(this.keyPoints&&this.keyTimes){this.pathKeyTimes=this.keyTimes;this.keyTimes=null;this.superValueAt=this.valueAt;this.valueAt=function(p){for(var n=1;n<this.keyPoints.length;n++){var m=this.keyPoints[this.keyPoints.length-1];if(this.pathKeyTimes[n]>p){var q=this.keyPoints[n-1];if(this.calcMode=="discrete"){m=q}else{var o=this.pathKeyTimes[n-1];p=(p-o)/(this.pathKeyTimes[n]-o);m=q+((this.keyPoints[n]-q)*p)}break}}return this.superValueAt(m)}}this.step=function(m){var i=this.attributeName;m="translate("+m+")";this.target.setAttribute("transform",m)}}else{if(k=="animateTransform"){this.isInterpolable=function(m,i){return true};this.getCurVal=function(){var n=this.type;var m=this.target.transform;if(m&&m.animVal.numberOfItems>0){var i=m.animVal;return decompose(i.getItem(0).matrix,n)}else{if(n=="scale"){return"1,1"}else{if(n=="translate"){return"0,0"}else{if(n=="rotate"){return"0,0,0"}else{return 0}}}}};if(this.type=="scale"){this.normalize=function(m){m=m.replace(/,/g," ");var i=m.split(" ");if(i.length==1){i[1]=i[0]}i[0]=parseFloat(i[0]);i[1]=parseFloat(i[1]);return i};this.add=function(n,m){var o=new Array();for(var p=0;p<n.length;p++){o.push(n[p]*m[p])}return o.join(",")}}else{if(this.type=="translate"){this.translation()}else{if(this.type=="rotate"){this.normalize=function(m){m=m.replace(/,/g," ");var i=m.split(" ");if(i.length<3){i[0]=parseFloat(i[0]);i[1]=0;i[2]=0}else{i[0]=parseFloat(i[0]);i[1]=parseFloat(i[1]);i[2]=parseFloat(i[2])}return i};this.add=function(n,m){var o=new Array();for(var p=0;p<n.length;p++){o.push(n[p]+m[p])}return o.join(",")}}}}if(this.type=="scale"||this.type=="rotate"){if(this.from){this.from=this.normalize(this.from).join(",")}if(this.to){this.to=this.normalize(this.to).join(",")}if(this.by){this.by=this.normalize(this.by).join(",")}if(this.values){var g=this.values.split(";");for(var c=0;c<g.length;c++){g[c]=this.normalize(g[c]).join(",")}this.values=g.join(";")}this.interpolate=function(q,p,o){var m=new Array();for(var n=0;n<q.length;n++){m.push(q[n]+((p[n]-q[n])*o))}return m.join(",")}}this.step=function(m){var i=this.attributeName;m=this.type+"("+m+")";this.target.setAttribute(i,m)}}}}var h=this;this.anim.beginElement=function(){h.begin();return true};this.anim.beginElementAt=function(i){h.begin(i*1000);return true};this.anim.endElement=function(){h.finish();return true};this.anim.endElementAt=function(i){h.finish(i*1000);return true};this.anim.getStartTime=function(){return parseFloat(h.iterBegin-timeZero)/1000};this.anim.getCurrentTime=function(){var i=new Date();return parseFloat(i-h.iterBegin)/1000}}function animate(){var c=new Date();for(var b=0;b<animations.length;b++){try{if(!animations[b].f(c)){b--}}catch(a){if(a.message!="Component returned failure code: 0x80004005 (NS_ERROR_FAILURE) [nsIDOMSVGPathElement.getTotalLength]"){console.log(a)}}}}function toMillis(c){c=c.trim();var a=c.length;var d=c.indexOf(":");if(d!=-1){var b=c.split(":");var a=b.length;c=0;if(b.length==3){c+=parseInt(b[0])*3600000}c+=parseInt(b[a-2])*60000;c+=parseFloat(b[a-1])*1000}else{if(a>2&&c.substring(a-2)=="ms"){c=c.substring(0,c.length-2)}else{if(a>1&&c.substring(a-1)=="s"){c=c.substring(0,c.length-1);c=c*1000}else{if(a>3&&c.substring(a-3)=="min"){c=c.substring(0,c.length-3);c=c*60000}else{if(a>1&&c.substring(a-1)=="h"){c=c.substring(0,c.length-1);c=c*3600000}else{c=c*1000}}}}}return parseFloat(c)}function decompose(n,l){if(l=="translate"){return n.e+","+n.f}var o=n.a;var m=n.b;var k=n.c;var j=n.d;if(l=="rotate"){return Math.atan2(k,o)+",0,0"}var h=Math.sqrt(o*o+k*k);var g=Math.sqrt(m*m+j*j);if(l=="scale"){var i=o*j-m*k;var q=i==0?0:(i/h);var p=g;return q+","+p}var f=o*m+k*j;var e=Math.PI/2-Math.acos(f==0?0:(f/(g*h)));return(e*180)/Math.PI}function toRGB(b){if(b.substring(0,3)=="rgb"){b=b.replace(/ /g,"");b=b.replace("rgb(","");b=b.replace(")","");var c=b.split(",");for(var d=0;d<c.length;d++){var a=c[d].length-1;if(c[d].substring(a)=="%"){c[d]=Math.round((c[d].substring(0,a))*2.55)}else{c[d]=parseInt(c[d])}}return c}else{if(b.charAt(0)=="#"){b=b.trim();var c=new Array();if(b.length==7){c[0]=parseInt(b.substring(1,3),16);c[1]=parseInt(b.substring(3,5),16);c[2]=parseInt(b.substring(5,7),16)}else{c[0]=b.substring(1,2);c[1]=b.substring(2,3);c[2]=b.substring(3,4);c[0]=parseInt(c[0]+c[0],16);c[1]=parseInt(c[1]+c[1],16);c[2]=parseInt(c[2]+c[2],16)}return c}else{return colors[b]}}}function createPath(c){var b=document.createElementNS(svgns,"path");b.setAttribute("d",c);try{if(b.normalizedPathSegList){b.myNormalizedPathSegList=b.normalizedPathSegList}}catch(a){}if(!b.myNormalizedPathSegList){b.myNormalizedPathSegList=b.pathSegList}return b}var units=["grad","deg","rad","kHz","Hz","em","em","px","pt","pc","mm","cm","in","ms","s","%"];function getUnit(d){if(d&&d.substring){for(var a=0;a<units.length;a++){var c=d.length-units[a].length;if(c>0&&d.substring(c)==units[a]){var b=d.substring(0,c);if(!isNaN(b)){return[b,units[a]]}}}}return[d,null]}var colors={aliceblue:[240,248,255],antiquewhite:[250,235,215],aqua:[0,255,255],aquamarine:[127,255,212],azure:[240,255,255],beige:[245,245,220],bisque:[255,228,196],black:[0,0,0],blanchedalmond:[255,235,205],blue:[0,0,255],blueviolet:[138,43,226],brown:[165,42,42],burlywood:[222,184,135],cadetblue:[95,158,160],chartreuse:[127,255,0],chocolate:[210,105,30],coral:[255,127,80],cornflowerblue:[100,149,237],cornsilk:[255,248,220],crimson:[220,20,60],cyan:[0,255,255],darkblue:[0,0,139],darkcyan:[0,139,139],darkgoldenrod:[184,134,11],darkgray:[169,169,169],darkgreen:[0,100,0],darkgrey:[169,169,169],darkkhaki:[189,183,107],darkmagenta:[139,0,139],darkolivegreen:[85,107,47],darkorange:[255,140,0],darkorchid:[153,50,204],darkred:[139,0,0],darksalmon:[233,150,122],darkseagreen:[143,188,143],darkslateblue:[72,61,139],darkslategray:[47,79,79],darkslategrey:[47,79,79],darkturquoise:[0,206,209],darkviolet:[148,0,211],deeppink:[255,20,147],deepskyblue:[0,191,255],dimgray:[105,105,105],dimgrey:[105,105,105],dodgerblue:[30,144,255],firebrick:[178,34,34],floralwhite:[255,250,240],forestgreen:[34,139,34],fuchsia:[255,0,255],gainsboro:[220,220,220],ghostwhite:[248,248,255],gold:[255,215,0],goldenrod:[218,165,32],gray:[128,128,128],grey:[128,128,128],green:[0,128,0],greenyellow:[173,255,47],honeydew:[240,255,240],hotpink:[255,105,180],indianred:[205,92,92],indigo:[75,0,130],ivory:[255,255,240],khaki:[240,230,140],lavender:[230,230,250],lavenderblush:[255,240,245],lawngreen:[124,252,0],lemonchiffon:[255,250,205],lightblue:[173,216,230],lightcoral:[240,128,128],lightcyan:[224,255,255],lightgoldenrodyellow:[250,250,210],lightgray:[211,211,211],lightgreen:[144,238,144],lightgrey:[211,211,211],lightpink:[255,182,193],lightsalmon:[255,160,122],lightseagreen:[32,178,170],lightskyblue:[135,206,250],lightslategray:[119,136,153],lightslategrey:[119,136,153],lightsteelblue:[176,196,222],lightyellow:[255,255,224],lime:[0,255,0],limegreen:[50,205,50],linen:[250,240,230],magenta:[255,0,255],maroon:[128,0,0],mediumaquamarine:[102,205,170],mediumblue:[0,0,205],mediumorchid:[186,85,211],mediumpurple:[147,112,219],mediumseagreen:[60,179,113],mediumslateblue:[123,104,238],mediumspringgreen:[0,250,154],mediumturquoise:[72,209,204],mediumvioletred:[199,21,133],midnightblue:[25,25,112],mintcream:[245,255,250],mistyrose:[255,228,225],moccasin:[255,228,181],navajowhite:[255,222,173],navy:[0,0,128],oldlace:[253,245,230],olive:[128,128,0],olivedrab:[107,142,35],orange:[255,165,0],orangered:[255,69,0],orchid:[218,112,214],palegoldenrod:[238,232,170],palegreen:[152,251,152],paleturquoise:[175,238,238],palevioletred:[219,112,147],papayawhip:[255,239,213],peachpuff:[255,218,185],peru:[205,133,63],pink:[255,192,203],plum:[221,160,221],powderblue:[176,224,230],purple:[128,0,128],red:[255,0,0],rosybrown:[188,143,143],royalblue:[65,105,225],saddlebrown:[139,69,19],salmon:[250,128,114],sandybrown:[244,164,96],seagreen:[46,139,87],seashell:[255,245,238],sienna:[160,82,45],silver:[192,192,192],skyblue:[135,206,235],slateblue:[106,90,205],slategray:[112,128,144],slategrey:[112,128,144],snow:[255,250,250],springgreen:[0,255,127],steelblue:[70,130,180],tan:[210,180,140],teal:[0,128,128],thistle:[216,191,216],tomato:[255,99,71],turquoise:[64,224,208],violet:[238,130,238],wheat:[245,222,179],white:[255,255,255],whitesmoke:[245,245,245],yellow:[255,255,0],yellowgreen:[154,205,50]};var propDefaults=[];propDefaults.font="see individual properties";propDefaults["font-family"]="Arial";propDefaults["font-size"]="medium";propDefaults["font-size-adjust"]="none";propDefaults["font-stretch"]="normal";propDefaults["font-style"]="normal";propDefaults["font-variant"]="normal";propDefaults["font-weight"]="normal";propDefaults.direction="ltr";propDefaults["letter-spacing"]="normal";propDefaults["text-decoration"]="none";propDefaults["unicode-bidi"]="normal";propDefaults["word-spacing"]="normal";propDefaults.clip="auto";propDefaults.color="depends on user agent";propDefaults.cursor="auto";propDefaults.display="inline";propDefaults.overflow="hidden";propDefaults.visibility="visible";propDefaults["clip-path"]="none";propDefaults["clip-rule"]="nonzero";propDefaults.mask="none";propDefaults.opacity="1";propDefaults["enable-background"]="accumulate";propDefaults.filter="none";propDefaults["flood-color"]="black";propDefaults["flood-opacity"]="1";propDefaults["lighting-color"]="white";propDefaults["stop-color"]="black";propDefaults["stop-opacity"]="1";propDefaults["pointer-events"]="visiblePainted";propDefaults["color-interpolation"]="sRGB";propDefaults["color-interpolation-filters"]="linearRGB";propDefaults["color-profile"]="auto";propDefaults["color-rendering"]="auto";propDefaults.fill="black";propDefaults["fill-opacity"]="1";propDefaults["fill-rule"]="nonzero";propDefaults["image-rendering"]="auto";propDefaults["marker-end"]="none";propDefaults["marker-mid"]="none";propDefaults["marker-start"]="none";propDefaults["shape-rendering"]="auto";propDefaults.stroke="none";propDefaults["stroke-dasharray"]="none";propDefaults["stroke-dashoffset"]="0";propDefaults["stroke-linecap"]="butt";propDefaults["stroke-linejoin"]="miter";propDefaults["stroke-miterlimit"]="4";propDefaults["stroke-opacity"]="1";propDefaults["stroke-width"]="1";propDefaults["text-rendering"]="auto";propDefaults["alignment-baseline"]="0";propDefaults["baseline-shift"]="baseline";propDefaults["dominant-baseline"]="auto";propDefaults["glyph-orientation-horizontal"]="0";propDefaults["glyph-orientation-vertical"]="auto";propDefaults.kerning="auto";propDefaults["text-anchor"]="start";propDefaults["writing-mode"]="lr-tb";function funk(b,c,a){return function(){b.call(c,a)}}String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")};Date.prototype.setISO8601=function(b){var c="([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";var f=b.match(new RegExp(c));var e=0;var a=new Date(f[1],0,1);if(f[3]){a.setMonth(f[3]-1)}if(f[5]){a.setDate(f[5])}if(f[7]){a.setHours(f[7])}if(f[8]){a.setMinutes(f[8])}if(f[10]){a.setSeconds(f[10])}if(f[12]){a.setMilliseconds(Number("0."+f[12])*1000)}if(f[14]){e=(Number(f[16])*60)+Number(f[17]);e*=((f[15]=="-")?1:-1)}e-=a.getTimezoneOffset();time=(Number(a)+(e*60*1000));this.setTime(Number(time))};try{window.addEventListener("load",initSMIL,false)}catch(exc){};