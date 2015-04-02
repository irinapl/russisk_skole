
$(function() {
  Parse.$ = jQuery;
   
  moment.locale("nb");
      
  
    
  var AudioBook = Parse.Object.extend("AudioBooks", {
        saveChanges: function() {
          this.save({
              link: this.get("link"),
              order: this.get("order")
          });
        }
  });
    
    
  var AudioBooks = Parse.Collection.extend({

        // Reference to this collection's model.
       model: AudioBook,

       // Re-render the contents of the todo item.
        render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
        
        comparator: function(audiobook) {
            return weekplan.get('order');
        }
    });
   
});  