(function(l){var m="color: #7db904;";var k="";var g="Welcome to the source code for the ";var h=(l.browser.chrome||l.browser.safari);var e=!l.browser.ie;var b=l.browser.ie;if(h){var j=function(q,p){var o=(p!=null)?p:m;console.group("%c"+q+k,o)};var f=console.groupEnd;var d=function(q,p){var o=(p!=null)?p:m;console.log("%c"+q+k,o)};g+=l.sitename}else{var i=-3;var a="";var j=function(o){d(o);i+=3};var f=function(){i-=3;d("")};var d=function(p){var o=(i>=0)?" ".repeat(i):"";a+=o+p+"\n"};g+=l.sitenameASCIIArt}function n(){if(h){return}if(e){console.log("%c"+a,m);return}if(b){var o=a.split("\n");var q=[];var p=0;foreach(o,function(s,r){p+=r.length+1;if(p>1024){console.log(q.join("\n"));q=[];p=r.length+1}q.push(r)});return}console.log(a)}j(g+" blog",m+"font-size: x-large;");d("");d("This website is hosted on github. You can view the Pelican files which generate the static website files at "+l.githubURL+"/tree/master/.source");d("");j("The global Javascript file is "+l.siteURL+"/theme/js/base.js, which is built by merging and minifying the following files:");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/polyfills.js - polyfills to get this site working on older browsers");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/utils.js - common functions used on many pages");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/matrix-animation.js - code to animate the matrix logo");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/autofooter.js - code to position the footer");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/cookie-warning-notice.js - code to show/hide the cookie warning banner at the bottom of the page");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/ads.js - code to lazy-load the pc or mobile adverts");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/register-service-worker.js");f();d("The service worker Javascript file is "+l.githubURL+"/tree/master/.source/themes/thematrix/templates/sw.html");d("");if(l.hasOwnProperty("article")){if(l.commentsPlatforms.length>0){j("All articles have a comments section, which is handled by "+l.siteURL+"/theme/js/comments-section.js. This file is built by merging and minifying the following files:");d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/comments-manager.js");if(inArray("FB",l.commentsPlatforms)){d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/facebook-comments.js")}if(inArray("Disqus",l.commentsPlatforms)){d(l.githubURL+"/tree/master/.source/themes/thematrix/static/js/disqus-comments.js")}f()}if(l.article.hasOwnProperty("consoleExplainScripts")){j("The Javascript files specifically for the '"+l.article.title+"' article are:");var c=l.article.consoleExplainScripts.split("|");foreach(c,function(p,o){d(l.githubURL+"/tree/master/.source/content/"+o)});f()}else{d("There are no Javascript files specifically for the '"+l.article.title+"' article.")}}else{d("Please navigate to an article to view the Javascript files specific to that article (if any).")}f();n()})(siteGlobals);