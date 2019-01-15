var loadTGDView = Backbone.View.extend({
initialize: function(){
    this.render();
},
render: function(){    
    this.$el.html( );
}
});

var tgd_view = new loadTGDView({ el: $("#tgds_container") });
