let db;

// create database with name MyDB
const request = indexedDB.open("MyDB", 1);
// create schema 
request.onupgradeneeded = function (event) {
  db = event.target.result;
  const store = db.createObjectStore("users", { keyPath: "id" });
  store.createIndex("name", "name", { unique: false });
};
//perform task
// create , read, update, delete
request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Database opened");

  // Optional: clear previous data (testing only!)
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").clear();

  tx.oncomplete = () => {
    addUser({ id: 1, name: "Alice" });
    addUser({ id: 2, name: "Sarthak" });
    addUser({ id: 3, name: "Mohan" });

    getAllUser();
  };
};

request.onerror = function (event) {
  console.error("Error opening database", event);
};

// function addUser(user) {
//   const tx = db.transaction("users", "readwrite");
//   const store = tx.objectStore("users");
//   store.add(user);
// }
// add user data
function addUser(user) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  store.put(user); // will update if exists, insert if not
}
// get ony speific data
function getUser(id) {
  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");
  const request = store.get(id);
  request.onsuccess = () => console.log("Fetched:", request.result);
}
function getAllUser() {
  const tx = db.transaction("users", "readonly"); // not "usders"
  const store = tx.objectStore("users");

  const request = store.getAll(); // Fetch all records

  request.onsuccess = () => {
    console.log("All users:", request.result); // array of users
  };

  request.onerror = () => {
    console.error("Failed to get all users");
  };
}

function updateUser(user) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  store.put(user);
}

function deleteUser(id) {
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  store.delete(id);
}
