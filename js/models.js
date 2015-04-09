
    
//========================== WEEK PLAN ===============================
    
  var WeekPlan = Parse.Object.extend("WeekPlan", {
      saveChanges: function() {
          this.save({
              comments: this.get("comments"),
              small_kids: this.get("small_kids"),
              big_kids: this.get("big_kids"),
              where: this.get("where"),
              event: this.get("event")
          });
      },
      
      isNextTime: function() {
        var today = moment(new Date());
        today.hour(10);
        today.minute(0);
        var rowDate = moment(this.get("date"));
        var daysDiff = rowDate.diff(today, 'days');
        var lessThanAweek = daysDiff >= 0 && daysDiff < 7;
        return lessThanAweek;
      },
      
      isPast: function() {
        var today = moment(new Date());
        var rowDate = moment(this.get("date"));
        return moment(rowDate).isBefore(today);
      },
      
      isInTheFuture: function(){
        return moment(this.get('date')).isAfter( new Date());;
      },
      
      toJSON: function () {
          var realAttr = _.clone(this.attributes);
          
          var eventClassStyle = "";
          var event = this.get("event");
          if(event != undefined){
            eventClassStyle = event.toLowerCase();
          }
          
          var updatedModel = {  data: realAttr,
                                planId: this.id, 
                                formattedDate: formatDate(this.get("date")),
                                formattedEvent: eventClassStyle,
                                isNextTime: this.isNextTime(),
                                isPast: this.isPast()
                           };
          return updatedModel;
      }
  });
  
  var WeekPlans = Parse.Collection.extend({

        model: WeekPlan,

        render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
      
        countByName: function(kidsClass, teachersName) {
            return this.filter( function(weekplan){
                if (weekplan.get(kidsClass) != undefined){
                    teachersName = teachersName.toLowerCase();
                    var nameMatch = weekplan.get(kidsClass).toLowerCase() == teachersName;
                    return nameMatch;
                }
                return false;
            });
        },
       
        getNextTime: function() {
            var nextTimeAsArray = this.filter( function(weekplan){
                                    return weekplan.isNextTime(); 
                                });
            if(nextTimeAsArray.length > 0){
                return nextTimeAsArray[0];
            }
            return null;
        },
      
        remaining: function() {
          return this.filter(function(weekplan){
                                return moment(weekplan.get('date')).isAfter( new Date()); 
                            });
        },
      
        comparator: function(weekplan) {
            return weekplan.get('date');
        }
    });
    

 //===================== AUDIO BOOKS ====================================

 var AudioBook = Parse.Object.extend("AudioBooks", {
        saveChanges: function() {
          this.save({
              name: this.get("name"),
              link: this.get("link"),
              order: this.get("order")
          });
        }
    });
    
  var AudioBooks = Parse.Collection.extend({

       model: AudioBook,

       render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
      
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },
      
        comparator: function(audiobook) {
            return audiobook.get('order');
        }
    });

//===================== READING BOOKS ====================================

 var ReadingBook = Parse.Object.extend("ReadingBooks", {
        saveChanges: function() {
          this.save({
              
          });
        }
    });
    
  var ReadingBooks = Parse.Collection.extend({

       model: ReadingBook,

       render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
      
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },
      
        getForChildren: function(childrenVar) {
          return this.filter(function(book){
                                return book.get('children') == childrenVar; 
                            });
        },
      
        comparator: function(book) {
            return book.get('order');
        }
    });

//===================== MOVIES ====================================

 var Movie = Parse.Object.extend("Movies");
    
 var Movies = Parse.Collection.extend({

       model: Movie,

       render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
      
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },
      
        comparator: function(audiobook) {
            return audiobook.get('order');
        }
    });

//===================== MOST COMMON WORDS ====================================

 var CommonWord = Parse.Object.extend("MostCommonWords");
    
 var CommonWords = Parse.Collection.extend({

       model: CommonWord,

       render: function() {
          var jsonrow = this.model.toJSON();
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },
      
        nextOrder: function() {
            if (!this.length) return 1;
            return this.last().get('order') + 1;
        },
      
        comparator: function(audiobook) {
            return audiobook.get('order');
        }
 });
    

//========================== Exercise books ===============================
    
 
  var Book = Parse.Object.extend("Books", {
      
      defaults: {
          lastUsed: "",
          unit: "side",
          countInClass: "",
          countHomework: ""
      },
      
      saveChanges: function() {
          this.save({
              book: this.get("name"),
              unit: this.get("unit"),
              lastUsed: this.get("lastUsed"),
              countHomework: this.get("countHomework"),
              countAtClass: this.get("countAtClass")
          });
      },
      
      getNextClassTasks: function() {
        var lastUsed = parseInt(this.get("lastUsed"));
        var countInClass = parseInt(this.get("countInClass"));
        return lastUsed + countInClass;
      },
      
      getNextHomework: function() {
        var lastUsed = parseInt(this.get("lastUsed"));
        var countHomework = parseInt(this.get("countHomework"));
        return lastUsed + countHomework;
      },
      
      
      getDetailsForEditView: function(){
          var lastUsed = parseInt(this.get("lastUsed"));
          var from = lastUsed + 1;
          var toForClasswork = lastUsed + this.get("countInClass");
          var toForHomework = lastUsed + this.get("countHomework");
          
          return {from : from, toForClasswork : toForClasswork, toForHomework : toForHomework, unit : this.get("unit")};
      },
    
      
      toJSON: function () {
          
          var json = Parse.Object.prototype.toJSON.call(this);
          
          if (!json["lastUsed"]) {
            json["lastUsed"] = this.defaults.lastUsed;
          }
          if (!json["unit"]) {
            json["unit"] = this.defaults.unit;
          }
          if (!json["countInClass"]) {
            json["countInClass"] = this.defaults.countInClass;
          }
          if (!json["countHomework"]) {
            json["countHomework"] = this.defaults.countHomework;
          }
          
          var lastUsed = parseInt(this.get("lastUsed"));
          var _from = lastUsed + 1;
          var _toForClasswork = lastUsed + this.get("countInClass");
          var _toForHomework = lastUsed + this.get("countHomework");
          
          json["_from"] = _from;
          json["_toForClasswork"] = _toForClasswork;
          json["_toForHomework"] = _toForHomework;
          
          return json;
      }
  });
  
  var Books = Parse.Collection.extend({

        model: Book,

        render: function() {
          $(this.el).html(this.template(this.model.toJSON()));
          return this;
        },

        comparator: function(book) {
            return book.get('order');
        }
    });


//========================== Exercise / lessons ===============================
    
 
  var Exercise = Parse.Object.extend("Exercise", {
      
      defaults: {
          type: "book",
          text: "",
          from: "",
          to: ""
      },
      
      saveChanges: function() {
          this.save({
              book: this.get("book"),
              name: this.get("name"),
              link: this.get("link"),
              text: this.get("text"),
              from: this.get("from"),
              to: this.get("to")
          });
      },
      
      toJSON: function () {
          
          var json = Parse.Object.prototype.toJSON.call(this);
          
          if (!json["from"]) {
            json["from"] = this.defaults.from;
          }
          if (!json["to"]) {
            json["to"] = this.defaults.to;
          }
          if (!json["text"]) {
            json["text"] = this.defaults.text;
          }
          if (!json["name"]) {
            json["name"] = this.defaults.name;
          }
          if (!json["link"]) {
            json["link"] = this.defaults.link;
          }
          return json;
      }
  });
  
  var Exercises = Parse.Collection.extend({

        model: Exercise,

        render: function() {
          console.log("Exercises render ");
          $(this.el).html(this.template(this.model.toJSON()));
            
          console.log("Exercises render: done ");
          return this;
        },
      
        createOrderString: function(weekPlanDate, lesson) {            
            var weekNumber = moment(weekPlanDate).week();
            var year = moment(weekPlanDate).year();
            return weekNumber + "_" + year + "_" + lesson;
        },

        comparator: function(book) {
            return book.get('order');
        }
    });
