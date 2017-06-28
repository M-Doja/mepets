var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];

  uploadFile = function() {
    var sFileName = $("#nameImg").val();
    // ALERT PHOTO IS REQUIRED TO SAVE DATA IF NOT INCLUDED
    if (sFileName === '') {
      alert("Please include an image to upload and save.");
    }
    if (sFileName.length > 0) {
      var blnValid = false;
      for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
          blnValid = true;
          var filesSelected = document.getElementById("nameImg").files;
          if (filesSelected.length > 0) {
            var fileToLoad = filesSelected[0];

            var fileReader = new FileReader();

            fileReader.onload = function(fileLoadedEvent) {
              var textAreaFileContents = document.getElementById("textAreaFileContents");
              var submitDate = new Date();

              User.save({
                date: submitDate,
                base64: fileLoadedEvent.target.result
              });
              $("#nameImg").val('')
            };
            fileReader.readAsDataURL(fileToLoad);
          }
          break;
        }
      }

      if (!blnValid) {
        alert('File is not valid');
        return false;
      }
    }

    return true;
  }
