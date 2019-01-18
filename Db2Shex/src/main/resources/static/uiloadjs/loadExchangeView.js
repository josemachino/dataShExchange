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
    // verify that every triple constraint that has multiplicity 1 is linked
	graphTGDs.getElements().forEach(function(element){
			if (element.type=="shex.Type"){
				element.options.forEach(function(tc) {	
					console.log(tc)
					  if (tc.mult=="1"){
						  var elementView=element.findView(paperTGDs);
						  var intargetLinks=graphTGDs.getConnectedLinks(elementView.model, {inbound:true});
						  if (intargetLinks.length==0)
							  alert("Need "+tc.label)
						  console.log(intargetLinks)
						  //add to a list to show what needs to be achieved in order to obtain a correct chase
						  
					  }
				});
			}        	
    });
	
	//var tdata='{"functions":{},"rules":[{"bind":{"Company":"Company","Contact":"Contact","table3":"table3","table2":"table2","table1":"table1"},"constraints":[],"yield":[{"atom":"ProductShape","args":[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}]},{"atom":"Triple","args":[[{"function":"f1","args":[{"rel":"Contact","attr":"id"}]}],"name",[{"rel":"Contact","attr":"firstname"}]]}]}]}'
	$.ajax({
        url: "chase",
        type: "POST",
        data:  JSON.stringify(editorJSON.get()),
        processData: false,
        contentType: "application/json"
      })
      .done(function(data) {
        console.log(data)
        
        $('#result_exchange').html(data)
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        
      });
	
}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
