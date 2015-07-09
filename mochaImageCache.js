(function() {
    var db;

    function getBase64Image(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        img.appendChild(canvas);
        var context = canvas.getContext('2d');
        context.drawImage(img, 0, 0 );
        var dataURL = canvas.toDataURL("image/png");
        return dataURL;
    }

    function saveImgLocally(imgObj) {
        addImage(imgObj);
    }

    function openDb() {
        window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        if (!window.indexedDB) {
            console.log("Your Browser does not support IndexedDB");
        }
        var openRequest = indexedDB.open("imgStoreDb", 1);

        openRequest.onupgradeneeded = function(e) {
            var thisDB = e.target.result;
            if (!thisDB.objectStoreNames.contains("imgStoreTbl")) {
                thisDB.createObjectStore("imgStoreTbl", {
                    autoIncrement: true
                });
            }
        }

        openRequest.onsuccess = function(e) {
            db = e.target.result;
            var imgs = document.getElementsByTagName("img");
            for (var i = 0; i < imgs.length; i++) {
                checkImgExist(imgs[i]);
            }
        }

        openRequest.onerror = function(e) {
            console.log(e);
        }
    }

    function addImage(imgObj) {
        var imgData = getBase64Image(imgObj);
        var store = db.transaction(["imgStoreTbl"], "readwrite").objectStore("imgStoreTbl");

        var imgDataToInsert = {
            imgData: imgData
        }
        var request = store.add(imgDataToInsert, imgObj.src);

        request.onerror = function(e) {
            console.log("Error", e.target.error.name);
        }

        request.onsuccess = function(e) {
            console.log("success");
        }
    }

    function checkImgExist(imgObj) {
        var transaction = db.transaction(["imgStoreTbl"]);
        var objectStore = transaction.objectStore("imgStoreTbl");
        var request = objectStore.get(imgObj.src);

        request.onerror = function(event) {
            console.log(event);
        };
        request.onsuccess = function(event) {
            if (request.result) {
                imgObj.src = request.result.imgData;
            } else {
                imgObj.addEventListener('load', function(e) {
                    saveImgLocally(this);
                });
            }
        };
    }

    function saveAllImg() {
        openDb();
    }


    document.addEventListener("DOMContentLoaded", function(event) {
        saveAllImg();
    });
}());
