const params = new URLSearchParams(window.location.search);
const dbName = params.get("db") || "No DB Selected";
const collectionName = params.get("col") || "data";

// Show selected DB name
document.getElementById("dbTitle").innerText = `Selected Database: ${dbName}`;

let db;
let addTodo = document.getElementById("add");

// Open DB first time to check if collection exists
const request = indexedDB.open(dbName);

request.onsuccess = (event) => {
  db = event.target.result;

  // If collection (object store) doesn't exist, upgrade DB
  if (!db.objectStoreNames.contains(collectionName)) {
    const oldVersion = db.version;
    db.close();

    const upgradeRequest = indexedDB.open(dbName, oldVersion + 1);

    upgradeRequest.onupgradeneeded = (e) => {
      const upgradedDB = e.target.result;
      upgradedDB.createObjectStore(collectionName, { keyPath: "id" });
      console.log(`Collection "${collectionName}" created.`);
    };

    upgradeRequest.onsuccess = (e) => {
      db = e.target.result;
      console.log(`Database "${dbName}" upgraded and ready.`);
      setupEventListeners();
      getAll();
    };

    upgradeRequest.onerror = () => {
      console.error("Failed to upgrade DB and create collection");
    };

    return; // Exit early until DB is upgraded
  }

  console.log(`Database "${dbName}" opened successfully`);
  setupEventListeners();
  getAll();
};

request.onerror = (event) => {
  console.error("Error Opening Database", event);
};

// Setup UI Event Listeners
const setupEventListeners = () => {
  addTodo.addEventListener("click", () => {
    const todoInput = document.getElementById("todo");
    if (!todoInput) return alert("Input with ID 'todo' not found.");

    const name = todoInput.value.trim();
    if (name) {
      addUser({ id: Date.now(), name });
      todoInput.value = "";
    } else {
      alert("Please enter a value.");
    }
  });
};

// Add new item
const addUser = (user) => {
  const t = db.transaction(collectionName, "readwrite");
  const store = t.objectStore(collectionName);

  const request = store.put(user);
  request.onsuccess = () => getAll();
  request.onerror = () => console.error("Failed to add todo");
};

// Delete item
const deleteUser = (id) => {
  const t = db.transaction(collectionName, "readwrite");
  const store = t.objectStore(collectionName);
  store.delete(id).onsuccess = () => getAll();
};

// Update item
const updateUser = (id, newName) => {
  const t = db.transaction(collectionName, "readwrite");
  const store = t.objectStore(collectionName);
  const getReq = store.get(id);

  getReq.onsuccess = () => {
    const data = getReq.result;
    data.name = newName;
    store.put(data).onsuccess = () => getAll();
  };
};

// Fetch all and render
const getAll = () => {
  const t = db.transaction(collectionName, "readonly");
  const store = t.objectStore(collectionName);
  const request = store.getAll();

  request.onsuccess = () => displayCards(request.result);
  request.onerror = () => console.error("Can't show all todos");
};

// Render to DOM
const displayCards = (items) => {
  const list = document.querySelector(".list");
  list.innerHTML = "";

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <div class="action">
        <div class="ac">
          <button class="del" title="delete" data-id="${item.id}">delete</button>
          <button class="update" title="update" data-id="${item.id}">update</button>
        </div>
      </div>
      <div class="todoconent">
        <h3 id="tododata">${item.name}</h3>
      </div>
    `;
    list.appendChild(div);
  });

  document.querySelectorAll(".del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      deleteUser(id);
    });
  });

  document.querySelectorAll(".update").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const newName = prompt("Enter new value:");
      if (newName) updateUser(id, newName);
    });
  });
};
