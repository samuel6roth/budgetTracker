let db;

//Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(e) {
   //Create object store called "pending" and set autoIncrement to true
  const db = e.target.result;
  db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(e) {
    console.log('success')
    db = e.target.result;

  //Check if app is online before reading from db
  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function(e) {
  console.log("Woops! " + e.target.errorCode);
};

const saveRecord = (record) => {
    console.log('Save record invoked');
  //Create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["pending"], "readwrite");

  //Access your pending object store
  const store = transaction.objectStore("pending");

  //Add record to your store with add method.
  store.add(record);
}

function checkDatabase() {
  console.log("check db invoked");
  //Open a transaction on your pending db
  let transaction = db.transaction(["pending"], "readwrite");
  //Access your pending object store
  const store = transaction.objectStore("pending");
  //Get all records from store and set to a variable
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(() => {
        //If successful, open a transaction on your pending db
        const transaction = db.transaction(["pending"], "readwrite");

        //Access your pending object store
        const store = transaction.objectStore("pending");

        //Clear all items in your store
        console.log("Clearing store");
        store.clear();
        console.log("Done clearing store");
      });
    }
  };
}

//Listen for app coming back online
window.addEventListener("online", checkDatabase);