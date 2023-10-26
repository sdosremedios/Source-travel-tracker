// submit form data
var formData = new FormData($('#formElement'));
$.ajax({
    url: "create_entity.php",
    data: formData,
    processData: false,
    contentType: false,
    type: 'POST',
    success: function(data) {
          var response = jQuery.parseJSON(data);
          if(response.code == "success") {
              alert("Success!");
          } else if(response.code == "failure") {
              alert(response.err);
          }
      }
  });
