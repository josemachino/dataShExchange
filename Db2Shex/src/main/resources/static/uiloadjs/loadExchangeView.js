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
    // verify that every triple constraint that has multiplicity 1 is linked
	graphTGDs.getElements().forEach(function(element){
			if (element.type=="shex.Type"){
				element.options.forEach(function(tc) {					  
					  if (tc.mult=="1"){
						  //add to a list to show what needs to be achieved in order to obtain a correct chase
						  console.log(tc)
					  }
				});
			}        	
    });
	console.log(editorJSON.get())
	$.ajax({
        url: "chase",
        type: "POST",
        data:  editorJSON.get(),
        processData: false,
        contentType: "application/json"
      })
      .done(function(data) {
        console.log(data)
        
      })
      .fail(function(jqXHR, textStatus, errorThrown) {        
        console.log(textStatus);
      })
      .always(function() {
        console.log("Oficio Parvo")
      });
	e.preventDefault();
}
});

var side_exchange_view = new sideExchangeView({ el: $("#result_container") });
