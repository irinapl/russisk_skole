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
        "click #enableEditAll" : "enablePageEdit",
        "click #closeEditAll" : "closeEditAll",
        "click .addNew":          "createNew",
        "click .cancelNew":       "cancelNew",
        "change .selectNewType":  "loadContentForSelectNewType"
        
    },
      
    initialize: function(planId, children) {
          var self = this;
        
          this.planId = planId;
          this.children = children;

          this.$el.html(_.template($("#lesson-template").html()));
          
          _.bindAll(this, 'addOne', 'addAll', 'render', 'enablePageEdit', 'closeEditAll', "createNew", "loadContentForSelectNewType", "cancelNew");        
          
          self._loadWeekPlan(function() { self.renderWeekPlan(); });
          self._loadAllOtherData();
        
          this.exercises = new Exercises;
          this.exercises.bind('add',     this.addOne);
          this.exercises.bind('reset',   this.addAll);
          this.exercises.bind('all',     this.render);
        
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
                    }
          });
    },
      
     _loadWeekPlan: function(callback) {
        if (this.weekplan) {
          if (callback) callback();
        } else {
            
          var planId = state.get("planId");
          
          this.weekplan = new WeekPlan;  
          this.weekplan.query = new Parse.Query(WeekPlan);
          this.weekplan.query.get(planId, {
                        success: function(weekplan) { 
                            self.weekplan = weekplan; if (callback) callback();   
                        }
                    });
        }
    },
      
    _loadAllOtherData: function() {
        this._loadBooks();
        this._loadReadingBooks();
        this._loadAudioBooks();
        this._loadFilms();
    },
      
    _loadBooks: function() {
        var bookQuery = new Parse.Query(Book); 
        bookQuery.equalTo("children", state.get("children"));
        bookQuery.find({
                    success: function(results) {
                        var collection = new Books;
                        self.books = collection.reset(results);
                    }
            });
    },
    
    _loadReadingBooks: function() {
        var query = new Parse.Query(ReadingBook); 
        query.equalTo("children", state.get("children"));
        query.notEqualTo("done", true);
        query.find({
                    success: function(results) {
                        var collection = new ReadingBooks;
                        self.readingbooks = collection.reset(results);
                    }
            });
    },
    _loadAudioBooks: function() {
        var query = new Parse.Query(AudioBook); 
        query.notEqualTo("done", true);
        query.find({
                    success: function(results) {
                        var collection = new AudioBooks;
                        self.audiobooks = collection.reset(results);
                    }
            });
    },
    _loadFilms: function() {
        var query = new Parse.Query(Movie); 
        query.notEqualTo("done", true);
        query.find({
                    success: function(results) {
                        var collection = new Movies;
                        self.movies = collection.reset(results);
                    }
            });
    },
      
      
    loadContentForSelectNewType: function(e) {
          var selectedType = e.target.options[e.target.selectedIndex].value;
          if(selectedType == null || selectedType == "-"){
                this.cancelNew(e); 
          }
        
          var lesson = e.target.getAttribute("data-lesson");
          var resourceDetails = {to: null, from: null, unit: null, link: null, resourceList: null};
        
        
          var isResource = selectedType != "freetext";
          if(isResource){
              
              resourceDetails.resourceList = self[selectedType].toJSON();
              var firstSelectedOption = self[selectedType].first()

              if(firstSelectedOption.get("link") != undefined){
                  resourceDetails.link = firstSelectedOption.get("link");
              }
              
              if(selectedType == "books"){
                  var lastUsed = parseInt(firstSelectedOption.get("lastUsed"));
                  resourceDetails.from = lastUsed + 1;
                  resourceDetails.to = lastUsed+ firstSelectedOption.get("countInClass");
                  resourceDetails.unit = firstSelectedOption.get("unit");
              }
          }
        
          
          var viewData = { lesson: lesson, selectedType:selectedType, details: resourceDetails };
          console.log(viewData);
          $('#' + lesson + ' .newExercise').html(this.addNewTemplate(viewData));
    },
    
      
    updateNewResourceDetails: function(e){
        
          //$('#' + lesson + ' .newSelectName').
        
          resourceDetails.resourceList = self[selectedType].toJSON();
          var firstSelectedOption = self[selectedType].first()

          if(firstSelectedOption.get("link") != undefined){
              resourceDetails.link = firstSelectedOption.get("link");
          }

          if(selectedType == "books"){
              var lastUsed = parseInt(firstSelectedOption.get("lastUsed"));
              resourceDetails.from = lastUsed + 1;
              resourceDetails.to = lastUsed+ firstSelectedOption.get("countInClass");
              resourceDetails.unit = firstSelectedOption.get("unit");
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
      $('#' + lesson + ' .selectNewType option[value=""]').attr('selected','selected');
    },
      
    render: function() {
         this.delegateEvents();
         return this;
    },
      
    enablePageEdit: function() {
      $('#enableEditAll').hide();
      $('#closeEditAll').show();
      $('.newExercise').show();
      $('.existing div.actions').show();
        
      this.delegateEvents();
      return this;
    },
      
    closeEditAll: function() {
      $('.newExercise').hide();
      $('.existing div.actions').hide();
      $('#closeEditAll').hide();
      $('#enableEditAll').show();
    },
      
    // Add details about week plan (where, teacher, comments, ..)
    renderWeekPlan: function() {
      var weekPlanTemplate = _.template($("#weekplan-template").html());
      $("#nextTimeDetails").html(weekPlanTemplate({ children: state.get("children") ,weekplan: weekplan.toJSON()} ));
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
    },
    
    addAll: function(collection, filter) {
      $('#enableEditAll').show();
      $('#closeEditAll').hide();
      //$('.newExercise').hide();
      //$('div.actions').hide();
        
      $('#lesson1 .newExercise').html(this.addNewTemplate({ lesson: "lesson1", selectedType: null, details : null }));
      $('#lesson2 .newExercise').html(this.addNewTemplate({ lesson: "lesson2", selectedType: null, details: null }));
      $('#lesson3 .newExercise').html(this.addNewTemplate({ lesson: "lesson3", selectedType: null, details: null }));
      $('#homework .newExercise').html(this.addNewTemplate({ lesson: "homework", selectedType: null, details: null }));
        
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
        new LessonView(state.get("planId"), state.get("children"));
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
  
  var state = new AppState;
     
  new LessonRouter;
  new LessonPageView;
  Parse.history.start();
    
});  
  