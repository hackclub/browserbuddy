document.getElementById("uploadForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById("fileInput");
    const outputDiv = document.getElementById("output");
    
    if (fileInput.files.length === 0) {
        outputDiv.textContent = "Please select a folder with a manifest file.";
        return;
    }
    
    // Find the manifest file in the uploaded folder
    const manifestFile = findManifestFile(fileInput.files);
    
    if (!manifestFile) {
        outputDiv.textContent = "Manifest file not found.";
        return;
    }
    
    // Get the folder path of the manifest file
    const folderPath = manifestFile.webkitRelativePath.replace("manifest.json", "");
    
    
    // Read the manifest file
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const manifestContent = event.target.result;
        try {
            const manifestData = JSON.parse(manifestContent);
            const name = manifestData.name;
            const version = manifestData.version;

            const logo = manifestData.logo;
            const logoFileName = logo.split('/')[1] // Update with the actual image filename
            // Load and display the image
            const logoPath = folderPath + logoFileName;
            const imageBlob = getFileBlob(logoPath, fileInput.files);
            const imageUrl = URL.createObjectURL(imageBlob);
            
            outputDiv.innerHTML = `
                <p>Name: ${name}</p>
                <p>Version: ${version}</p>
                <img src="${imageUrl}" alt="Logo">
            `;
        } catch (error) {
            outputDiv.textContent = "Error reading manifest file.";
        }
    };
    
    reader.readAsText(manifestFile);
});

function findManifestFile(files) {
    for (const file of files) {
        if (file.name === "manifest.json") {
            return file;
        }
    }
    return null;
}

function getFileBlob(filePath, fileList) {
    for (const file of fileList) {
        if (file.webkitRelativePath === filePath) {
            return file;
        }
    }
    return null;
}