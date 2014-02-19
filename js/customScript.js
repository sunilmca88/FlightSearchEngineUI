

function showProducts(minPrice, maxPrice) {
	  $("#searchResult #flights").hide().filter(function() {
        var price = parseInt($(this).data("price"), 10);
        return price >= minPrice && price <= maxPrice;
    }).show();
}

$(function() {
    var options = {
        range: true,
        min: 1000,
        max: 10000,
        values: [1000, 10000],
        slide: function(event, ui) {
            var min = ui.values[0],
                max = ui.values[1];

            $( "#amount" ).val( "Rs " + min + " - Rs " + max);
            showProducts(min, max);
        }
    }, min, max;

    $("#slider-range").slider(options);

    min = $("#slider-range").slider("values", 0);
    max = $("#slider-range").slider("values", 1);
 	$( "#amount" ).val( "Rs " + $( "#slider-range" ).slider( "values", 0 ) +
      " - Rs " + $( "#slider-range" ).slider( "values", 1 ) );	  

    showProducts(min, max);
})

 //Following funtion handles the selection of tabs
$( "#tabs" ).tabs({
	 activate: function( event, ui ) {
		 	 $("input[id*='City']" ).val('');
		 }
});


$('#srcCity').attr('value', ""); 
$('#destCity').attr('value', ""); 
$('#retSrcCity').attr('value', ""); 
$('#retDestCity').attr('value', ""); 
$('#to').attr('value', ""); 
$('#oneWayFrom').attr('value', ""); 
$('#returnFrom').attr('value', ""); 
 
//Script to load JSON file starts here
  var json = (function() {
        var json = null;
        $.ajax({
			'cache':false,
            'async': false,
            'global': false,
            'url': "./json/flightsearch.json",
            'dataType': "json",
            'success': function (data) {
                json = data;
            }
        });
        return json;
    })();
//Script to load JSON file ends here	

//Script for Autocomplete starts here
	var airportArray = new Array();
	for(var i=0; i<json.flight.ap.length;i++){
		airportArray[i] = json.flight.ap[i].city + "-"+json.flight.ap[i].code;
	}
	$(function() {
		$( "input[id*='City']" ).autocomplete({
			source: airportArray,
			minLength: 2,
			change: function (event, ui) {
				if (!ui.item) {
					this.value = '';
					this.style.borderColor="#FF0000";		
				}else{
					this.style.borderColor="#CCC";		
				}
			},
		});
	  });
////Script for Autocomplete ends here

//Script to search for flights from JSON
	function getFlightDetail(calledFrom){
		if(validateSearchForm(calledFrom)){
			getJourneyDetails(calledFrom);
			var data = new Object();
			var oneWayOriginCity = $('#srcCity').val().split('-')[1];
			var retOriginCity = $('#retSrcCity').val().split('-')[1];
			var oneWayDestCity = $('#destCity').val().split('-')[1];
			var retDestCity = $('#retDestCity').val().split('-')[1];
			var adults = $('#oneWayAdultCount').val();
			var childs=  $('#oneWayChildCount').val();
			var infants = $('#oneWayInfantCount').val(); 
					
			for (var key in json.flight.from) {
			   if(key == oneWayOriginCity || key == retOriginCity)
			   {
					data.key = json.flight.from[key];
					for(var i=0; i<data.key.length; i++){
						if(data.key[i].to == oneWayDestCity || data.key[i].to == retDestCity){
							data.key[i].dest = true;
							data.key[i].afare = (data.key[i].afare * adults)+(data.key[i].cfare * childs)+(data.key[i].ifare * infants);
							calledFrom == "oneWay" ? data.key[i].ret = false :data.key[i].ret = true;
						}else{
							data.key[i].dest = false;
							data.key[i].ret = false;
					   }
				   }
					data.from = key;
			   }		  
			}
			var template, html, output;
			template = $('#template').html();
			output = Mustache.render(template, data);
			$('#searchResult').empty();
			$('#searchResult').append(output);
			
		}else{
			alert("Please correct the search details");
		}
	}
//Flight search ends here

//Script to validate Search form starts here
function validateSearchForm(calledFrom){
	if(calledFrom == "oneWay"){
		if($('#srcCity').val() == "" || $('#destCity').val() == ""){	
			$('#srcCity').val() == "" ? $('#srcCity').css('border-color','#FF0000'):$('#destCity').css('border-color','#FF0000'); 
			alert("Source and Destination city should not be empty");
		}else if($('#srcCity').val() == $('#destCity').val()){
				$('#srcCity').css('border-color','#FF0000');
				$('#destCity').css('border-color','#FF0000');
				$('#srcCity').value = "";
				$('#destCity').value = "";
				alert("Source and Destination city should be different");				
		}else if($('#oneWayFrom').val() == ""){
			$('#oneWayFrom').css('border-color','#FF0000');
			$('#oneWayFrom').value = "";
			alert("Please select journey date");
		}else{
			$('#srcCity').css('border-color','#CCC');
			$('#destCity').css('border-color','#CCC');
			$('#oneWayFrom').css('border-color','#CCC');
			return true;
		}
	}
	if(calledFrom == "roundTrip"){
		if($('#retSrcCity').val() == $('#retDestCity').val()){
			if($('#retSrcCity').val() == "" || $('#retDestCity').val() == ""){
				alert("Source and Destination city should not be empty");				
			}else{
				$('#retDestCity').css('border-color','#FF0000');
				$('#retDestCity').css('border-color','#FF0000');
				$('#retDestCity').value = "";
				$('#retDestCity').value = "";
				alert("Source and Destination city should be different");
			}
		}else if($('#returnFrom').val() == ""){
			$('#returnFrom').css('border-color','#FF0000');
			$('#returnFrom').value = "";
			alert("Please select journey date");
		}else if( $('#to').val() == ""){
			$('#to').css('border-color','#FF0000');
			$('#to').value = "";
			alert("Please select journey date");
		}else{
			$('#retDestCity').css('border-color','#CCC');
			$('#retDestCity').css('border-color','#CCC');
			$('#to').css('border-color','#CCC');
			$('#returnFrom').css('border-color','#CCC');
			return true;
		}
	}	
}
//Script to validate Search form ends here

//Script to fill Route and journey date details starts here
function getJourneyDetails(calledFrom){
	if(calledFrom == "oneWay"){
			$('#journeyRoute').empty();
			$('#journeyRoute').append($('#srcCity').val().split('-')[0] +" > "+ $('#destCity').val().split('-')[0] );
			
			$('#returnDate').empty();
			$('#returnDate').append( "<strong>Arrive : </strong>"+ $('#oneWayFrom').val()+"</span>");
			$('#departDate').empty();
			$('#departDate').append( "<strong>Depart : </strong>"+ $('#oneWayFrom').val()+"</span>");
			
			
		}else if(calledFrom == "roundTrip"){
			$('#journeyRoute').empty();
			$('#journeyRoute').append($('#retSrcCity').val().split('-')[0] +" > "+ $('#retDestCity').val().split('-')[0] +" > "+ $('#retSrcCity').val().split('-')[0] );
			
			$('#returnDate').empty();
			$('#returnDate').append( "<strong>Return : </strong>"+ $('#to').val()+"</span>");
			$('#departDate').empty();
			$('#departDate').append( "<strong>Depart : </strong>"+ $('#returnFrom').val()+"</span>");
		}else{
			$('#journeyRoute').empty();
			$('#returnDate').empty();
			$('#departDate').empty();
		}
}
//Script to fill Route and journey date details ends here

	
//Departure and return date script  
  $(function() {
    $(  "input[id*='From']" ).datepicker({
     // defaultDate: "+1w",
	  dateFormat: "dd-M-yy",
      changeMonth: true,
	  changeYear: true,
	  minDate: 0,
      numberOfMonths: 1,
      onClose: function( selectedDate, inst ) {
        $( "#to" ).datepicker( "option", "minDate", selectedDate );
        $( this ).datepicker( "option", 'dateFormat', 'dd-M-yy' );
      }
    });
    $( "#to" ).datepicker({
     // defaultDate: "+1w",
      changeMonth: true,
  	  dateFormat: "dd-M-yy",
  	  changeYear: true,
      numberOfMonths: 1,
      onClose: function( selectedDate, inst ) {
        $( "#from" ).datepicker( "option", "maxDate", selectedDate );
		$(this).datepicker( "option", 'dateFormat', 'dd-M-yy' );
      }
    });
  });
  
