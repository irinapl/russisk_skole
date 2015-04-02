$(function() {
  Parse.$ = jQuery;
  
   // This is the transient application state, not persisted on Parse
   var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });
    
     
  var WeekPlanView = Parse.View.extend({
      
    tagName:  "tr",

    template: _.template($('#weekplan-template').html()),
      
    // The DOM events specific to an item.
    events: {
      "click .editLink"   : "editPlan",
      "click .saveLink"   : "close",
      "click .cancelEditLink" : "cancel"
    },

    initialize: function() {
      _.bindAll(this, 'editPlan', 'render', 'close', 'cancel' );
      this.model.bind('change', this.render);
     },
      
    render: function() {
        
      this.inputs = this.$('.edit');
      
      var modelAsJson = this.model.toJSON();
      
      $(this.el).addClass(modelAsJson["formattedEvent"]);
      if(modelAsJson["isNextTime"] == true){
          $(this.el).addClass("nextLesson");          
      } else if(modelAsJson["isPast"] == true){
          $(this.el).addClass("done");          
      }
      $(this.el).attr("id", this.model.id);
      $(this.el).html(this.template(modelAsJson));  
      
      this.delegateEvents();
      return this;
    },
      
    // Switch this view into `"editing"` mode, displaying the input field.
    editPlan: function() {
      $(this.el).addClass("editing");
    },

    // Toggle the `"done"` state of the model.
    close: function() {
        
       this.model.set(
         { "where":      $(this.el).find(".newWhere").val(),
           "big_kids":   $(this.el).find(".newBig").val(),
           "small_kids": $(this.el).find(".newSmall").val(),
           "comments":   $(this.el).find(".newComments").val(),
           "event":      $(this.el).find(".newEvent").val()
         });
        
      this.model.saveChanges();
      $(this.el).removeClass("editing");
    },

    cancel: function() {
      $(this.el).removeClass("editing");
    } 
  });

    
  var ManageWeekPlanView = Parse.View.extend({

    statsTemplate: _.template($('#stats-template').html()),
    el: ".content",
    
    initialize: function() {
      
          var self = this;

          // Main weekplan management template
          this.$el.html(_.template($("#manage-weekplan-template").html()));

          this.weekplans = new WeekPlans;
          this.weekplans.query = new Parse.Query(WeekPlan);

          _.bindAll(this, 'addOne', 'addAll', 'render');        
          this.weekplans.bind('add',     this.addOne);
          this.weekplans.bind('reset',   this.addAll);
          this.weekplans.bind('all',     this.render);
        

          // Fetch all the todo items for this user
          this.weekplans.fetch();
          state.on("change", this.filter, this);
      },
    
    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      
      var Lena_small = this.weekplans.countByName("small_kids", "Lena").length;
      var Lena_big = this.weekplans.countByName("big_kids", "Lena").length;
    
        
      var Olga_small = this.weekplans.countByName("small_kids", "Olga").length;
      var Olga_big = this.weekplans.countByName("big_kids", "Olga").length;
     
        
      var Ira_small = this.weekplans.countByName("small_kids", "Ira").length;
      var Ira_big = this.weekplans.countByName("big_kids", "Ira").length;
     
      this.$('#lesson_count').html(this.statsTemplate({
        Lena_totale: Lena_small + Lena_big,
        Lena_small: Lena_small,
        Lena_big:   Lena_big,
        Olga_totale: Olga_small + Olga_big,
        Olga_small: Olga_small,
        Olga_big:   Olga_big,
        Ira_totale:  Ira_small + Ira_big,
        Ira_small:  Ira_small,
        Ira_big:    Ira_big
      }));
        
     this.delegateEvents();
     return this;
    },
      
    addOne: function(weekplan) {
        console.log("addOne");
        
      var view = new WeekPlanView( {model: weekplan} );
      var renderedData = view.render().el;
      this.$("#weekplan-list").append( renderedData );
    },
      
    addAll: function(collection, filter) {
        
      console.log("ADD ALL");
      this.weekplans.each(this.addOne);
    }
  });
    
    
  // The main view for the app
  var PlanPageView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: "#planPage",

    initialize: function() {
      this.render();
    },

    render: function() {
      new ManageWeekPlanView();
    }
  });

  var PlanPageRouter = Parse.Router.extend({
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

  new PlanPageRouter;
  new PlanPageView;
  Parse.history.start();
    
});  
    

    







