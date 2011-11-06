//return base domain
function parseBaseDomain(domainStr) {
	var d = domainStr.split(".");
	var base_domain = d[d.length-2]+"."+d[d.length-1];
	return base_domain;
}

//return full domain
function parseBaseDomainFromLink(_http_link) {
	var re = /^http:\/\/(.*?)\//; //match domain
	 _http_link.match(re)
	var domain =RegExp.$1;
	return domain;
}

function badMatches() {
	var re = /(cdn\.|\/$)/; //match cdn, links to website
	return re;
}

function toMBytes(bytes) {
	return bytes/1024/1024+"M";
}