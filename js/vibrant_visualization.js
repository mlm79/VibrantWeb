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

//_data_groups - array of data collections

VibrantViz.interRelations = function(canvas_id,data_groups){

	var xIndent = 20;
	var xSeparation = 500;
	var yIndent = 20;
	var rectWidth = 100;
	var rectHeight = 30;
	
	
	
	
	var groups = [
		[
			{ 	parent: "nytimes", 
				children: ["blah","suck"] 
			},
			{ 	parent: "latimes",
			 	children: ["near","far","suck"] 
			}	
		],
		[
			{ 
				parent: "blah", 
				children:  ["nytimes"] 
			},
			{ 
				parent: "suck", 
				children:  ["nytimes","latimes"] 
			},
			{ 
				parent: "near", 
				children:  ["latimes"] 
			},
			{ 
				parent: "far", 
				children:  ["latimes"] 
			}
		]
	];
	
	var greatestLen = groups[0].length>groups[1].length?groups[0].length:groups[1].length;
	
	var canvasDims = {
		w:700,
		h:yIndent*2+greatestLen*rectHeight
	}

	var p = new Processing(canvas_id, function(p,c){
		
		p.setup = function(){
			p.size(canvasDims.w,canvasDims.h);
			p.ellipseMode(p.CENTER);
			p.smooth();
			p.strokeWeight(1);
		},
		
		p.draw = function() {
			//p.background(255);
			p.ellipse(50,50,30,30);
			
			for (var i in groups){
				var other_group = p.abs(i-1);
				
				for (var j in groups[i]){
					var x = xIndent+i*xSeparation;
					var y = yIndent+j*rectHeight;
					
					p.fill(new randomColor());
					p.rect(x,y,rectWidth,rectHeight);
					p.fill(0);
					p.text(groups[i][j].parent,x+10,y+14);
					
					for (var k in groups[i][j].children){
						
					}
				}
			}
			
			
			p.noLoop();	
		}
	});

	


}

VibrantViz.intraRelations = function(canvas,_data){


}