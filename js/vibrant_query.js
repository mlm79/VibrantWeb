/**
 * vibrant_query.js -- A query tool for use with VibrantWeb.
 * This script requires jQuery.
 *
 * @author Margaret McKenna
*/

function(){

	function groupBy(type,expr,dataObj){
		
	
	}



	var VibrantQuery(type,expr,dataObj){
		if (typeof(dataObj)==undefined){
			chrome.extension.sendRequest({method:"get",dataLabel:"browsingData"}, function(response) {
				dataObj = response.data;
			}
		}
		
		return arr;
	}



}();