$(function() {
  Parse.$ = jQuery;
  
   // This is the transient application state, not persisted on Parse
   var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });


 var NextTimePlanView = Parse.View.extend({
    template: _.template($('#nexttime-template').html()),
    el: "#nextTimeDetails",
      
    initialize: function() {
        var self = this;
        
        this.weekplans = new WeekPlans;
        this.weekplans.query = new Parse.Query(WeekPlan);
                
        this.weekplans.fetch({
          success: function(collection, selv) {
              nextTimePlanView.render();
          },
          error: function(collection, error, selv) {
            nextTimePlanView.render();
            $("#errormessage").html("Произошла какая то ошибка. Свяжитесь со службой поддержки (Ирой) :)");
          }
        });
     },

    render: function() {
       var nextTimeRow = this.weekplans.getNextTime();
      
       $(this.el).html(this.template(nextTimeRow.toJSON()));  
       return this;
    }
  });
    

  var PageRouter = Parse.Router.extend({
    routes: {
      "all": "all"
    },

    initialize: function(options) {
    },

    all: function() {
      state.set({ filter: "all" });
    }
  });

  var state = new AppState;

  new PageRouter;
  var nextTimePlanView = new NextTimePlanView;
  Parse.history.start();
    
});