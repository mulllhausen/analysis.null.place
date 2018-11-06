if(!String.prototype.repeat){String.prototype.repeat=function(c){if(this==null){throw new TypeError("can't convert "+this+" to object")}var d=""+this;c=+c;if(c!=c){c=0}if(c<0){throw new RangeError("repeat count must be non-negative")}if(c==Infinity){throw new RangeError("repeat count must be less than infinity")}c=Math.floor(c);if(d.length==0||c==0){return""}if(d.length*c>=1<<28){throw new RangeError("repeat count must not overflow maximum string size")}var a="";for(var b=0;b<c;b++){a+=d}return a}}if("ab".substr(-1)!="b"){String.prototype.substr=function(a){return function(c,b){if(c<0){c=this.length+c;if(c<0){c=0}}return a.call(this,c,b)}}(String.prototype.substr)}if(!String.prototype.trim){String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}}if(!Element.prototype.matches){Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector}if(!Element.prototype.closest){Element.prototype.closest=function(d){var b=this;if(Element.prototype.matches){if(!document.documentElement.contains(b)){return null}while(true){if(b.matches(d)){return b}b=b.parentNode;if(b==null){return null}if(b.nodeType!==1){return null}}}else{if(window.Element){var c=(this.document||this.ownerDocument).querySelectorAll(d);while(true){for(var a=0;a<c.length;a++){if(c.item(a)===b){return b}}b=b.parentNode;if(b==null){return null}if(b.nodeType!==1){return null}}}}return null}}function fixConsole(d){var c=["assert","clear","count","debug","dir","dirxml","error","table","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","time","timeEnd","timeStamp","trace","warn"];var b=(window.console=window.console||{});var a=(d.chrome||d.safari);for(var e=0;e<c.length;e++){var f=c[e];if(!b[f]){if(f=="group"&&b.log){b.group=b.log}else{b[f]=function(){return"not implemented"}}}}}if(!Math.trunc){Math.trunc=function(a){a=+a;if(!isFinite(a)){return a}return(a-(a%1))||((a<0)?-0:(a===0?a:0))}}window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(a){window.setTimeout(a,1000/60)}}();window.cancelAnimationFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.msCancelAnimationFrame||window.oCancelAnimationFrame||function(a){window.clearTimeout(a)}}();function getDeviceType(){return window.getComputedStyle(document.getElementsByTagName("body")[0],":before").getPropertyValue("content").replace(/"/g,"")}function trim(a){return a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}function trimLeft(a){return a.replace(/^[\s\uFEFF\xA0]+/g,"")}function trimRight(a){return a.replace(/[\s\uFEFF\xA0]+$/g,"")}function unixtime(a){switch(typeof a){case"string":return Math.round(Date.parse(a)/1000);case"object":return Math.round(a.getTime()/1000);default:return Math.round((new Date()).getTime()/1000)}}NodeList.prototype.isNodeList=HTMLCollection.prototype.isNodeList=function(){return true};function isNodeList(b){try{return(b.isNodeList()===true)}catch(a){return false}}function foreach(c,d){if(isNodeList(c)||(c instanceof Array)){for(var b=0;b<c.length;b++){if(d(b,c[b])===false){break}}}else{if(typeof c==="object"){for(var a in c){if(!c.hasOwnProperty(a)){continue}if(d(a,c[a])===false){break}}}}}function addEvent(b,a,e){if(b==null||typeof(b)=="undefined"){return}var d=(isNodeList(b)?b:[b]);var c=a.split(",");foreach(d,function(f,g){foreach(c,function(h,i){i=i.replace(/ /g,"");if(g.addEventListener){g.addEventListener(i,e,false)}else{if(g.attachEvent){g.attachEvent("on"+i,e)}else{g["on"+i]=e}}})})}function triggerEvent(a,b){if(a==null||typeof(a)=="undefined"){return}var c=(isNodeList(a)?a:[a]);foreach(c,function(e,f){if("createEvent" in document){var d=document.createEvent("HTMLEvents");d.initEvent(b,false,true);f.dispatchEvent(d)}else{f.fireEvent("on"+b)}})}function popup(b,a){document.getElementById("fullpagePopupHeading").innerHTML=b;document.getElementById("fullpagePopupDetail").innerHTML=a;document.getElementById("fullpagePopupNotification").style.display="table";setTimeout(hidePopup,3000)}function hidePopup(){document.getElementById("fullpagePopupNotification").style.display="none"}function addLi2Ul(c,b,e,d){if(typeof c=="string"){c=document.querySelector(c)}var a=document.createElement("li");if(b!=null){a.id=b}if(d!=null){a.className=d}a.appendChild(document.createTextNode(e));c.appendChild(a)}function deleteElementById(a){deleteElement(document.getElementById(a))}function deleteElement(a){if(a==null){return}a.parentNode.removeChild(a)}function deleteElements(a){var b=(isNodeList(a)?a:[a]);if(b.length==0){return}foreach(b,function(c,d){deleteElement(d)})}function isHex(b){var a=/^-?[0-9a-f]+$/gi;return a.test(b)}function stringIsInt(a){return(a==parseInt(a,10))}function stringIsFloat(a){return(a==parseFloat(a))}function setButtons(a){foreach(arguments,function(c,b){if(c==0){return}document.getElementById("btn"+b).disabled=!a})}function inArray(b,a){return(a.indexOf(b)>-1)}function mergeObjects(){var a={};foreach(arguments,function(b,c){foreach(c,function(e,d){a[e]=d})});return a}function addThousandCommas(d){d+="";var e=d.split(".");var c=e[0];var a=((e.length>1)?"."+e[1]:"");var b=/(\d+)(\d{3})/;while(b.test(c)){c=c.replace(b,"$1,$2")}return c+a}function ajax(a,c){var b=new XMLHttpRequest();addEvent(b,"readystatechange",function(){if(this.readyState!=XMLHttpRequest.DONE){return}if(this.status!=200){return}c(this.responseText)});b.open("GET",a);b.send()}Element.prototype.up=function(a){var c=this;for(var b=0;b<a;b++){c=c.parentNode}return c};var uniqueTextAligner="|%|";function alignText(e){e.style.whiteSpace="pre";var a=e.innerHTML.split("\n");if(a.length==1){return}foreach(e.querySelectorAll(".aligner"),function(g,h){h.innerHTML=uniqueTextAligner});a=e.innerHTML.split("\n");var d=0;var f=[];var b={};foreach(a,function(j,g){if(!inArray(uniqueTextAligner,g)){f.push(j);return}if(inArray("<",g)&&inArray(">",g)){var i=document.createElement("div");i.innerHTML=g;g=i.textContent}b[j]=g;var h=g.indexOf(uniqueTextAligner);if(h>d){d=h}});var c=0;foreach(a,function(i,h){if(inArray(i,f)){return}var g=b[i].split(uniqueTextAligner);e.querySelectorAll(".aligner")[c].innerHTML=" ".repeat(d-g[0].length);c++})}function unalignText(a){a.style.whiteSpace="pre-wrap";foreach(a.querySelectorAll(".aligner"),function(b,c){c.innerHTML=""})}function plural(b,a){switch(b){case"s":if(a){return"s"}else{return""}}}function scrollToElement(a){a.scrollIntoView()}function trimInputValue(f){var c=true;var d=f.value;var a=d.length;if(a==0){return d}var e=trim(d);if(d==e){return d}var g={start:f.selectionStart,end:f.selectionEnd};var b=trimLeft(d);if(b.length!=a){g.start-=(a-b.length);g.end-=(a-b.length)}f.value=e;f.setSelectionRange(g.start,g.end);return e}function toggleCodeblockWrap(c){var a=c.currentTarget;var b=a.parentNode.parentNode.querySelector(".codeblock");if(a.getAttribute("wrapped")=="true"){a.querySelector(".icon-level-left").style.display="inline-block";a.querySelector(".icon-arrows-h").style.display="none";alignText(b);a.setAttribute("wrapped","false")}else{a.querySelector(".icon-level-left").style.display="none";a.querySelector(".icon-arrows-h").style.display="inline-block";unalignText(b);a.setAttribute("wrapped","true")}}function toggleAllCodeblockWrapsMobile(){triggerEvent(document.querySelectorAll(".auto-wrap-on-mobile button.wrap-nowrap"),"click")}function englishList(d,a,c){var b="";foreach(d,function(e,f){b+=f;switch(e){case (d.length-2):b+=c;break;case (d.length-1):break;default:b+=a;break}});return b}function browserDetect(){var c=((!!window.opr&&!!opr.addons)||!!window.opera||navigator.userAgent.indexOf(" OPR/")>=0);var h=typeof InstallTrigger!=="undefined";var d=(/constructor/i.test(window.HTMLElement)||(function(i){return i.toString()==="[object SafariRemoteNotification]"})(!window.safari||(typeof safari!=="undefined"&&safari.pushNotification)));var a=(typeof a!=="undefined");var e=a||!!document.documentMode;var f=!e&&!!window.StyleMedia;var g=!!window.chrome&&!!window.chrome.webstore;var b=(g||c)&&!!window.CSS;return{opera:c,firefox:h,safari:d,ie:e,edge:f,chrome:g,blink:b}}siteGlobals.browser=browserDetect();function Save(c,b){if(typeof Storage!=="undefined"){localStorage.setItem(c,b)}else{var f=new Date();var e=100;f.setTime(f.getTime()+(e*24*60*60*1000));var a="expires="+f.toGMTString();window.document.cookie=c+"="+b+"; "+a}}function Retrieve(b){if(typeof Storage!=="undefined"){return localStorage.getItem(b)}else{var c=b+"=";var a=window.document.cookie.split(";");foreach(a,function(d,e){e=e.trim();if(e.indexOf(c)==0){return e.substring(c.length,e.length)}});return""}}if(!inArray(siteGlobals.siteURL,window.location.origin)){window.location.href=siteGlobals.siteURL+window.location.pathname}addEvent(document.getElementById("btnNavbar"),"click",function(b){var a=b.currentTarget;var c=document.getElementById("navMenu");if(a.getAttribute("menu-is-collapsed")=="true"){a.setAttribute("menu-is-collapsed","false");c.style.display="block"}else{a.setAttribute("menu-is-collapsed","true");c.style.display="none"}});addEvent(document.getElementsByTagName("button"),"click",function(a){a.currentTarget.blur()});addEvent(document.getElementsByTagName("body")[0],"change",function(a){if(a.target.tagName.toLowerCase()!="select"){return}a.target.blur()});addEvent(document.querySelectorAll(".codeblock-container button.wrap-nowrap"),"click",toggleCodeblockWrap);function init_all_matrix_canvases(e,d){var a=document.querySelectorAll(e);var c=document.querySelectorAll(d);for(var b=0;b<a.length;b++){init_matrix_canvas(a[b],c[b])}}function init_matrix_canvas(k,c){if(k.hasOwnProperty("animation_id")){cancelAnimationFrame(k.animation_id)}function m(i){return(i.offsetParent===null)}if(m(k)){return}var j=k.getContext("2d");var a=c.getContext("2d");var e=300;var h=200;var t=["杕","の","丂","七","丄","当","次","万","丈","三","国","下","丌","不","与","丏","よ","丑","丒","专","且","丕","世","丗","丘","丙","业"];var l=[];var d=(619/19)-(7*k.scrollWidth/114);var n="bold "+d+"px monospace";var q=e/d;k.width=c.width=e;k.height=c.height=h;j.fillStyle="black";j.fillRect(0,0,e,h);a.fillStyle="black";a.fillRect(0,0,e,h);function b(u,i){return Math.floor(Math.random()*(i-u)+u)}function g(u,i){return Math.random()*(i-u)+u}function o(v,u,w){var i=w*g(v,u);if(i>u){return u}if(i<v){return v}return i}function s(i,u){this.x=i;this.y=u}s.prototype.draw=function(){if(g(0,10)<1){return}this.value=t[b(0,t.length-1)];if(this.speed==null){this.speed=g(1,10)}if(this.maxY==null){this.maxY=o(h/4,h,2)}a.fillStyle="rgba(255, 255, 255, 0.8)";a.font=n;a.fillText(this.value,this.x,this.y);j.fillStyle="green";j.font=n;j.fillText(this.value,this.x,this.y);this.y+=this.speed;if(this.y>this.maxY){this.y=g(-h/4,0);this.speed=g(1,10);this.maxY=o(h/4,h,2)}};for(var p=0;p<q;p++){l.push(new s(p*d,g(-h/4,0)))}var r=0;function f(){j.canvas.animation_id=requestAnimationFrame(f);r++;if(r<6){return}r=0;j.fillStyle="rgba(0, 0, 0, 0.05)";j.fillRect(0,0,e,h);a.clearRect(0,0,e,h);for(var u=0;u<q;u++){l[u].draw()}}j.canvas.animation_id=requestAnimationFrame(f)}addEvent(window,"load, resize",make_sticky_footer);var timeout_id_resize_footer;function make_sticky_footer(){var a=document.getElementsByTagName("footer")[0];a.style.visibility="hidden";a.style.position="relative";clearTimeout(timeout_id_resize_footer);timeout_id_resize_footer=setTimeout(function(){var c=a.getBoundingClientRect().bottom;var b=document.documentElement.clientHeight;if(c<=b){a.style.position="absolute"}a.style.visibility="visible"},500)}addEvent(window,"load",function(){if(Retrieve("cookie-warning-accepted")!="ok"){document.querySelector(".cookie-warning-notice").style.display="block";addEvent(document.querySelector(".cookie-warning-notice button#ok"),"click",function(){Save("cookie-warning-accepted","ok");document.querySelector(".cookie-warning-notice").style.display="none"})}});function fillSkyscraperAds(){var b=30;var c=630;var d=document.querySelector(".col-1").offsetHeight;var e=document.querySelector(".col-0");var a=b+c;(adsbygoogle=window.adsbygoogle||[]).push({});while(true){var f=document.querySelector(".col-0 .adsbygoogle").cloneNode();a+=c;if(a>d){break}e.appendChild(f);(adsbygoogle=window.adsbygoogle||[]).push({})}}function loadAdsenseScript(){var a=document.createElement("script");a.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";document.body.appendChild(a)}if(siteGlobals.enableAds){addEvent(window,"load",function(){loadAdsenseScript();fillSkyscraperAds();var a=document.querySelectorAll(".adsbygoogle.in-feed").length;for(var b=0;b<a;b++){(adsbygoogle=window.adsbygoogle||[]).push({})}})}if("serviceWorker" in navigator){addEvent(window,"load",function(){navigator.serviceWorker.register("/sw.js")})};