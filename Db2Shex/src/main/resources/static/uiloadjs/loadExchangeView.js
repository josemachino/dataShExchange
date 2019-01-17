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
        	console.log(element)
            var elementView=element.findView(paperTGDs);
            console.log(elementView)
        
    });
}
});

var side_exchange_view = new sideExchangeView({ el: $("#sidebar-right") });
