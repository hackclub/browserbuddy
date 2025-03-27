Dropzone.options.uploadForm = {
    init: function() {
      this.on("success", function(file, response) {
        // Handle successful upload
        console.log("Upload success:", response);
        if (response.manifestContent) {
          console.log("Manifest Content:", response.manifestContent);
        } else {
          console.log("manifest.json not found in the selected folder.");
        }
      });

      this.on("error", function(file, errorMessage) {
        console.error("Upload error:", errorMessage);
      });
    }
  };