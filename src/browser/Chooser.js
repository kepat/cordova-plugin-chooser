module.exports = (function() {

    function getFileInternal (
        accept,
        includeData,
        successCallback,
        failureCallback
    ) {
        if (typeof accept === 'function') {
            failureCallback = successCallback;
            successCallback = accept;
            accept = undefined;
        }
    
        var result = new Promise(function (resolve, reject) {
            // Prepare the temporary html input
            const element = document.createElement('input');
            element.style.display = 'none';
            element.type = 'file';``
            element.accept = accept;

            // Selecting file function
            function selectFile(event) {
                // Remove the listener
                element.removeEventListener('change', selectFile);

                // Get the first selected file
                const file = event.target.files[0]; 

                // Process the selected file
                if (file) {
                    // Read the file
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = function (event) {

                        // Check if to include data
                        let base64;
                        if (includeData) {
                            base64 = event.target.result;
                        }

                        // Prepare the output
                        let data = {
                            "data": base64,
                            "mediaType": file.type,
                            "name": file.name,
                            "uri": {
                                "name": file.name,
                                "data": base64
                            }
                        }

                        // Return to the user
                        resolve(data);
                    };
                } else {
                    // Return null file to the user
                    reject("File URI was null.");
                }
            }

            // Add an event to detect the selection
            element.addEventListener('change', selectFile);

            // Cancel event
            function cancelFile() {
                // Remove the listener
                element.removeEventListener('cancel', cancelFile);

                // Inform user
                resolve("RESULT_CANCELED");
            }

            // Add an event to detect the cancellaton of selection
            element.addEventListener('cancel', cancelFile);

            // Append to the main body
            document.body.appendChild(element);

            // Trigger the file input selection
            element.click();

            // Remove the temporary html input
            element.remove();
        });
    
        if (typeof successCallback === 'function') {
            result.then(successCallback);
        }
        if (typeof failureCallback === 'function') {
            result.catch(failureCallback);
        }
    
        return result;
    }

    return {
        getFile: function (accept, successCallback, failureCallback) {
            return getFileInternal(accept, true, successCallback, failureCallback);
        },
        getFileMetadata: function (accept, successCallback, failureCallback) {
            return getFileInternal(accept, false, successCallback, failureCallback);
        }
    }
})();