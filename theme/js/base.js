if(!String.prototype.repeat){String.prototype.repeat=function(c){if(this==null){throw new TypeError("can't convert "+this+" to object")}var d=""+this;c=+c;if(c!=c){c=0}if(c<0){throw new RangeError("repeat count must be non-negative")}if(c==Infinity){throw new RangeError("repeat count must be less than infinity")}c=Math.floor(c);if(d.length==0||c==0){return""}if(d.length*c>=1<<28){throw new RangeError("repeat count must not overflow maximum string size")}var a="";for(var b=0;b<c;b++){a+=d}return a}}if("ab".substr(-1)!="b"){String.prototype.substr=function(a){return function(c,b){if(c<0){c=this.length+c;if(c<0){c=0}}return a.call(this,c,b)}}(String.prototype.substr)}if(!String.prototype.trim){String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}}if(!Element.prototype.matches){Element.prototype.matches=Element.prototype.msMatchesSelector||Element.prototype.webkitMatchesSelector}if(!Element.prototype.closest){Element.prototype.closest=function(d){var b=this;if(Element.prototype.matches){if(!document.documentElement.contains(b)){return null}while(true){if(b.matches(d)){return b}b=b.parentNode;if(b==null){return null}if(b.nodeType!==1){return null}}}else{if(window.Element){var c=(this.document||this.ownerDocument).querySelectorAll(d);while(true){for(var a=0;a<c.length;a++){if(c.item(a)===b){return b}}b=b.parentNode;if(b==null){return null}if(b.nodeType!==1){return null}}}}return null}}function fixConsole(d){var c=["assert","clear","count","debug","dir","dirxml","error","table","exception","group","groupCollapsed","groupEnd","info","log","markTimeline","profile","profileEnd","time","timeEnd","timeStamp","trace","warn"];var b=(window.console=window.console||{});var a=(d.chrome||d.safari);for(var e=0;e<c.length;e++){var f=c[e];if(!b[f]){if(f=="group"&&b.log){b.group=b.log}else{b[f]=function(){return"not implemented"}}}}}if(!Math.trunc){Math.trunc=function(a){a=+a;if(!isFinite(a)){return a}return(a-(a%1))||((a<0)?-0:(a===0?a:0))}}window.requestAnimationFrame=function(){return window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||window.oRequestAnimationFrame||function(a){window.setTimeout(a,1000/60)}}();window.cancelAnimationFrame=function(){return window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame||window.msCancelAnimationFrame||window.oCancelAnimationFrame||function(a){window.clearTimeout(a)}}();function stopBubble(a){if(a.stopPropagation){a.stopPropagation()}else{a.cancelBubble=true}}function getEntireHeight(){return Math.max(document.body.scrollHeight,document.body.offsetHeight,document.documentElement.clientHeight,document.documentElement.scrollHeight,document.documentElement.offsetHeight)}function isScrolledTo(e,b,d){if(e==null){return false}var f=e.getBoundingClientRect();var a=f.top;var c=f.bottom;switch(b){case"view":switch(d){case"entirely":return((a>=0)&&(c<=window.innerHeight));default:case"partially":return((a<window.innerHeight)&&(c>=0))}case"above":switch(d){case"entirely":return(c<0);case"partially":return((a<0)&&(c>0));default:return(a<0)}case"below":switch(d){case"entirely":return(a>window.innerHeight);case"partially":return((a<window.innerHeight)&&(c>window.innerHeight));default:return(c>window.innerHeight)}default:throw"error in isScrolledTo function: unknown position"+((b==null)?"":b)}}function getCoordinates(b){var c=b.getBoundingClientRect();var a=document.body;var h=document.documentElement;var d=window.pageYOffset||h.scrollTop||a.scrollTop;var e=window.pageXOffset||h.scrollLeft||a.scrollLeft;var g=h.clientTop||a.clientTop||0;var f=h.clientLeft||a.clientLeft||0;return{top:Math.round(c.top+d-g),left:Math.round(c.left+e-f)}}function getDeviceType(){return window.getComputedStyle(document.getElementsByTagName("body")[0],":before").getPropertyValue("content").replace(/"/g,"")}function isEven(a){return((a%2)==0)}function trim(a){return a.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}function trimLeft(a){return a.replace(/^[\s\uFEFF\xA0]+/g,"")}function trimRight(a){return a.replace(/[\s\uFEFF\xA0]+$/g,"")}function leftPad(b,a,c){b=b.toString();if(b.length>=a){return b}if(c==null){c="0"}return c.repeat(a-b.length)+b}function unixtime(a){switch(typeof a){case"string":return Math.round(Date.parse(a)/1000);case"object":return Math.round(a.getTime()/1000);default:return Math.round((new Date()).getTime()/1000)}}NodeList.prototype.isNodeList=HTMLCollection.prototype.isNodeList=function(){return true};function isNodeList(b){try{return(b.isNodeList()===true)}catch(a){return false}}function foreach(c,d){if(isNodeList(c)||(c instanceof Array)){for(var b=0;b<c.length;b++){if(d(b,c[b])===false){break}}}else{if(typeof c==="object"){for(var a in c){if(!c.hasOwnProperty(a)){continue}if(d(a,c[a])===false){break}}}}}function addEvent(e,f,i){if(e==null||typeof(e)=="undefined"){return}var a=(isNodeList(e)?e:[e]);var h=f.split(",");for(var c=0;c<a.length;c++){var b=a[c];for(var d=0;d<h.length;d++){var g=h[d].replace(/ /g,"");if(b.addEventListener){b.addEventListener(g,i,false)}else{if(b.attachEvent){b.attachEvent("on"+g,i)}else{b["on"+g]=i}}}}}function removeEvent(e,f,i){if(e==null||typeof(e)=="undefined"){return}var a=(isNodeList(e)?e:[e]);var h=f.split(",");for(var c=0;c<a.length;c++){var b=a[c];for(var d=0;d<h.length;d++){var g=h[d].replace(/ /g,"");if(b.removeEventListener){b.removeEventListener(g,i,false)}else{if(b.detachEvent){b.detachEvent("on"+g,i)}else{delete b["on"+g]}}}}}function triggerEvent(c,e){if(c==null||typeof(c)=="undefined"){return}var f=(isNodeList(c)?c:[c]);for(var b=0;b<f.length;b++){var d=f[b];if("createEvent" in document){var a=document.createEvent("HTMLEvents");a.initEvent(e,false,true);d.dispatchEvent(a)}else{d.fireEvent("on"+e)}}}function popup(b,a){document.getElementById("fullpagePopupHeading").innerHTML=b;document.getElementById("fullpagePopupDetail").innerHTML=a;document.getElementById("fullpagePopupNotification").style.display="table";setTimeout(hidePopup,3000)}function hidePopup(){document.getElementById("fullpagePopupNotification").style.display="none"}function addLi2Ul(c,b,e,d){if(typeof c=="string"){c=document.querySelector(c)}var a=document.createElement("li");if(b!=null){a.id=b}if(d!=null){a.className=d}a.appendChild(document.createTextNode(e));c.appendChild(a)}function deleteElementById(a){deleteElement(document.getElementById(a))}function deleteElement(a){if(a==null){return}a.parentNode.removeChild(a)}function deleteElements(a){var b=(isNodeList(a)?a:[a]);if(b.length==0){return}foreach(b,function(c,d){deleteElement(d)})}function addCSSClass(a,b){if(a==null){return}var c=a.className.split(/\s+/);c.push(b);a.className=c.join(" ")}function removeCSSClass(b,d){if(b==null){return}var c=b.className.split(/\s+/);var a=c.indexOf(d);if(a==-1){return}c.splice(a,1);b.className=c.join(" ")}var permanentlyRemovedGlassCases=[];function removeGlassCase(c,a){if(inArray(c,permanentlyRemovedGlassCases)){return}var b=document.getElementById(c);foreach(b.querySelectorAll("button:not(.keep-disabled)"),function(d,e){e.disabled=false});foreach(b.querySelectorAll("input:not(.keep-disabled)"),function(d,e){e.disabled=false});foreach(b.querySelectorAll("select:not(.keep-disabled)"),function(d,e){e.disabled=false});removeCSSClass(b,"glass-case");if(a){permanentlyRemovedGlassCases.push(c)}}function isHex(b){var a=/^-?[0-9a-f]+$/gi;return a.test(b)}function stringIsInt(a){return(a==parseInt(a,10))}function stringIsFloat(a){return(a==parseFloat(a))}function setButtons(a){foreach(arguments,function(c,b){if(c==0){return}document.getElementById("btn"+b).disabled=!a})}function setButtonLoading(c,a){var b='<span class="button-loading"></span> ';a.innerHTML=(c?b+a.innerHTML:a.innerHTML.replace(b,""));return a}function inArray(b,a){return(a.indexOf(b)>-1)}function mergeObjects(){var a={};foreach(arguments,function(b,c){foreach(c,function(e,d){a[e]=d})});return a}function jsonCopyObject(a){return JSON.parse(JSON.stringify(a))}function addThousandCommas(d){d+="";var e=d.split(".");var c=e[0];var a=((e.length>1)?"."+e[1]:"");var b=/(\d+)(\d{3})/;while(b.test(c)){c=c.replace(b,"$1,$2")}return c+a}function ajax(a,c){var b=new XMLHttpRequest();addEvent(b,"readystatechange",function(){if(this.readyState!=XMLHttpRequest.DONE){return}if(this.status!=200){return}c(this.responseText)});b.open("GET",a,true);b.timeout=5000;addEvent(b,"timeout",function(){c(null)});addEvent(b,"error",function(){c(null)});b.send()}var downloadProperties={};function downloadOnce(a,c){if(!downloadProperties.hasOwnProperty[a]){downloadProperties[a]={setupCount:0,runCount:0,status_:"not started",data:null}}if(downloadProperties[a].status_=="complete"){return triggerEvent(document,"done-download-"+a)}var b=function(){downloadProperties[a].runCount++;c(downloadProperties[a]);if(downloadProperties[a].runCount<downloadProperties[a].setupCount){return}removeEvent(document,"done-download-"+a,b);delete downloadProperties[a]};downloadProperties[a].setupCount++;addEvent(document,"done-download-"+a,b);if(downloadProperties[a].status_=="in progress"){return}downloadProperties[a].status_="in progress";ajax(a,function(d){downloadProperties[a].data=d;downloadProperties[a].status_="complete";triggerEvent(document,"done-download-"+a)})}Element.prototype.up=function(a){var c=this;for(var b=0;b<a;b++){c=c.parentNode}return c};var uniqueTextAligner="|%|";function alignText(e){e.style.whiteSpace="pre";var a=e.innerHTML.split("\n");if(a.length==1){return}foreach(e.querySelectorAll(".aligner"),function(g,h){h.innerHTML=uniqueTextAligner});a=e.innerHTML.split("\n");var d=0;var f=[];var b={};foreach(a,function(j,g){if(!inArray(uniqueTextAligner,g)){f.push(j);return}if(inArray("<",g)&&inArray(">",g)){var i=document.createElement("div");i.innerHTML=g;g=i.textContent}b[j]=g;var h=g.indexOf(uniqueTextAligner);if(h>d){d=h}});var c=0;foreach(a,function(i,h){if(inArray(i,f)){return}var g=b[i].split(uniqueTextAligner);e.querySelectorAll(".aligner")[c].innerHTML=" ".repeat(d-g[0].length);c++})}function unalignText(a){a.style.whiteSpace="pre-wrap";foreach(a.querySelectorAll(".aligner"),function(b,c){c.innerHTML=""})}function easyPlural(b,a){if(b.substr(-a.length)==a){return b}return b+a}function plural(b,a){switch(b){case"s":if(a){return"s"}else{return""}}}function scrollToElement(a){a.scrollIntoView()}function trimInputValue(f){var c=true;var d=f.value;var a=d.length;if(a==0){return d}var e=trim(d);if(d==e){return d}var g={start:f.selectionStart,end:f.selectionEnd};var b=trimLeft(d);if(b.length!=a){g.start-=(a-b.length);g.end-=(a-b.length)}f.value=e;f.setSelectionRange(g.start,g.end);return e}function toggleCodeblockWrap(c){var a=c.currentTarget;var b=a.parentNode.parentNode.querySelector(".codeblock");if(a.getAttribute("wrapped")=="true"){a.querySelector(".icon-level-left").style.display="inline-block";a.querySelector(".icon-arrows-h").style.display="none";alignText(b);a.setAttribute("wrapped","false")}else{a.querySelector(".icon-level-left").style.display="none";a.querySelector(".icon-arrows-h").style.display="inline-block";unalignText(b);a.setAttribute("wrapped","true")}}function toggleAllCodeblockWrapsMobile(){triggerEvent(document.querySelectorAll(".auto-wrap-on-mobile button.wrap-nowrap"),"click")}function englishList(d,a,c){var b="";foreach(d,function(e,f){b+=f;switch(e){case (d.length-2):b+=c;break;case (d.length-1):break;default:b+=a;break}});return b}function browserDetect(){var c=((!!window.opr&&!!opr.addons)||!!window.opera||navigator.userAgent.indexOf(" OPR/")>=0);var h=typeof InstallTrigger!=="undefined";var d=(/constructor/i.test(window.HTMLElement)||(function(i){return i.toString()==="[object SafariRemoteNotification]"})(!window.safari||(typeof safari!=="undefined"&&safari.pushNotification)));var a=(typeof a!=="undefined");var e=a||!!document.documentMode;var f=!e&&!!window.StyleMedia;var g=!!window.chrome&&!!window.chrome.webstore;var b=(g||c)&&!!window.CSS;return{opera:c,firefox:h,safari:d,ie:e,edge:f,chrome:g,blink:b}}siteGlobals.browser=browserDetect();function Save(c,b){if(typeof Storage!=="undefined"){localStorage.setItem(c,b)}else{var f=new Date();var e=100;f.setTime(f.getTime()+(e*24*60*60*1000));var a="expires="+f.toGMTString();window.document.cookie=c+"="+b+"; "+a}}function Retrieve(b){if(typeof Storage!=="undefined"){return localStorage.getItem(b)}else{var c=b+"=";var a=window.document.cookie.split(";");foreach(a,function(d,e){e=e.trim();if(e.indexOf(c)==0){return e.substring(c.length,e.length)}});return""}}function debounce(e,d,a,b){var c=null;return function(){var f=function(){c=null;switch(a){case"end":case"both":e("atEnd");break}};var i;var h=(c==null)?"atStart":"atMiddle";switch(a){case"start":if(h=="atStart"){i=true}break;case"both":i=true;break;case"end":i=false;break}var g={extendTimeout:true};if(b!=null){g=b(h)}if(g.extendTimeout){clearTimeout(c);c=setTimeout(f,d)}if(i){e(h,g)}}}function generateCleanURL(a){if(a[0]!="/"){a="/"+a}return siteGlobals.siteURL+a}if(!inArray(siteGlobals.siteURL,window.location.origin)){window.location.href=generateCleanURL(window.location.pathname)}initialDeviceType=getDeviceType();addEvent(document.getElementById("btnNavbar"),"click",function(b){var a=b.currentTarget;if(a.getAttribute("menu-is-collapsed")=="true"){openMenu()}else{closeMenu()}});function closeMenu(){document.getElementById("btnNavbar").setAttribute("menu-is-collapsed","true");document.getElementById("navMenu").style.display="none"}function openMenu(){document.getElementById("btnNavbar").setAttribute("menu-is-collapsed","false");document.getElementById("navMenu").style.display="block"}addEvent(document.getElementsByTagName("button"),"click",function(a){a.currentTarget.blur()});addEvent(document.getElementsByTagName("body")[0],"change",function(a){if(a.target.tagName.toLowerCase()!="select"){return}a.target.blur()});addEvent(document.querySelectorAll(".codeblock-container button.wrap-nowrap"),"click",toggleCodeblockWrap);function init_all_matrix_canvases(e,d){var a=document.querySelectorAll(e);var c=document.querySelectorAll(d);for(var b=0;b<a.length;b++){init_matrix_canvas(a[b],c[b])}}function init_matrix_canvas(k,c){if(k.hasOwnProperty("animation_id")){cancelAnimationFrame(k.animation_id)}function m(i){return(i.offsetParent===null)}if(m(k)){return}var j=k.getContext("2d");var a=c.getContext("2d");var e=300;var h=200;var t=["杕","の","丂","七","丄","当","次","万","丈","三","国","下","丌","不","与","丏","よ","丑","丒","专","且","丕","世","丗","丘","丙","业"];var l=[];var d=(619/19)-(7*k.scrollWidth/114);var n="bold "+d+"px monospace";var q=e/d;k.width=c.width=e;k.height=c.height=h;j.fillStyle="black";j.fillRect(0,0,e,h);a.fillStyle="black";a.fillRect(0,0,e,h);function b(u,i){return Math.floor(Math.random()*(i-u)+u)}function g(u,i){return Math.random()*(i-u)+u}function o(v,u,w){var i=w*g(v,u);if(i>u){return u}if(i<v){return v}return i}function s(i,u){this.x=i;this.y=u}s.prototype.draw=function(){if(g(0,10)<1){return}this.value=t[b(0,t.length-1)];if(this.speed==null){this.speed=g(1,10)}if(this.maxY==null){this.maxY=o(h/4,h,2)}a.fillStyle="rgba(255, 255, 255, 0.8)";a.font=n;a.fillText(this.value,this.x,this.y);j.fillStyle="green";j.font=n;j.fillText(this.value,this.x,this.y);this.y+=this.speed;if(this.y>this.maxY){this.y=g(-h/4,0);this.speed=g(1,10);this.maxY=o(h/4,h,2)}};for(var p=0;p<q;p++){l.push(new s(p*d,g(-h/4,0)))}var r=0;function f(){j.canvas.animation_id=requestAnimationFrame(f);r++;if(r<6){return}r=0;j.fillStyle="rgba(0, 0, 0, 0.05)";j.fillRect(0,0,e,h);a.clearRect(0,0,e,h);for(var u=0;u<q;u++){l[u].draw()}}j.canvas.animation_id=requestAnimationFrame(f)}addEvent(window,"load, resize",makeStickyFooter);var timeoutIDResizeFooter;function makeStickyFooter(){var a=document.getElementsByTagName("footer")[0];a.style.visibility="hidden";a.style.position="relative";clearTimeout(timeoutIDResizeFooter);timeoutIDResizeFooter=setTimeout(function(){var b=a.getBoundingClientRect().bottom;if(getEntireHeight()<=window.innerHeight){a.style.position="fixed"}a.style.visibility="visible"},500)}addEvent(window,"load",function(){if(Retrieve("cookie-warning-accepted")=="ok"){return}var a=document.querySelector(".cookie-warning-notice");addCSSClass(a,"show");addEvent(document.querySelector(".cookie-warning-notice button#ok"),"click",function(){Save("cookie-warning-accepted","ok");removeCSSClass(a,"show")})});var skyscraperAdTopMargin=30;var skyscraperAdHeight=630;function deleteInFeedAds(){deleteElements(document.querySelectorAll(".col-1 .adsbygoogle"))}function deleteSkyscraperAds(){deleteElements(document.querySelectorAll(".col-0 .adsbygoogle"))}function hideBottomAnchorAd(){document.querySelector(".bottom-anchor-ad").style.display="none";document.querySelector("footer").style.marginBottom="0px"}var sampleSkyscraperAd=null;function fillSkyscraperAds(){if(sampleSkyscraperAd==null){sampleSkyscraperAd=document.querySelector(".col-0 .adsbygoogle").cloneNode();loadAdsenseScript(function(){(adsbygoogle=window.adsbygoogle||[]).push({})})}setInterval(function(){while(true){var a=add1MoreSkyscraperAd(sampleSkyscraperAd);if(a){break}}},500)}function add1MoreSkyscraperAd(b){var a=document.querySelector(".col-1").offsetHeight;if(!anyVisibleSkyscraperAds()){unhide1SkyscraperAd()}if((getSkyscraperAdsTotalHeight()+skyscraperAdHeight)>a){return true}if(anyHiddenSkyscraperAds()){unhide1SkyscraperAd()}else{document.querySelector(".col-0").appendChild(b.cloneNode());loadAdsenseScript(function(){(adsbygoogle=window.adsbygoogle||[]).push({})})}return false}function hideAllSkyscraperAds(){if(initialDeviceType!="pc"&&initialDeviceType!="tablet"){return}foreach(document.querySelectorAll(".adsbygoogle.skyscraper"),function(a,b){addCSSClass(b,"important-hidden")})}function unhide1SkyscraperAd(){var a=document.querySelector(".adsbygoogle.skyscraper.important-hidden");removeCSSClass(a,"important-hidden")}function anyHiddenSkyscraperAds(){return document.querySelectorAll(".adsbygoogle.skyscraper.important-hidden").length>0}function anyVisibleSkyscraperAds(){return(document.querySelectorAll(".adsbygoogle.skyscraper:not(.important-hidden)").length>0)}function getSkyscraperAdsTotalHeight(){return document.querySelectorAll(".adsbygoogle.skyscraper:not(.important-hidden)").length*(skyscraperAdHeight+skyscraperAdTopMargin)}function loadInFeedAds(){if(initialDeviceType!="phone"){return}foreach(document.querySelectorAll(".col-1 .adsbygoogle:not(.load)"),function(a,b){addCSSClass(b,"load");loadAdsenseScript(function(){(adsbygoogle=window.adsbygoogle||[]).push({})})})}var fiveSecondsInMilliseconds=5000;function loadBottomAnchorAd(){if(initialDeviceType!="phone"){return}document.querySelector(".bottom-anchor-ad").style.display="block";var a=document.querySelector(".bottom-anchor-ad .adsbygoogle:not(.load)");addCSSClass(a,"load");loadAdsenseScript(function(){(adsbygoogle=window.adsbygoogle||[]).push({});if(siteGlobals.debugging===true){return}var b=setInterval(function(){switch(getBottomAnchorAdFillStatus()){case"unfilled":hideBottomAnchorAd();case"filled":clearInterval(b);break;default:break}},fiveSecondsInMilliseconds)})}function getBottomAnchorAdFillStatus(){return document.querySelector(".bottom-anchor-ad ins.adsbygoogle").getAttribute("data-ad-status")}function archiveInFeedAds(){return;foreach(document.querySelectorAll(".col-1 .in-feed-ad-container"),function(a,b){if(b.childNodes.length==0){return}var c=b.childNodes[0];document.getElementById("adsArchiveArea").appendChild(c)})}function populateInFeedAds(){return;if(initialDeviceType!="phone"){return}var a=document.getElementById("adsArchiveArea").children;foreach(document.querySelectorAll(".in-feed-ad-container"),function(b,c){if(trim(c.innerHTML)!=""){return}if(a.length>0){c.appendChild(a[0])}else{c.innerHTML=sampleInFeedAdHTML;loadAdsenseScript(function(){(adsbygoogle=window.adsbygoogle||[]).push({})})}})}var adsenseScriptState="before-loading";function loadAdsenseScript(b){switch(adsenseScriptState){case"before-loading":adsenseScriptState="loading";addEvent(document,"adsense-loaded",b);var a=document.createElement("script");a.async=true;addEvent(a,"load",function(){adsenseScriptState="loaded";triggerEvent(document,"adsense-loaded")});a.src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";document.body.appendChild(a);break;case"loading":addEvent(document,"adsense-loaded",b);break;case"loaded":return b()}}if(siteGlobals.enableAds){addEvent(window,"load",function(){document.getElementById("adsArchiveArea").innerHTML="";switch(initialDeviceType){case"phone":deleteSkyscraperAds();loadBottomAnchorAd();break;case"pc":case"tablet":hideBottomAnchorAd();fillSkyscraperAds();break}})}var newServiceWorker;if("serviceWorker" in navigator){addEvent(window,"load",function(){navigator.serviceWorker.register("/sw.js").then(function(a){addEvent(a,"updatefound",function(){newServiceWorker=a.installing;addEvent(newServiceWorker,"statechange",function(){switch(newServiceWorker.state){case"activated":if(navigator.serviceWorker.controller==null){break}showNewVersionNotice();break}})})});addEvent(document.getElementById("reloadNewVersion"),"click",function(){window.location.reload()})})}function showNewVersionNotice(){addCSSClass(document.querySelector(".new-version-info-notice"),"show")}var backgroundImageSize={height:148,width:160};var numBackgroundImages=100;var backgroundImage=siteGlobals.siteURL+"/theme/img/crack1.png";var verticalGap=100;(function(){if(initialDeviceType=="phone"){return""}var k=document.querySelector(".col-0").offsetWidth;var l=k-(backgroundImageSize.width/2);var a=getCoordinates(document.querySelector(".col-2")).left-(backgroundImageSize.width/2);var m=document.querySelector(".col-2").offsetWidth-(backgroundImageSize.width/2);var b=document.querySelector(".logo-container");var f=getCoordinates(b).top+b.offsetHeight;var e="";var n="";var d="";var o="";for(var g=0;g<numBackgroundImages;g++){var c=0;var h=(backgroundImageSize.height+verticalGap)*g;if(isEven(g)){var j=(h>f)?m*Math.random():0;c=a+m-j}else{var j=backgroundImageSize.width*0.3*(Math.random()-0.5);c=l-j}e+=o+c+"px "+h+"px";n+=o+'url("'+backgroundImage+'")';d+=o+"no-repeat";o=","}document.body.style.backgroundImage=n;document.body.style.backgroundRepeat=d;document.body.style.backgroundPosition=e})();