// ===== STATE =====
let transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
let accounts = JSON.parse(localStorage.getItem("accounts") || "[]");
let sortBy = "date"; // default sort
let sortOrder = "desc"; // latest first

// ===== DOM ELEMENTS =====
const transactionList = document.getElementById("transactionList");
const txnForm = document.getElementById("addTransactionForm");
const accountForm = document.getElementById("addAccountForm");
const txnAccountSelect = document.getElementById("txnAccount");
const filterAccountType = document.getElementById("filterAccountType");
const emptyRow = document.getElementById("emptyTransactions");

// ===== HELPERS =====
function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("accounts", JSON.stringify(accounts));
}

function formatAmount(val) {
  return (Math.round(val * 100) / 100).toFixed(2);
}

function renderAccounts() {
  const list = document.getElementById("accountList");
  list.innerHTML = "";
  txnAccountSelect.innerHTML = "";

  accounts.forEach(acc => {
    const li = document.createElement("li");
    li.textContent = `${acc.name} (${acc.type})`;
    list.appendChild(li);

    const opt = document.createElement("option");
    opt.value = acc.name;
    opt.textContent = `${acc.name} (${acc.type})`;
    txnAccountSelect.appendChild(opt);
  });
}

function renderTransactions() {
  transactionList.innerHTML = "";
  let filtered = transactions.slice();

  if (filterAccountType.value) {
    filtered = filtered.filter(txn => {
      const acc = accounts.find(a => a.name === txn.account);
      return acc && acc.type === filterAccountType.value;
    });
  }

  filtered.sort((a, b) => {
    if (sortBy === "date") {
      return sortOrder === "asc"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    }
    return 0;
  });

  if (filtered.length === 0) {
    transactionList.appendChild(emptyRow);
    emptyRow.hidden = false;
    return;
  }

  emptyRow.hidden = true;
  filtered.forEach(txn => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.account}</td>
      <td>${txn.category}</td>
      <td>${formatAmount(txn.amount)}</td>
    `;
    transactionList.appendChild(tr);
  });
}

// ===== EVENT HANDLERS =====
txnForm.addEventListener("submit", e => {
  e.preventDefault();
  const txn = {
    date: document.getElementById("txnDate").value,
    amount: parseFloat(document.getElementById("txnAmount").value),
    account: document.getElementById("txnAccount").value,
    category: document.getElementById("txnCategory").value
  };
  transactions.push(txn);
  saveData();
  renderTransactions();
  txnForm.reset();
});

accountForm.addEventListener("submit", e => {
  e.preventDefault();
  const account = {
    name: document.getElementById("accountName").value,
    type: document.getElementById("accountType").value
  };
  accounts.push(account);
  saveData();
  renderAccounts();
  accountForm.reset();
});

filterAccountType.addEventListener("change", renderTransactions);

document.getElementById("tabTransactions").addEventListener("click", () => {
  document.getElementById("transactionsSection").hidden = false;
  document.getElementById("accountsSection").hidden = true;
});

document.getElementById("tabAccounts").addEventListener("click", () => {
  document.getElementById("transactionsSection").hidden = true;
  document.getElementById("accountsSection").hidden = false;
});

// ===== INIT =====
renderAccounts();
renderTransactions();
