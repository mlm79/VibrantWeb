//return base domain
function parseBaseDomain(domainStr) {
	var d = domainStr.split(".");
	var base_domain = d[d.length-2]+"."+d[d.length-1];
	return base_domain;
}

//return full domain
function parseBaseDomainFromLink(_http_link,base_domain) {
	var re = /^http:\/\/(.*?)\//; //match domain
	 _http_link.match(re)
	var domain =RegExp.$1;
	if (base_domain){
		domain = parseBaseDomain(domain);
	}
	return domain;
}

function badMatches() {
	var re = /(cdn\.|\/$|\.png$|\.gif$|\.jpg$)/; //match cdn, links to website
	return re;
}

function toMBytes(bytes) {
	return bytes/1024/1024+"M";
}

function isGoodUrl() {
	var re = /(^chrome-extension:\/\/)/;
	return document.URL.match(re)==null;
}


/** 
  *
  * UI Controls
  *
 **/
 
$(document).ready(function(){
	$("#trigger").mouseover(function(){
		$("#settings").slideToggle(200);
	});
	$("#settings").mouseleave(function(){
		$("#settings").slideToggle(200);
	});
});