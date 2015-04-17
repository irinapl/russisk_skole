$(function() {
  Parse.$ = jQuery;
  
   // This is the transient application state, not persisted on Parse
   var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });
    
     
  var HomeworkView = Parse.View.extend({
      
    tagName:  "div",
    className: "homework-row",

    template: _.template($('#homework-template').html()),
      
    // The DOM events specific to an item.
    events: {
      "click .toggleDone"         : "toggleDone",
    },

    initialize: function() {
      _.bindAll(this, 'render', 'toggleDone');
      this.model.bind('change', this.render);
     },
      
    render: function() {
      
      var modelAsJson = this.model.toJSON();
           
      $(this.el).attr("id", this.model.id);
      $(this.el).html(this.template(modelAsJson));  
      
      //var checkBoxImage = jQuery("img.toggleDone:first").get(0);
        
      //console.log(checkBoxImage);
        
      if(this.model.isDoneBy(state.get("childName"))){
        $(this.el).addClass("done");
        //checkBoxImage.setAttribute("src", "css\\images\\unchecked.png");
      }else{
        $(this.el).removeClass("done");
        //checkBoxImage.setAttribute("src", "css\\images\\checked.png");
      }
        
      
        
      this.delegateEvents();
        
      return this;
    },
      
    // Switch this view into `"editing"` mode, displaying the input field.
    toggleDone: function(e) {
      var exerciseId = e.target.getAttribute("data-exerciseId");
      var doneBy = this.model.setDoneBy(state.get("childName"));
    }

  });

    
  var ManageHomeworkView = Parse.View.extend({

    el: ".content",
    
    initialize: function(planId) {
      
          var self = this;
          this.$el.html(_.template($("#homework-manage-template").html()));

          this.childName = state.get("childName");
          this.children = state.get("children");
        
          
          /*var weekplans = new WeekPlans;
          weekplans.query = new Parse.Query(WeekPlan);
          weekplans.fetch({
              success: function(collection) {
                  var pastLessons = collection.selectPastLessons();
                  var lastLessonId = pastLessons.last().id;
                  console.log("=================");
                  console.log(pastLessons.pluck("planId"));
              },
              error: function(collection, error) {
                // STOP HERE!!
              }
            });*/
        
            var exerciseQuery = new Parse.Query(Exercise);
            exerciseQuery.equalTo("lesson", "homework");
            exerciseQuery.equalTo("children", this.children);
            
            var planQuery = new Parse.Query(WeekPlan);
            planQuery.matchesKeyInQuery("objectId", "planId", exerciseQuery);
            planQuery.find({ 
              success: function(results) {
                  //console.log("*****************");
                  //console.log(results);
                  
                  for (var i = 0; i < results.length; i++) { 
                          var object = results[i];
                           //console.log(object.toJSON());
                        }
                  }
            });
        
        
          this.exercises = new Exercises;
        
          _.bindAll(this, 'addOne', 'addAll', 'render');        
          this.exercises.bind('add',     this.addOne);
          this.exercises.bind('reset',   this.addAll);
          this.exercises.bind('all',     this.render);
        
          
          this.exercises.query = new Parse.Query(Exercise);
          this.exercises.query.equalTo("planId", planId);
          this.exercises.query.equalTo("lesson", "homework");
          this.exercises.query.equalTo("children", this.children);
          this.exercises.query.find({
                    success: function(results) {
                        self.exercises.reset(results);
                    }
          });
        
          //state.on("change", this.filter, this);
      },
    
    render: function() {
       $("#childName").html( state.get("childName") ); 
       
       this.delegateEvents();
       return this;
    },
      
    addOne: function(exercise) {
    
      var view = new HomeworkView( {model: exercise} );
      var renderedData = view.render().el;
      $("#exercises-list").append( renderedData );
    },
      
    addAll: function(collection, filter) {
      this.exercises.each(this.addOne);
    }
  });
    
    
  // The main view for the app
  var HomeworkPageView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: "#homeworkStatus",

    initialize: function() {
      state.on("change", this.render, this);
        
      
        
      //TODO: get current homework ID
      this.planId = "HuprFWBDRy";
      
      this.render();
    },

    render: function() {
      new ManageHomeworkView(this.planId);
    }
  });

  var HomeworPageRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      'small?name=:name' : 'lessonSmall',
      'big?name=:name' : 'lessonBig'
    },

    all: function() {
      state.set({ filter: "all" });
    },
      
    lessonSmall: function(name) {
       var childName="";

       switch(name){
        case "william": childName = "Виллиам"; break;
        case "dina": childName = "Дина"; break;
        case "lillian": childName = "Лиллиан"; break;
       }
      state.set({ filter: "all", children: "small", childName: childName});
    },
      
    lessonBig: function(name) {
      var childName="";
      switch(name){
        case "marius": childName = "Мариус"; break;
        case "andre": childName = "Андрей"; break;
        case "lilja": childName = "Лилия"; break;
      }
      state.set({ filter: "all", children: "big", childName: childName});
    }
  });

  var state = new AppState;

  new HomeworPageRouter;
  new HomeworkPageView;
  Parse.history.start();
    
});  
    