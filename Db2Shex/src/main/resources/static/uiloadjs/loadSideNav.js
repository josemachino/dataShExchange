var sideLeftView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){
    var template = _.template( $("#side_template").html(), {} );
    this.$el.html( template );
},
events: {
    "click .list-unstyled li a":"hideOthers",
    "click #sideLeftcollapse":"activate"
},
hideOthers:function(e){
    if ($(e.target).parents('li')[0].id=="tgd"){
        
        //$('#tgds_container').html(JSON.stringify());
    	editorJSON.set(stTGD2(graphTGDs,paperTGDs,mapTableIdCanvas))
        /*$('#tgds_list').rainbowJSON({
            maxElements: 1000,
            maxDepth: 10,
            json: stTGD2(graphTGDs,paperTGDs,mapTableIdCanvas)
        });*/
    }
	for (var i=0;i<$(e.target).parents('li').siblings().length;i++){
    $(e.target).parents('li').siblings()[i].firstElementChild.classList.remove('active'); 
    $(e.target).parents('li').siblings()[i].firstElementChild.removeAttribute('aria-expanded');	
	}
},
activate:function(e){    
    //$(e.target).toggleClass('active');
    $('#sidebar').toggleClass('active');
}
});

var side_left_view = new sideLeftView({ el: $("#sidebar") });
