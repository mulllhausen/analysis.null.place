searchText={current:"",previous:"",debounceCurrent:"",debouncePrevious:""};sortMode={current:"highest-rating",previous:"highest-rating",debounceCurrent:"highest-rating",debouncePrevious:"highest-rating"};searchIndex=[];searchIndexFileName="";searchIndexDownloadStatus="not started";mediaList=[];mediaListFileName="";mediaListDownloadStatus="not started";filteredList="all";numMediaFound=siteGlobals.totalMediaCount;nextMediaIndex=0;addEvent(window,"load",function(){resetSearchBox();renderNextPage(siteGlobals.totalMediaCount,true,afterRendering1Page);var a=debounce(debounceSearch,1000,"both",extraDebounceChecks);addEvent(document.getElementById("search"),"keyup",a);addEvent(document.getElementById("sortBy"),"change",a);addEvent(document.getElementById("reviewsArea"),"click",loadFullReview);var b=false;addEvent(window,"scroll",function(c){if(b){return}setTimeout(function(){infiniteLoader();positionMediaCounter();b=false},333);b=true})});function getMediaIDFromURL(){var a=window.location.pathname.split("/");if(a.length!=4){return null}return a[2]}function removeMediaIDFromUrl(){if(typeof window.history.replaceState=="function"){var a=siteGlobals.mediaType+"-reviews/";window.history.replaceState(null,"",generateCleanURL(a))}else{window.location.hash=""}}function resetSearchBox(){document.getElementById("search").value="";document.getElementById("sortBy").selectedIndex=0}function renderNextPage(b,c,d){showMediaCount(false);var a=getPinnedMediaIndex();renderNextPagePlaceholders(b,a);downloadMediaLists(c,function(){populateMediaPlaceholders(d)})}function clearRenderedMedia(){document.getElementById("reviewsArea").innerHTML="";filteredList=[];nextMediaIndex=0}function showRenderedMedia(a){if(a){document.getElementById("reviewsArea").style.display="block"}else{document.getElementById("reviewsArea").style.display="none";hideAllSkyscraperAds()}}function getPinnedMediaIndex(){var a=document.querySelector("#reviewsArea .media.pinned");if(a==null){return null}return parseInt(a.id.replace("filter-index-",""))}var latestMediaEl=null;function renderNextPagePlaceholders(d,f){var e="";var b=(nextMediaIndex==0);var c=(f!=null);for(var a=((b&c)?1:0);a<siteGlobals.pageSize;a++){if(nextMediaIndex==f){nextMediaIndex++}if(nextMediaIndex>=d){break}e+=get1MediaItemPlaceholderHTML(nextMediaIndex);nextMediaIndex++}document.getElementById("reviewsArea").innerHTML+=e;if(nextMediaIndex==0){latestMediaEl=null}else{latestMediaEl=document.querySelector("#reviewsArea .media#filter-index-"+(nextMediaIndex-1))}}function populateMediaPlaceholders(c){var d=document.querySelectorAll("#reviewsArea .media.placeholder");addEvent(d,"1-media-populated",function(){if(!areAllPlaceholdersPopulated()){return}if(c!=null){c()}});for(var b=0;b<d.length;b++){var a=d[b];populate1MediaPlaceholder(a)}if((d.length==0)&&(c!=null)){c()}}function populate1MediaPlaceholder(b){var c=parseInt(b.id.replace("filter-index-",""));var d=(c<siteGlobals.pageSize);var a=get1MediaIDandHash(c);download1MediaItem(a,function(e,f){switch(e){case"complete":fillRender1MediaItem(b,c,f);break;case"fail":markFailedMediaItem(b);break}triggerEvent(b,"1-media-populated")})}function areAllPlaceholdersPopulated(){var a=document.querySelectorAll("#reviewsArea .media.placeholder").length;return(a==0)}function afterRendering1Page(){var a=true;removeGlassCase("searchBox",a);renderMediaCount();showMediaCount(true);searchSpinner("off")}var mediaPlaceholderInnerHTML=null;function get1MediaItemPlaceholderHTML(a){if(mediaPlaceholderInnerHTML==null){mediaPlaceholderInnerHTML=document.querySelector(".media-placeholder-warehouse .media.placeholder").innerHTML}return'<div  class="media '+siteGlobals.mediaType+' placeholder pulsate" id="filter-index-'+a+'" style="min-height:'+(siteGlobals.maxThumbHeight+65)+'px;">'+mediaPlaceholderInnerHTML+"</div>"}function removePlaceholder(a){deleteElement(document.getElementById("filter-index-"+a))}function fillRender1MediaItem(d,e,c){d.querySelector("a.link-to-self.chain-link").href=generateCleanURL(siteGlobals.mediaType+"-reviews/"+c.id_+"/");var f=d.querySelector(".thumbnail");f.height=c.thumbnailHeight;f.src=siteGlobals.siteURL+"/"+siteGlobals.mediaType+"-reviews/img/"+getThumbnailBasename(c.id_,"thumb")+".jpg?hash="+c.thumbnailHash;f.alt="thumbnail for "+c.title;d.querySelector(".stars").innerHTML=getMediaStarsHTML(c.rating);d.querySelector(".media-title").innerHTML=getRenderedTitle(c);d.querySelector(".review-title").innerHTML=c.reviewTitle;if(c.spoilers){d.querySelector(".spoiler-alert.has-spoilers").style.display="inline";d.querySelector(".spoiler-alert.no-spoilers").style.display="none"}else{d.querySelector(".spoiler-alert.has-spoilers").style.display="none";d.querySelector(".spoiler-alert.no-spoilers").style.display="inline"}d.querySelector(".link-external").href=getExternalLinkURL(c);d.querySelector(".review-created").innerHTML="added "+c.reviewCreated;if(c.reviewUpdated!=null){var b=d.querySelector(".review-updated a");b.href=siteGlobals.githubURL+"/commits/master/"+siteGlobals.mediaType+"-reviews/json/review-"+c.id_+".json";b.innerHTML="updated "+c.reviewUpdated}removeCSSClass(d,"placeholder");removeCSSClass(d,"pulsate")}function markFailedMediaItem(a){addCSSClass(a,"failed-download");removeCSSClass(a,"placeholder")}function loadFullReview(d){if(d.target.tagName.toLowerCase()!="button"||typeof d.target.className!="string"||!inArray("load-review",d.target.className)){return}setButtonLoading(true,d.target);var b=d.target.up(2);var c=parseInt(b.id.replace("filter-index-",""));var a=get1MediaIDandHash(c);linkToSelf(b,a.id_);download1MediaReview(a,function(g,h){var f;var e=b.querySelector("a.link-external").outerHTML;switch(g){case"complete":f=formatReview(h)+e;break;default:case"fail":f=getLoadReviewButtonHTML()+e+'<span class="review-download-error">failed to download review</span>';break}b.querySelector(".review-text").innerHTML=f;setButtonLoading(false,d.target)})}function linkToSelf(c,f){var e=document.querySelectorAll(".media.pinned");for(var d=0;d<e.length;d++){var a=e[d];removeCSSClass(a,"pinned")}addCSSClass(c,"pinned");if(typeof window.history.replaceState=="function"){var b=siteGlobals.mediaType+"-reviews/"+f+"/";window.history.replaceState(null,"",generateCleanURL(b))}else{window.location.hash="#!"+f}return false}function getLoadReviewButtonHTML(){return'<button class="load-review">load review</button>'}function getMediaStarsHTML(a){var c="";for(var b=1;b<=5;b++){if(b<=a){c+='<svg class="icon some-star icon-star"><use xlink:href="'+siteGlobals.iconsSVGURL+'#icon-star"></use></svg>'}else{if((b-1)<a){c+='<svg class="icon some-star icon-star-half-empty"><use xlink:href="'+siteGlobals.iconsSVGURL+'#icon-star-half-empty"></use></svg>'}else{c+='<svg class="icon some-star icon-star-o"><use xlink:href="'+siteGlobals.iconsSVGURL+'#icon-star-o"></use></svg>'}}}return c}function formatReview(a){a=a.replace(/##siteGlobals.siteURL##/g,siteGlobals.siteURL);if(inArray("<p>",a)){return a}return"<p>"+a.replace(/\n/g,"</p><p>")+"</p>"}function getExternalLinkURL(a){var b="https://";var c=siteGlobals.siteURL+"/img/";switch(siteGlobals.mediaType){case"book":b+="www.goodreads.com/book/show/"+a.goodreadsID;break;case"movie":case"tv-series":b+="www.imdb.com/title/"+a.IMDBID;break}return b}var currentMediaCountPanelPosition="inline";function positionMediaCountPanel(b){if(b==currentMediaCountPanelPosition){return}switch(b){case"fixed":case"inline":break;default:return}var a=document.getElementById("mediaCountPanel");switch(b){case"fixed":a.style.width=a.offsetWidth+"px";a.style.top=0;a.style.position="fixed";break;case"inline":a.style.position="static";a.style.width="100%";break}currentMediaCountPanelPosition=b}function showMediaCount(b){var a=b?"visible":"hidden";document.querySelector(".media-count-area").style.visibility=a}function renderMediaCount(){if(numMediaFound==0){document.getElementById("noMediaCount").style.display="inline";document.getElementById("xOfYMediaCount").style.display="none"}else{document.getElementById("noMediaCount").style.display="none";document.getElementById("xOfYMediaCount").style.display="inline";document.getElementById("numMediaShowing").innerHTML=getNumMediaShowing();document.getElementById("totalMediaFound").innerHTML=numMediaFound;document.getElementById("searchTypeDescription").innerHTML=((searchText.current!="")?"search results":"total "+easyPlural(siteGlobals.mediaType,"s"))}}function getRenderedTitle(a){var b=a.title;switch(siteGlobals.mediaType){case"book":b="<i>"+b+"</i> by "+a.author;break;case"tv-series":b+=" Season "+a.season;break}b+=" ("+a.year+")";var c=getSearchTermsList(searchText.current);b=htmlUnderline(c,b);return b}function htmlUnderline(e,b){for(var a=0;a<e.length;a++){var c=e[a];var d=new RegExp("("+c+")","i");b=b.replace(d,"<u>$1</u>")}return b}function getThumbnailBasename(b,a){switch(a){case"original":case"larger":case"thumb":return a+"-"+b;default:throw"bad state"}}function get1MediaIDandHash(a){var b=null;if(filteredList=="all"){b=mediaList[a]}else{if(a<filteredList.length){b=mediaList[filteredList[a]]}}if(b==null){return null}return{id_:b[0],jsonDataFileHash:b[1]}}function getMediaID(a){var b="";switch(siteGlobals.mediaType){case"book":b=a.author+" "+a.title+" "+a.year;break;case"tv-series":b=a.title+" s"+leftPad(a.season,2,"0")+" "+a.year;break;case"movie":b=a.title+" "+a.year;break}return b.replace(/\s+/g,"-").replace(/-+/g,"-").replace(/[^a-z0-9-]*/gi,"").toLowerCase()}function positionMediaCounter(){var a=document.getElementsByClassName("media-count-area")[0];positionMediaCountPanel(isScrolledTo(a,"above")?"fixed":"inline")}var infiniteLoaderRunning=false;function infiniteLoader(){if(infiniteLoaderRunning){return}infiniteLoaderRunning=true;if(areAllMediaItemsRendered()){infiniteLoaderRunning=false;return}if(!isScrolledTo(latestMediaEl,"view","partially")){infiniteLoaderRunning=false;return}var a=false;renderNextPage(numMediaFound,a,afterRendering1Page);infiniteLoaderRunning=false}function areAllMediaItemsRendered(){return(nextMediaIndex==numMediaFound)}function getNumMediaShowing(){return document.querySelectorAll("#reviewsArea .media:not(.placeholder)").length}function triggerSearch(a){getSearchValues();saveCurrentSearch();clearRenderedMedia();showRenderedMedia(true);var b=false;downloadMediaLists(b,function(){updateFilteredListUsingSearch();renderNextPage(numMediaFound,b,afterRendering1Page)})}function getSearchValues(a){var b=(a==null)?"current":a+"Current";searchText[b]=trim(document.getElementById("search").value).toLowerCase();sortMode[b]=document.getElementById("sortBy").value}function anySearchChanges(b){var a=(b==null)?"previous":b+"Previous";var c=(b==null)?"current":b+"Current";return((searchText[a]!==searchText[c])||(sortMode[a]!==sortMode[c]))}function saveCurrentSearch(b){var a=(b==null)?"previous":b+"Previous";var c=(b==null)?"current":b+"Current";searchText[a]=searchText[c];sortMode[a]=sortMode[c]}var searchSpinnerEl=document.getElementById("mediaSearchLoaderArea");function searchSpinner(a){switch(a){case"on":searchSpinnerEl.style.display="block";break;case"off":searchSpinnerEl.style.display="none";break}}function updateFilteredListUsingSearch(){var a=getSearchTermsList(searchText.current);filteredList=searchMediaTitles(a)}function getSearchTermsList(a){if(a==""){return[]}a=a.toLowerCase();return a.split(/[^a-z0-9]/g).filter(function(c,b,d){if(c==""){return false}return(d.indexOf(c)===b)})}function searchMediaTitles(d){if(d.length==0){numMediaFound=siteGlobals.totalMediaCount;return"all"}var c=[];var a="^(?=.*"+d.join(")(?=.*")+")";var e=new RegExp(a,"i");for(var b=0;b<searchIndex.length;b++){if(!e.test(searchIndex[b])){continue}c.push(b)}numMediaFound=c.length;if(c.length==searchIndex.length){c="all"}return c}function extraDebounceChecks(c){var a={};var b="debounce";getSearchValues(b);a.anySearchChanges=anySearchChanges(b);saveCurrentSearch(b);a.extendTimeout=a.anySearchChanges;return a}function debounceSearch(b,a){switch(b){case"atStart":if(!a.anySearchChanges){return}showRenderedMedia(false);showMediaCount(false);scrollToElement(document.getElementById("searchBox"));searchSpinner("on");break;case"atMiddle":break;case"atEnd":getSearchValues();if(!anySearchChanges()){searchSpinner("off");showRenderedMedia(true);showMediaCount(true);return}removeMediaIDFromUrl();getSearchValues("debounce");saveCurrentSearch("debounce");triggerSearch();break}}function downloadMediaLists(c,d){if(d==null){d=function(){}}var a=isMediaListDownloaded(c);var b=(c||isSearchIndexDownloaded());if(a&&b){return d()}if(!a){mediaListFileName=getFileJSONName("list",sortMode.current,c);mediaListDownloadStatus="not started";downloadMediaListJSON(function(){if(c){return d()}if(searchIndexDownloadStatus!="complete"){return}return d()})}if(!b){searchIndexFileName=getFileJSONName("search-index",sortMode.current,c);searchIndexDownloadStatus="not started";downloadSearchIndexJSON(function(){if(mediaListDownloadStatus!="complete"){return}return d()})}}function isMediaListDownloaded(b){var a=getFileJSONName("list",sortMode.current,b);return((mediaListFileName==a)&&(mediaListDownloadStatus=="complete"))}function isSearchIndexDownloaded(){var a=getFileJSONName("search-index",sortMode.current);return((searchIndexFileName==a)&&(searchIndexDownloadStatus=="complete"))}function downloadMediaListJSON(b){if(b==null){b=function(){}}var a="/"+siteGlobals.mediaType+"-reviews/json/"+mediaListFileName;downloadOnce(a,function(c){try{if(c.data==null){throw"no data"}if(c.runCount==1){mediaList=JSON.parse(c.data)}mediaListDownloadStatus="complete";return b()}catch(d){console.error("error in downloadMediaListJSON(): "+d);mediaListDownloadStatus="fail";b()}})}function downloadSearchIndexJSON(b){var a="/"+siteGlobals.mediaType+"-reviews/json/"+searchIndexFileName;downloadOnce(a,function(c){try{if(c.data==null){throw"no data"}if(c.runCount==1){searchIndex=JSON.parse(c.data)}searchIndexDownloadStatus="complete";return b()}catch(d){console.error("error in downloadSearchIndexJSON(): "+d);searchIndexDownloadStatus="fail";b()}})}function download1MediaItem(a,c){var b="/"+siteGlobals.mediaType+"-reviews/json/data-"+a.id_+".json?hash="+a.jsonDataFileHash;ajax(b,function(e){try{if(e==null){throw"no data"}var d=JSON.parse(e);d.id_=getMediaID(d);if(c!=null){c("complete",d)}}catch(f){console.error("error in download1MediaItem() for "+b+": "+f);if(c!=null){c("fail")}}})}function download1MediaReview(a,c){if(c==null){c=function(){}}var b="/"+siteGlobals.mediaType+"-reviews/json/review-"+a.id_+".json?hash="+a.jsonDataFileHash;ajax(b,function(e){try{if(e==null){throw"no data"}var d=JSON.parse(e).reviewFull;c("complete",d)}catch(f){console.error("error in download1MediaReview() for "+b+": "+f);c("fail")}})}function getFileJSONName(a,e,d){d=(d==true);var c=a+"-"+e+(d?"-first-"+siteGlobals.pageSize:"");var b=siteGlobals.mediaFileHashes[c];return c+".json?hash="+b};