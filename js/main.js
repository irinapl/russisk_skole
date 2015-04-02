
var EVENTS = ["fest", "fridag"];
var COUNT = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

moment.locale("ru");

function reverseSortBy(sortByFunction) {
  return function(left, right) {
    var l = sortByFunction(left);
    var r = sortByFunction(right);

    if (l === void 0) return -1;
    if (r === void 0) return 1;

    return l < r ? 1 : l > r ? -1 : 0;
  };
}

function getNextSaturday(){
    var saturdayIsDayOfWeek = 6;
    var date = new Date();
    date.setDate(date.getDate() + (saturdayIsDayOfWeek + 7 - date.getDay()) % 7);
    
    console.log ("next saturday: " + date)
    return date;
}

function formatDate(date){
    if(date == undefined || !(date instanceof Date)){
        return "Ugyldig dato: " + date;
    }
    //var dateFormatted = date.getDay() + ". " + MONTH_NAMES[date.getMonth()];
    var formattedDate = moment(date).format("DD. MMMM");
    
    if(formattedDate.indexOf("0") == 0){
        formattedDate = formattedDate.substring(1, formattedDate.length);
    }
    return formattedDate;
}

function showMessage(message){
 $("#message").append(message).show();
}

function showError(errorMassage){
 $("#error").append(errorMassage).show();
}


function parseInput(inputId, splitter){
    var allWords = $(inputId).val();
    var lines = allWords.split("\n");
    
    var result = [];
    for(i = 0; i < lines.length; i++){
        var word = lines[i].split(splitter)[1].trim();
        result[i] = word;
    }
    return result;
}

function populateLinkList(listId, collection){
         collection.fetch({
        
          success: function(collection) {
            var list = $(listId);
            collection.each(function(object) {
                var doneClass = object.get("done") ? "done" : "";
                var order = object.get("order");
                var link = object.get("link");
                var name = object.get("name");
                
                var rowDiv = "<div class='row " + doneClass + "'>" + order + ". " + "<a target='_blank' href='" + link + "'>" + name + "</a></div>";
                
                list.append(rowDiv);
            });
          },
          error: function(collection, error) {
            alert("Error: " + error.code + " " + error.message);
          }
        });
}