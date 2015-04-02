$(function() {
  Parse.$ = jQuery;
  
   // This is the transient application state, not persisted on Parse
   var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all",
      allDataLoaded : false,
      weekplan: null,
      books: null,
      readingBooks: null,
      audioBooks : null,
      films: null,
      words: null
    }
  });

  
  var ExerciseView = Parse.View.extend({
      
    tagName:  "li",
    template: _.template($('#exercise-template').html()),
      
    events: {
      "click .editLink"   : "edit",
      "click .saveLink"   : "close",
      "click .cancelEditLink" : "cancel",
      "click .remove":  "remove"
    },

    initialize: function() {
       _.bindAll(this, 'edit', 'render', 'close', 'cancel', 'remove' );
       this.model.bind('change', this.render);
     },
      
    render: function() {
        
      this.inputs = this.$('.edit');
      
      var modelAsJson = this.model.toJSON();
      $(this.el).attr("id", this.model.id);
      $(this.el).html(this.template(modelAsJson));  
      
      this.delegateEvents();
      return this;
    },
      
    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
    },

    close: function() {
        this.model.set(
         { "book": $(this.el).find(".newBook").val(),
           "name": $(this.el).find(".newName").val(),
           "link": $(this.el).find(".newLink").val(),
           "text": $(this.el).find(".newText").val(),
           "from": $(this.el).find(".newFrom").val(),
           "to":   $(this.el).find(".newTo").val(),
         });
        
      this.model.saveChanges();
      $(this.el).removeClass("editing");
    },

    cancel: function() {
      $(this.el).removeClass("editing");
    },
    
    remove: function(e) {
      this.model.destroy();
      this.render();
    }
  });

    
    
  //======================================================================
  //         LessonView
  //======================================================================
    
  var LessonView = Parse.View.extend({

    el: "#classwork",
    addNewTemplate: _.template($('#add-exercise-template').html()),
    
    events: {
        "click #enablePageEdit" : "enablePageEdit",
        "click .addNew":          "createNew",
        "click .cancelNew":       "cancelNew",
        "change .selectNewType":  "loadContentForSelectNewType"        
    },
      
    initialize: function(planId, children) {
          var self = this;
        
          this.planId = planId;
          this.children = children;

          this.$el.html(_.template($("#lesson-template").html()));
          
          _.bindAll(this, 'addOne', 'addAll', 'render', 'enablePageEdit', "createNew", "loadContentForSelectNewType", "cancelNew");        
          
          this.exercises = new Exercises;
          this.exercises.bind('add',     this.addOne);
          this.exercises.bind('reset',   this.addAll);
          this.exercises.bind('all',     this.render);
        
          this.exercises.query = new Parse.Query(Exercise); 
          this.exercises.query.equalTo("planId", planId);
          this.exercises.query.equalTo("children", children);
          this.exercises.query.find({
                    success: function(results) {
                        self.exercises.reset(results);
                    },
                    error:   function(e) { self.reportError (e); } 
          });
          
          self.loadAllOtherData( function() { self.renderWeekPlan(); } );
    },
      
    reportError: function(error){
        var message = error ? error.message : "";
        $("#errorMessage").html("Feil oppstod: " + e.message);
        console.log(error);
    },
    
      
    loadAllOtherData: function(callback) {
        if (this.weekplan) {
          if (callback) callback();
        } else {
            
          var planId = state.get("planId");
          
          this.weekplan = new WeekPlan;  
          this.weekplan.query = new Parse.Query(WeekPlan);
          this.weekplan.query.get(planId, {
                        success: function(weekplan) {  if (callback) callback(weekplan);     },
                        error:   function(e) { self.reportError (e); } 
                    });
        }
    },
        
    loadContentForSelectNewType: function(e) {
      var selectedType = e.target.options[e.target.selectedIndex].value;
      if(selectedType == "-"){
        this.cancelNew(e); 
      }
      var lesson = e.target.getAttribute("data-lesson");
      
      console.log("selectedType = " + selectedType);
        
      var idPrefix = '#' + lesson + ' .newExercise';
      var dropdownWithListOfResources = $(idPrefix + " .newSelectName");
      dropdownWithListOfResources.html("");
      dropdownWithListOfResources.show();
        
      if(selectedType == "book"){
          
          var bookQuery = new Parse.Query(Book); 
          bookQuery.equalTo("children", state.get("children"));
          bookQuery.find({
                    success: function(results) {
                        
                        console.log(idPrefix + " .newSelectName");
                        
                        for (var i = 0; i < results.length; i++) { 
                            var book = results[i];
                            dropdownWithListOfResources.append('<option value="' + book.get("book") + '">' + book.get("book") + '</option>');
                        }
                        
                        $(idPrefix + " .newContent").show();
                        $(idPrefix + ' .actions').show();
                    }
            });
        
      }else if(selectedType == "readingbook"){
        
      }else if(selectedType == "film"){
          
          
          $(idPrefix + " .newContent").show();
          $(idPrefix + ' .actions').show();
        
      }else if(selectedType == "audiobook"){
        
          
          $(idPrefix + " .newContent").show();
          $(idPrefix + ' .actions').show();
      }else{
          dropdownWithListOfResources.hide();
          $(idPrefix + ' .actions').show();
      }
          
    },
    
    createNew: function(e) {
      var lesson = e.target.getAttribute("data-lesson");
        
      if(!this.planId || !this.children || !lesson){
      $("#errorMessage").html("Kan ikke legge til en oppgave. Noe mangler: planId = " + this.planId + ", barn=" + this.children + ", time=" + lesson);
          return;
      }
        
      var order = this.exercises.createOrderString(self.weekplan, lesson);

      this.exercises.create({
        planId: this.planId,
        children: this.children,
        order:   order,
        lesson:  lesson
      });
        
      //this.resetFilters();
    },
      
    cancelNew: function(e) {
          var lesson = e.target.getAttribute("data-lesson");

          console.log("cancelNew, lesson =" + lesson);
          $('#' + lesson + ' .newExercise .actions').hide();
          $('#' + lesson + ' .newExercise .newContent').hide();
          $('#' + lesson + ' .selectNewType option[value=""]').attr('selected','selected');
    },
      
    render: function() {
      $('.newExercise').hide();
      /*$('.newExercise .newContent').hide();
      $('.newExercise div.actions').hide();*/
      
      this.delegateEvents();
      return this;
    },
      
    enablePageEdit: function() {
      console.log("enableEditAll");
        
      $('#lesson1 .newExercise').html(this.addNewTemplate({ lesson: "lesson1" }));
      $('#lesson2 .newExercise').html(this.addNewTemplate({ lesson: "lesson2" }));
      $('#lesson3 .newExercise').html(this.addNewTemplate({ lesson: "lesson3" }));
      $('#homework .newExercise').html(this.addNewTemplate({ lesson: "homework" }));
      
      $('.newExercise .newContent').hide();
      $('.newExercise div.actions').hide();
      
      this.delegateEvents();
      return this;
    },
      
    // Add details about week plan (where, teacher, comments, ..)
    renderWeekPlan: function() {
          
      var children = state.get("children");
    
      var group = "Младшая";
      var teacherColumnName = "small_kids";
      if(children == "big"){
        group = "Старшая";
        teacherColumnName = "big_kids";
      }
      
      var asJson = this.weekplan.toJSON();
      
      $("#titleChildren").html(group + " группа");
      $("#nextTime").html(asJson["formattedDate"]);
      $("#nextTimeTeacher").html(this.weekplan.get(teacherColumnName));
      $("#nextTimeWhere").html(this.weekplan.get("where"));
      $("#nextTimeComments").html(this.weekplan.get("comments"));
        
    },
    
    // Add one exercise row to ona of the lessons or homework
    addOne: function(exercise) {
      var view = new ExerciseView( {model: exercise} );
      var renderedExercise = view.render().el;
        
      var exId = "#" + exercise.get("lesson");
      if(exercise.get("lesson") == "homework"){
        exId = "#homework";
      }
        
      this.$(exId + " .existing").append( renderedExercise );
      this.$(exId + " .actions").hide();
    },
    
    addAll: function(collection, filter) {
      this.exercises.each(this.addOne);
    }
  });
    
    
  //======================================================================
  //         LessonPageView (main view)
  //======================================================================
  
  var LessonPageView = Parse.View.extend({
    el: "#lessonPage",

    initialize: function() {
      state.on("change", this.render, this);
    },

    render: function() {
        var planId = state.get("planId");
        var children = state.get("children");
            
        new LessonView(planId, children);
    }
  });

  var LessonRouter = Parse.Router.extend({
    routes: {
      "all": "all",
      'small?id=:id' : 'lessonSmall',
      'big?id=:id' : 'lessonBig'
    },
    
    all: function() {
      state.set({ filter: "all" });
    },

    lessonSmall: function(planId) {
      state.set({ filter: "all", children: "small", planId: planId});
    },
      
    lessonBig: function(planId) {
      state.set({ filter: "all", children: "big", planId: planId});
    }
  });
  
    
    
  function loadAllWeNeed(){
      /*allDataLoaded : false;
      weekplan: null;
      books: null,
      readingBooks: null,
      audioBooks : null,
      films: null,
      words: null*/
      state.set("allDataLoaded", true);
      console.log("loadAllWeNeed: allDataLoaded=" + state.get("allDataLoaded"));
  }
    
    
  
    
  var state = new AppState;
     
  new LessonRouter;
  new LessonPageView;
    
  loadAllWeNeed();

  Parse.history.start();
    
});  
  