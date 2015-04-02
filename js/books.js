$(function() {
  Parse.$ = jQuery;
  
   // This is the transient application state, not persisted on Parse
   var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });
    
     
  var BookView = Parse.View.extend({
      
    tagName:  "tr",

    template: _.template($('#book-template').html()),
      
    // The DOM events specific to an item.
    events: {
      "click .editLink"         : "edit",
      "click .saveLink"         : "close",
      "click .cancelEditLink"   : "cancel"
    },

    initialize: function() {
      _.bindAll(this, 'edit', 'render', 'close', 'cancel' );
      this.model.bind('change', this.render);
     },
      
    render: function() {
        
      this.inputs = this.$('.edit');
      
      var modelAsJson = this.model.toJSON();
      $(this.el).addClass(modelAsJson["children"]);
        
      $(this.el).attr("id", this.model.id);
      $(this.el).html(this.template(modelAsJson));  
      
      this.delegateEvents();
      return this;
    },
      
    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
      $(this.el).addClass("editing");
    },

    // Toggle the `"done"` state of the model.
    close: function() {
        
       this.model.set(
         { "book":      $(this.el).find(".newBook").val(),
           "unit":   $(this.el).find(".newUnit").val(),
           "lastUsed":      $(this.el).find(".newLastUsed").val(),
           "countInClass": parseInt($(this.el).find(".newCountInClass").val()),
           "countHomework":   parseInt($(this.el).find(".newCountHomework").val())
         });
        
      this.model.saveChanges();
      $(this.el).removeClass("editing");
    },

    cancel: function() {
      $(this.el).removeClass("editing");
    } 
  });

    
  var ManageBookView = Parse.View.extend({

    el: ".content",
    
    initialize: function() {
      
          var self = this;
          this.$el.html(_.template($("#manage-books-template").html()));

          this.books = new Books;
          this.books.query = new Parse.Query(Book);

          _.bindAll(this, 'addOne', 'addAll', 'render');        
          this.books.bind('add',     this.addOne);
          this.books.bind('reset',   this.addAll);
          this.books.bind('all',     this.render);
        

          // Fetch all the todo items for this user
          this.books.fetch();
          state.on("change", this.filter, this);
      },
    
    render: function() {
       this.delegateEvents();
       return this;
    },
      
    addOne: function(book) {
      var view = new BookView( {model: book} );
      var renderedData = view.render().el;
      this.$("#book-list").append( renderedData );
    },
      
    addAll: function(collection, filter) {
      this.books.each(this.addOne);
    }
  });
    
    
  // The main view for the app
  var BookPageView = Parse.View.extend({
    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: "#bokPage",

    initialize: function() {
      this.render();
    },

    render: function() {
      new ManageBookView();
    }
  });

  var BokPageRouter = Parse.Router.extend({
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

  new BokPageRouter;
  new BookPageView;
  Parse.history.start();
    
});  
    

    







