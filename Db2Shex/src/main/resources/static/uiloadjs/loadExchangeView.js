var containerJSONEditor = document.getElementById("tgds_list");
var options = {};
var editorJSON = new JSONEditor(containerJSONEditor, options);
var sideExchangeView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){
    var template = _.template( $("#exchange_template").html(), {} );
    this.$el.html( template );
},
events: {
     "submit":"exchange"
},
exchange:function(e){
	e.preventDefault();
	var exchange=new Exchange();
	
	$("#ls_todo").html("");
	exchange.generateQuery(mapSymbols,graphTGDs,paperTGDs,mapTableIdCanvas);	
	
	var linkC = document.createElement("a");
	var valR=$('input[name=optradio]:checked').val();	 
	if(valR=="sql"){
		linkC.download = 'chase.sql';
	    linkC.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exchange.chaseScript);
	}else if(valR=="rml"){
		linkC.download = 'R2RML.ttl';
		linkC.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(exchange.RMLScript);
	}
    linkC.click();
    
    $("#ls_todo").fadeTo(30000, 500).slideUp(500, function(){
        $("#ls_todo").slideUp(500);
    });  
    
	$.ajax({	  
        url: "chase",
        type: "POST",
        data:  {queries:exchange.chaseQueryDB}
      })
      .done(function(data) {
        console.log(data)        
		var triples=[];
        for(var uri in data){
        	for(var property in data[uri]){
        		for(var i=0; i<data[uri][property].length; i++ ){
      	          var s = uri;
      	          var p = property;
      	          var o = data[uri][property][i]['value'];	        	          
      	          triples.push({subject:s,predicate:p,object:o})
        		}
      	  	}  
        }
        
        
        const fileStream = streamSaver.createWriteStream('triples.rj')
		const writer = fileStream.getWriter()
		const encoder = new TextEncoder		
		let uint8array = encoder.encode(JSON.stringify(data))	
		writer.write(uint8array)
		writer.close();
        
                
        
        var svgTriples = d3.select("#result_exchange").append("svg").attr("width", 800).attr("height", 600);		
		var force = d3.layout.force().size([800, 600]);		
		var graph = triplesToGraph(svgTriples,triples);		
		update(svgTriples,force,graph);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });
	
	}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
