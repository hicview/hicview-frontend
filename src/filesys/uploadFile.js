function checkFileAPI() {
  if (window.File && window.FileReader && window.FileList && window.Blob) {
    reader = new FileReader();
    return true; 
  } else {
    alert('The File APIs are not fully supported by your browser. Fallback required.');
    return false;
  }
}

function readModel(filePath){
  let output = ""; //placeholder for text output
  if(filePath.files && filePath.files[0]) {           
    reader.onload = function (e) {
      output = e.target.result;
      displayContents(output);
    };//end onload()
    reader.readAsText(filePath.files[0]);
  }//end if html5 filelist support
}
