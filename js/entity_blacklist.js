//A JSON object used to identify benign 3rd-party entities,
//on a per-site and global (*) basis.

//Currently the properties are exact matches; could be implemented
//as regex in the future.

var entity_blacklist = {
	'fastcodesign.com' : [
		"www.fastcompany.com"
	],
	'nytimes.com' : [
		"www.nytco.com",
		"js.nyt.com"
	],
	'yahoo.com' : [
		"l.yimg.com",
		"mail.yimg.com",
		"yui.yahooapis.com"	
	],
	'*' : [
		"maps.google.com",
		"jquery.com"
	]
};