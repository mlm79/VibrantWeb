function parseBaseDomain(domainStr) {
	var d = domainStr.split(".");
	var base_domain = d[d.length-2]+"."+d[d.length-1];
	return base_domain;
}

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