/**
 * vibrant_visualization.js -- Visualizing 3rd-party entities on the web.
 * This script requires jQuery and Processing.js.
 *
 * @author Margaret McKenna
*/

var VibrantViz = VibrantViz || {};

function randomColor(){
	var rand_color = "0xFF"+Math.floor(Math.random()*16777215).toString(16).toUpperCase();
	console.log(rand_color);
	return rand_color;
}

function randomRGB() {
	var r = Math.floor(Math.random()*255),
		g = Math.floor(Math.random()*255),
		b = Math.floor(Math.random()*255);
	return [r,g,b];
}

//_data_groups - array of data collections

VibrantViz.interRelations = function(canvas_id,_data){

	var xIndent = 20;
	var xSeparation = 500;
	var yIndent = 20;
	var rectWidth = 200;
	var rectHeight = 30;
	var site_length;
	
	console.log(_data);
	
	for (var i in _data.sites) {
		if (typeof(_data.sites[i].index)!=undefined) {
			_data.sites[i].color = randomRGB();
			site_length++;
		} else {
			delete _data.sites[i];
		}
	}

	
	var greatestLen = site_length>Object.keys(_data.entities).length?site_length:Object.keys(_data.entities).length;
	
	var canvasDims = {
		w:1400,
		h:yIndent*2+greatestLen*rectHeight
	}
	
	
	function drawLines(site) {
		var i = site,
		 	col = _data.sites[i].color,
		 	x = xIndent;
			y = yIndent+_data.sites[i].index*rectHeight;
		 	
		for (var j in _data.sites[i].entities) {
			var entity = _data.sites[i].entities[j];
			var x1 = x+rectWidth,
				y1 = y + j/_data.sites[i].entities.length*rectHeight,
				y2 = yIndent+_data.entities[entity].index*rectHeight+_data.entities[entity].sites.indexOf(i)/_data.entities[entity].sites.length*rectHeight,
				x2 = xIndent+rectWidth+xSeparation;
			p.stroke(col[0],col[1],col[2]);
			p.line(x1,y1,x2,y2);
		}
	}

	var p = new Processing(canvas_id, function(p,c){
		
		p.setup = function(){
			p.size(canvasDims.w,canvasDims.h);
			p.ellipseMode(p.CENTER);
			p.smooth();
			p.strokeWeight(1);
		},
		
		p.draw = function() {
			
			for (var i in _data.sites) {
				var col = _data.sites[i].color;
				p.fill(col[0],col[1],col[2]);
				p.stroke(255,0,0);
				var x = xIndent;
				var y = yIndent+_data.sites[i].index*rectHeight;
				p.rect(x,y,rectWidth,rectHeight);
				p.fill(0);
				p.text(i,x+20,y+20);
				drawLines(i,x,y,col);
			}
			

			for (var i in _data.entities) {
				p.fill(255);
				p.stroke(255,0,0);
				var x = xIndent+rectWidth+xSeparation;
				var y = yIndent+_data.entities[i].index*rectHeight;
				p.rect(x,y,rectWidth,rectHeight);
				p.fill(0);
				p.text(i,x+20,y+20);
			}
			
			
			
			p.noLoop();	
		}
	});

	


}

VibrantViz.intraRelations = function(canvas,_data){


}