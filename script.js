/* ====== State & Storage ====== */
const STORAGE_KEY = 'dailyTransactionsAppData_v5';
let data = { 
  accounts: [], 
  transactions: [], 
  initialBalances: {}, 
  recurringTransactions: [],
  categories: [],
  subAccounts: {},
  subAccountBalances: {},
  creditCardBillingCycles: {}
};
let activeSummary = null; // 'income' | 'expense' | 'net' | null
let editingTxIndex = null;

// Default categories and subcategories based on Amazon.in
const defaultCategories = [
  {
    name: 'Electronics',
    color: '#3b82f6',
    subcategories: ['Mobiles', 'Laptops', 'Tablets', 'Cameras', 'Audio', 'Gaming', 'Accessories'],
    type: 'expense'
  },
  {
    name: 'Fashion',
    color: '#ef4444',
    subcategories: ['Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing', 'Footwear', 'Watches', 'Jewellery', 'Bags & Luggage'],
    type: 'expense'
  },
  {
    name: 'Home & Kitchen',
    color: '#10b981',
    subcategories: ['Furniture', 'Home Decor', 'Kitchen & Dining', 'Bedding', 'Bath', 'Lighting', 'Storage'],
    type: 'expense'
  },
  {
    name: 'Books',
    color: '#8b5cf6',
    subcategories: ['Fiction', 'Non-Fiction', 'Academic', 'Children\'s Books', 'Comics', 'Textbooks'],
    type: 'expense'
  },
  {
    name: 'Beauty',
    color: '#f59e0b',
    subcategories: ['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Tools & Accessories', 'Men\'s Grooming'],
    type: 'expense'
  },
  {
    name: 'Sports',
    color: '#06b6d4',
    subcategories: ['Cricket', 'Badminton', 'Football', 'Fitness', 'Cycling', 'Swimming', 'Outdoor'],
    type: 'expense'
  },
  {
    name: 'Grocery',
    color: '#84cc16',
    subcategories: ['Fruits & Vegetables', 'Bakery', 'Beverages', 'Snacks', 'Staples', 'Dairy', 'Pet Supplies'],
    type: 'expense'
  },
  {
    name: 'Toys',
    color: '#ec4899',
    subcategories: ['Action Figures', 'Dolls', 'Educational', 'Puzzles', 'Remote Control', 'Soft Toys', 'Board Games'],
    type: 'expense'
  },
  {
    name: 'Automotive',
    color: '#64748b',
    subcategories: ['Car Accessories', 'Bike Accessories', 'Tools & Equipment', 'Tyres', 'Helmets', 'Spare Parts'],
    type: 'expense'
  },
  {
    name: 'Health',
    color: '#f97316',
    subcategories: ['Medicines', 'Healthcare Devices', 'Nutrition', 'Personal Care', 'Fitness Supplements'],
    type: 'expense'
  },
  {
    name: 'Bill Payments',
    color: '#8b5cf6',
    subcategories: [
      'Electricity Bill', 
      'Water Bill', 
      'Gas Bill', 
      'Internet Bill', 
      'Mobile Recharge', 
      'DTH Recharge', 
      'Insurance Premium', 
      'Loan EMI', 
      'Credit Card Bill', 
      'Municipal Tax', 
      'Rent', 
      'Subscription Fees'
    ],
    type: 'expense'
  },
  {
    name: 'Salary',
    color: '#10b981',
    subcategories: [],
    type: 'income'
  },
  {
    name: 'Interest',
    color: '#0ea5e9',
    subcategories: [],
    type: 'income'
  },
  {
    name: 'Refund',
    color: '#84cc16',
    subcategories: [],
    type: 'income'
  }
];

function loadData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) data = JSON.parse(raw);
  } catch(e){ console.warn('loadData err', e); }
  
  // Initialize default categories if none exist
  if (!data.categories || data.categories.length === 0) {
    data.categories = defaultCategories;
  }
  
  // Initialize subAccounts if not exist
  if (!data.subAccounts) {
    data.subAccounts = {};
  }
  
  // Initialize subAccountBalances if not exist
  if (!data.subAccountBalances) {
    data.subAccountBalances = {};
  }
  
  // Initialize creditCardBillingCycles if not exist
  if (!data.creditCardBillingCycles) {
    data.creditCardBillingCycles = {};
  }
  
  // Ensure all categories have a type
  data.categories.forEach(cat => {
    if (!cat.type) {
      cat.type = 'expense'; // Default to expense for existing categories
    }
  });
}

function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(){ return '_' + Math.random().toString(36).slice(2,11); }
function formatCurrency(v){ return '₹' + (Number(v)||0).toFixed(2); }

/* ====== DOM refs ====== */
const txForm = document.getElementById('txForm');
const txType = document.getElementById('txType');
const txMode = document.getElementById('txMode');
const txDate = document.getElementById('txDate');
const txFrom = document.getElementById('txFrom');
const txTo = document.getElementById('txTo');
const txAmount = document.getElementById('txAmount');
const txDesc = document.getElementById('txDesc');
const txCategory = document.getElementById('txCategory');
const txSubCategory = document.getElementById('txSubCategory');
const cbType = document.getElementById('cbType');
const cbValue = document.getElementById('cbValue');
const recurringType = document.getElementById('recurringType');
const endDate = document.getElementById('endDate');
const maxOccurrences = document.getElementById('maxOccurrences');
const recurringOptions = document.getElementById('recurringOptions');
const toAccountContainer = document.getElementById('toAccountContainer');

const transactionsList = document.getElementById('transactionsList');
const transactionsListHeader = document.getElementById('transactionsListHeader');
const txListSummary = document.getElementById('txListSummary');

const accountsArea = document.getElementById('accountsArea');
const initialBalancesArea = document.getElementById('initialBalancesArea');
const categoriesArea = document.getElementById('categoriesArea');

const filterType = document.getElementById('filterType');
const filterAccount = document.getElementById('filterAccount');
const filterMode = document.getElementById('filterMode');
const filterCategory = document.getElementById('filterCategory');
const filterSubCategory = document.getElementById('filterSubCategory');
const filterSearch = document.getElementById('filterSearch');

const importFile = document.getElementById('importFile');

/* ====== Utilities ====== */
function getAccountBalance(acc){
  let bal = Number(data.initialBalances?.[acc]||0);
  data.transactions.forEach(t=>{
    if(t.type==='income' && t.to===acc) bal += Number(t.amount) + Number(t.cashbackAmount||0);
    if(t.type==='expense' && t.from===acc) bal -= (Number(t.amount) - Number(t.cashbackAmount||0));
    if(t.type==='transfer'){
      if(t.from===acc) bal -= Number(t.amount);
      if(t.to===acc) bal += Number(t.amount);
    }
  });
  return bal;
}

function getSubAccountBalance(mainAccount, subAccount) {
  const key = `${mainAccount}:${subAccount}`;
  let bal = Number(data.subAccountBalances?.[key] || 0);
  
  data.transactions.forEach(t => {
    if (t.from === key) bal -= Number(t.amount);
    if (t.to === key) bal += Number(t.amount);
  });
  
  return bal;
}

function getAccountTotalBalance(acc) {
  // Start with main account balance
  let totalBal = getAccountBalance(acc);
  
  // Add all sub-account balances
  if (data.subAccounts[acc]) {
    data.subAccounts[acc].forEach(subAcc => {
      const key = `${acc}:${subAcc}`;
      totalBal += getSubAccountBalance(acc, subAcc);
    });
  }
  
  return totalBal;
}

function addRecurringTransactions() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  data.recurringTransactions = data.recurringTransactions.filter(recurring => {
    // Skip stopped recurring transactions
    if (recurring.stopped) return true;
    
    const lastDate = new Date(recurring.lastGenerated || recurring.startDate);
    const end = recurring.endDate ? new Date(recurring.endDate) : null;
    const maxOcc = recurring.maxOccurrences || null;
    const occurrences = recurring.occurrences || 0;
    
    // Skip if past end date or max occurrences reached
    if (end && today > end) return true;
    if (maxOcc && occurrences >= maxOcc) {
      recurring.stopped = true;
      return true;
    }
    
    let shouldGenerate = false;
    let nextDate = new Date(lastDate);
    
    switch(recurring.type) {
      case 'daily':
        nextDate.setDate(lastDate.getDate() + 1);
        shouldGenerate = nextDate <= today;
        break;
      case 'weekly':
        nextDate.setDate(lastDate.getDate() + 7);
        shouldGenerate = nextDate <= today;
        break;
      case 'monthly':
        nextDate.setMonth(lastDate.getMonth() + 1);
        shouldGenerate = nextDate <= today;
        break;
      case 'quarterly':
        nextDate.setMonth(lastDate.getMonth() + 3);
        shouldGenerate = nextDate <= today;
        break;
      case 'half-yearly':
        nextDate.setMonth(lastDate.getMonth() + 6);
        shouldGenerate = nextDate <= today;
        break;
      case 'yearly':
        nextDate.setFullYear(lastDate.getFullYear() + 1);
        shouldGenerate = nextDate <= today;
        break;
    }
    
    if (shouldGenerate && nextDate <= today) {
      // Create new transaction
      const newTx = {
        id: generateId(),
        type: recurring.type,
        mode: recurring.mode,
        date: nextDate.toISOString().split('T')[0],
        from: recurring.from,
        to: recurring.to,
        amount: recurring.amount,
        desc: recurring.desc + ' (Recurring)',
        category: recurring.category || '',
        subCategory: recurring.subCategory || '',
        cashbackAmount: recurring.cashbackAmount || 0
      };
      
      data.transactions.push(newTx);
      
      // Update last generated date and occurrences
      recurring.lastGenerated = nextDate.toISOString().split('T')[0];
      recurring.occurrences = (recurring.occurrences || 0) + 1;
      
      // Check if we've reached max occurrences
      if (maxOcc && recurring.occurrences >= maxOcc) {
        recurring.stopped = true;
      }
    }
    
    return true;
  });
  
  saveData();
}

/* ====== Render Accounts & Initial Balances ====== */
function renderAccounts(){
  accountsArea.innerHTML = '';
  txFrom.innerHTML = '';
  txTo.innerHTML = '';
  filterAccount.innerHTML = '<option value="all">All Accounts</option>';

  data.accounts.forEach(acc=>{
    // account header with expand/collapse
    const header = document.createElement('div');
    header.className = 'account-header';
    header.id = `account-header-${acc}`;

    const left = document.createElement('div');
    left.className = 'accountName';
    left.innerHTML = ` ${acc}`;
    left.style.flex = '1';

    const actions = document.createElement('div');
    actions.className = 'account-actions';

    const addSubBtn = document.createElement('button');
    addSubBtn.innerHTML = '<i class="fas fa-plus-circle"></i>';
    addSubBtn.className = 'smallBtn ghost';
    addSubBtn.title = 'Add Sub Account';
    addSubBtn.onclick = (e)=> {
      e.stopPropagation();
      const subName = prompt(`Enter sub-account name for ${acc}:`);
      if(subName && subName.trim() !== '') {
        if(!data.subAccounts[acc]) data.subAccounts[acc] = [];
        if(!data.subAccounts[acc].includes(subName)) {
          data.subAccounts[acc].push(subName);
          // Initialize sub-account balance
          const key = `${acc}:${subName}`;
          if (!data.subAccountBalances[key]) {
            data.subAccountBalances[key] = 0;
          }
          
          // If it's a credit card, ask for billing cycle
          if (acc.toLowerCase().includes('credit') || acc.toLowerCase().includes('card')) {
            const cycleDate = prompt(`Enter billing cycle date (1-31) for ${subName}:`, '1');
            if (cycleDate && !isNaN(cycleDate) && cycleDate >= 1 && cycleDate <= 31) {
              data.creditCardBillingCycles[key] = parseInt(cycleDate);
            }
          }
          
          saveData();
          renderAccounts();
        } else {
          alert('Sub-account already exists!');
        }
      }
    };

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.className = 'smallBtn ghost';
    delBtn.onclick = (e)=> {
      e.stopPropagation();
      if(confirm(`Delete account "${acc}" and remove related transactions?`)){
        deleteAccount(acc);
      }
    };

    actions.appendChild(addSubBtn);
    actions.appendChild(delBtn);
    header.appendChild(left);
    header.appendChild(actions);
    accountsArea.appendChild(header);

    // account details (total balance)
    const details = document.createElement('div');
    details.className = 'account-details';
    details.id = `account-details-${acc}`;
    details.style.display = 'none';

    const totalBal = getAccountTotalBalance(acc);
    const balEl = document.createElement('div');
    balEl.textContent = `Total Balance: ${formatCurrency(totalBal)}`;
    balEl.className = 'balance';
    if(totalBal < 0) balEl.style.color = '#dc2626';
    details.appendChild(balEl);

    accountsArea.appendChild(details);

    // Render sub-accounts with expand/collapse
    if(data.subAccounts[acc] && data.subAccounts[acc].length > 0) {
      const subAccountList = document.createElement('div');
      subAccountList.className = 'subaccount-list';
      subAccountList.id = `subaccounts-${acc}`;
      subAccountList.style.display = 'none'; // Initially hidden
      
      data.subAccounts[acc].forEach(subAcc => {
        const key = `${acc}:${subAcc}`;
        const subDiv = document.createElement('div');
        subDiv.className = 'subaccount-item';
        
        const subLeft = document.createElement('div');
        subLeft.innerHTML = `<i class="fas fa-level-up-alt fa-rotate-90"></i> ${subAcc}`;
        
        // Show billing cycle info for credit cards
        if (data.creditCardBillingCycles[key]) {
          const cycleInfo = document.createElement('div');
          cycleInfo.className = 'billing-cycle-info';
          cycleInfo.textContent = `Billing: ${data.creditCardBillingCycles[key]}th of month`;
          subLeft.appendChild(cycleInfo);
        }
        
        const subRight = document.createElement('div');
        const subBal = getSubAccountBalance(acc, subAcc);
        const subBalEl = document.createElement('span');
        subBalEl.textContent = formatCurrency(subBal);
        subBalEl.className = 'balance';
        if(subBal < 0) subBalEl.style.color = '#dc2626';
        
        const subActions = document.createElement('div');
        subActions.className = 'subaccount-actions';
        
        const editSubBtn = document.createElement('button');
        editSubBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editSubBtn.className = 'smallBtn ghost edit-subaccount-btn';
        editSubBtn.title = 'Edit Sub Account';
        editSubBtn.onclick = (e)=> {
          e.stopPropagation();
          const newName = prompt(`Rename sub-account "${subAcc}" to:`, subAcc);
          if(newName && newName.trim() !== '' && newName !== subAcc) {
            // Update sub-account name
            const oldKey = `${acc}:${subAcc}`;
            const newKey = `${acc}:${newName}`;
            
            // Update data structures
            data.subAccounts[acc] = data.subAccounts[acc].map(sa => sa === subAcc ? newName : sa);
            data.subAccountBalances[newKey] = data.subAccountBalances[oldKey];
            delete data.subAccountBalances[oldKey];
            
            if (data.creditCardBillingCycles[oldKey]) {
              data.creditCardBillingCycles[newKey] = data.creditCardBillingCycles[oldKey];
              delete data.creditCardBillingCycles[oldKey];
            }
            
            saveData();
            renderAccounts();
          }
        };
        
        const delSubBtn = document.createElement('button');
        delSubBtn.innerHTML = '';
        delSubBtn.className = 'smallBtn ghost delete-subaccount-btn';
        delSubBtn.title = 'Delete Sub Account';
        delSubBtn.onclick = (e)=> {
          e.stopPropagation();
          if(confirm(`Delete sub-account "${subAcc}"?`)) {
            data.subAccounts[acc] = data.subAccounts[acc].filter(sa => sa !== subAcc);
            delete data.subAccountBalances[key];
            delete data.creditCardBillingCycles[key];
            saveData();
            renderAccounts();
          }
        };
        
        subActions.appendChild(editSubBtn);
        subActions.appendChild(delSubBtn);
        
        subRight.appendChild(subBalEl);
        subRight.appendChild(subActions);
        subDiv.appendChild(subLeft);
        subDiv.appendChild(subRight);
        subAccountList.appendChild(subDiv);
      });
      
      accountsArea.appendChild(subAccountList);
    }

    // Make header clickable to expand/collapse account details and sub-accounts
    header.onclick = () => {
      const isHidden = details.style.display === 'none';
      details.style.display = isHidden ? 'block' : 'none';
      const subAccountList = document.getElementById(`subaccounts-${acc}`);
      if (subAccountList) {
        subAccountList.style.display = isHidden ? 'block' : 'none';
      }
      
      // Update icon
      const icon = header.querySelector('i');
      icon.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    };

    // selects
    const o1 = document.createElement('option'); o1.value = acc; o1.textContent = acc;
    const o2 = document.createElement('option'); o2.value = acc; o2.textContent = acc;
    txFrom.appendChild(o1);
    txTo.appendChild(o2);

    const fopt = document.createElement('option'); fopt.value = acc; fopt.textContent = acc;
    filterAccount.appendChild(fopt);
    
    // Add sub-accounts to selects
    if(data.subAccounts[acc] && data.subAccounts[acc].length > 0) {
      data.subAccounts[acc].forEach(subAcc => {
        const subOpt1 = document.createElement('option'); 
        subOpt1.value = `${acc}:${subAcc}`; 
        subOpt1.textContent = `${acc} → ${subAcc}`;
        txFrom.appendChild(subOpt1);
        
        const subOpt2 = document.createElement('option'); 
        subOpt2.value = `${acc}:${subAcc}`; 
        subOpt2.textContent = `${acc} → ${subAcc}`;
        txTo.appendChild(subOpt2);
        
        const subFopt = document.createElement('option'); 
        subFopt.value = `${acc}:${subAcc}`; 
        subFopt.textContent = `${acc} → ${subAcc}`;
        filterAccount.appendChild(subFopt);
      });
    }
  });

  renderInitialBalances();
  updateSummaryBar();
}

function renderInitialBalances(){
  initialBalancesArea.innerHTML = '';
  data.accounts.forEach(acc=>{
    // Account header row
    const accountRow = document.createElement('div');
    accountRow.className = 'account-balance-row';
    accountRow.id = `init-balance-header-${acc}`;
    accountRow.style.cursor = 'pointer';

    const accountName = document.createElement('div');
    accountName.innerHTML = `<i class="fas fa-university"></i> ${acc}`;
    accountName.style.fontWeight = '600';

    // Calculate total balance (main + sub-accounts)
    let totalBalance = getAccountBalance(acc);
    if(data.subAccounts[acc] && data.subAccounts[acc].length > 0) {
      data.subAccounts[acc].forEach(subAcc => {
        const key = `${acc}:${subAcc}`;
        totalBalance += Number(data.subAccountBalances?.[key] || 0);
      });
    }
    
    const accountBalance = document.createElement('div');
    accountBalance.textContent = formatCurrency(totalBalance);
    accountBalance.className = 'balance';
    if(totalBalance < 0) accountBalance.style.color = '#dc2626';

    accountRow.appendChild(accountName);
    accountRow.appendChild(accountBalance);
    initialBalancesArea.appendChild(accountRow);

    // Sub-accounts container (initially hidden)
    const subAccountsContainer = document.createElement('div');
    subAccountsContainer.id = `init-subaccounts-${acc}`;
    subAccountsContainer.style.display = 'none';

    // Main account initial balance input
    const mainRow = document.createElement('div');
    mainRow.className = 'subaccount-balance-row';

    const mainLabel = document.createElement('div');
    mainLabel.textContent = 'Main Account';

    const mainInput = document.createElement('input');
    mainInput.type = 'number';
    mainInput.value = Number(data.initialBalances?.[acc]||0);
    mainInput.placeholder = 'Initial balance';
    mainInput.style.width = '100px';
    mainInput.onchange = ()=>{
      data.initialBalances[acc] = Number(mainInput.value)||0;
      saveData(); renderAccounts(); renderTransactions();
    };

    mainRow.appendChild(mainLabel);
    mainRow.appendChild(mainInput);
    subAccountsContainer.appendChild(mainRow);

    // Add sub-account balances
    if(data.subAccounts[acc] && data.subAccounts[acc].length > 0) {
      data.subAccounts[acc].forEach(subAcc => {
        const key = `${acc}:${subAcc}`;
        const subRow = document.createElement('div');
        subRow.className = 'subaccount-balance-row';

        const subLabel = document.createElement('div');
        subLabel.innerHTML = `<i class="fas fa-level-up-alt fa-rotate-90"></i> ${subAcc}`;

        const subInput = document.createElement('input');
        subInput.type = 'number';
        subInput.value = Number(data.subAccountBalances?.[key] || 0);
        subInput.placeholder = 'Initial balance';
        subInput.style.width = '100px';
        subInput.onchange = () => {
          data.subAccountBalances[key] = Number(subInput.value) || 0;
          saveData();
          renderAccounts();
          renderTransactions();
        };

        subRow.appendChild(subLabel);
        subRow.appendChild(subInput);
        subAccountsContainer.appendChild(subRow);
      });
    }

    initialBalancesArea.appendChild(subAccountsContainer);

    // Make account header clickable to expand/collapse sub-accounts
    accountRow.onclick = () => {
      const isHidden = subAccountsContainer.style.display === 'none';
      subAccountsContainer.style.display = isHidden ? 'block' : 'none';
      
      // Update icon
      const icon = accountRow.querySelector('i');
      icon.className = isHidden ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    };
  });
}

function addAccount(name){
  if(!name) return;
  if(data.accounts.includes(name)){ alert('Account already exists!'); return; }
  data.accounts.push(name);
  data.initialBalances[name] = 0;
  saveData();
  renderAccounts(); renderTransactions();
}

function deleteAccount(acc){
  data.accounts = data.accounts.filter(a=>a!==acc);
  data.transactions = data.transactions.filter(t=>t.from!==acc && t.to!==acc);
  delete data.initialBalances[acc];
  delete data.subAccounts[acc];
  // Delete sub-account balances and billing cycles
  Object.keys(data.subAccountBalances).forEach(key => {
    if (key.startsWith(`${acc}:`)) {
      delete data.subAccountBalances[key];
      delete data.creditCardBillingCycles[key];
    }
  });
  saveData(); renderAccounts(); renderTransactions();
}

/* ====== Render Categories ====== */
function renderCategories(){
  categoriesArea.innerHTML = '';
  txCategory.innerHTML = '<option value="">Select Category</option>';
  txCategory.innerHTML += '<option value="">No Category</option>';
  filterCategory.innerHTML = '<option value="all">All Categories</option>';
  filterCategory.innerHTML += '<option value="">No Category</option>';
  document.getElementById('editCategory').innerHTML = '<option value="">Select Category</option>';
  document.getElementById('editCategory').innerHTML += '<option value="">No Category</option>';

  // Filter categories based on transaction type
  const showExpenseCategories = txType.value === 'expense';
  const showIncomeCategories = txType.value === 'income';
  const showTransferCategories = txType.value === 'transfer';
  
  const filteredCategories = data.categories.filter(cat => {
    if (showExpenseCategories && cat.type === 'expense') return true;
    if (showIncomeCategories && cat.type === 'income') return true;
    if (showTransferCategories && cat.type === 'transfer') return true;
    return false;
  });

  filteredCategories.forEach(cat=>{
    const div = document.createElement('div');
    div.className = 'category-item';
    
    const left = document.createElement('div');
    left.innerHTML = `<span class="category-color" style="background-color: ${cat.color}"> ${cat.name}`;
    left.style.cursor = 'pointer';
    left.style.flex = '1';
    
    // Add category type badge
    const typeBadge = document.createElement('span');
    typeBadge.className = `category-type-badge category-type-${cat.type}`;
    typeBadge.textContent = cat.type.charAt(0).toUpperCase() + cat.type.slice(1);
    left.appendChild(typeBadge);
    
    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '6px';
    
    const addSubBtn = document.createElement('button');
    addSubBtn.innerHTML = '';
    addSubBtn.className = 'smallBtn ghost';
    addSubBtn.title = 'Add Sub Category';
    addSubBtn.onclick = (e)=> {
      e.stopPropagation();
      const subName = prompt(`Enter sub-category name for ${cat.name}:`);
      if(subName && subName.trim() !== '') {
        if(!cat.subcategories) cat.subcategories = [];
        if(!cat.subcategories.includes(subName)) {
          cat.subcategories.push(subName);
          saveData();
          renderCategories();
        } else {
          alert('Sub-category already exists!');
        }
      }
    };
    
    const delBtn = document.createElement('button');
    delBtn.innerHTML = '<i class="fas fa-trash"></i>';
    delBtn.className = 'smallBtn ghost';
    delBtn.onclick = (e)=> {
      e.stopPropagation();
      if(confirm(`Delete category "${cat.name}"?`)) {
        data.categories = data.categories.filter(c => c.name !== cat.name);
        saveData();
        renderCategories();
        renderTransactions();
      }
    };
    
    right.appendChild(addSubBtn);
    right.appendChild(delBtn);
    div.appendChild(left);
    div.appendChild(right);
    categoriesArea.appendChild(div);
    
    // Add to select options
    const opt = document.createElement('option');
    opt.value = cat.name;
    opt.textContent = cat.name;
    txCategory.appendChild(opt);
    
    const opt2 = document.createElement('option');
    opt2.value = cat.name;
    opt2.textContent = cat.name;
    filterCategory.appendChild(opt2);
    
    const opt3 = document.createElement('option');
    opt3.value = cat.name;
    opt3.textContent = cat.name;
    document.getElementById('editCategory').appendChild(opt3);
    
    // Render subcategories with expand/collapse
    if(cat.subcategories && cat.subcategories.length > 0) {
      const subList = document.createElement('div');
      subList.className = 'subcategory-list';
      subList.id = `subcategories-${cat.name}`;
      subList.style.display = 'none'; // Initially hidden
      
      cat.subcategories.forEach(sub => {
        const subDiv = document.createElement('div');
        subDiv.className = 'subcategory-item';
        
        const subLeft = document.createElement('div');
        subLeft.textContent = sub;
        subLeft.style.flex = '1';
        
        const subDelBtn = document.createElement('button');
        subDelBtn.innerHTML = '<i class="fas fa-trash"></i>';
        subDelBtn.className = 'smallBtn ghost';
        subDelBtn.onclick = (e)=> {
          e.stopPropagation();
          if(confirm(`Delete sub-category "${sub}"?`)) {
            cat.subcategories = cat.subcategories.filter(s => s !== sub);
            saveData();
            renderCategories();
          }
        };
        
        subDiv.appendChild(subLeft);
        subDiv.appendChild(subDelBtn);
        subList.appendChild(subDiv);
      });
      
      categoriesArea.appendChild(subList);
      
      // Make category row clickable to expand/collapse subcategories
      left.onclick = () => {
        subList.classList.toggle('expanded');
        subList.style.display = subList.style.display === 'none' ? 'block' : 'none';
      };
    }
  });
  
  // Update subcategory dropdowns
  updateSubCategoryDropdowns();
}

function updateSubCategoryDropdowns() {
  const selectedCategory = txCategory.value;
  txSubCategory.innerHTML = '
Select Sub Category
';
  txSubCategory.innerHTML += '
No Sub Category
';
  document.getElementById('editSubCategory').innerHTML = '
Select Sub Category
';
  document.getElementById('editSubCategory').innerHTML += '
No Sub Category
';
  filterSubCategory.innerHTML = '
All Sub Categories
';
  filterSubCategory.innerHTML += '
No Sub Category
';

  if (selectedCategory) {
    const category = data.categories.find(c => c.name === selectedCategory);
    if (category && category.subcategories) {
      category.subcategories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        txSubCategory.appendChild(opt);
        
        const opt2 = document.createElement('option');
        opt2.value = sub;
        opt2.textContent = sub;
        document.getElementById('editSubCategory').appendChild(opt2);
        
        const opt3 = document.createElement('option');
        opt3.value = sub;
        opt3.textContent = sub;
        filterSubCategory.appendChild(opt3);
      });
    }
  }
}

function addCategory(name, color, type){
  if(!name) return;
  if(data.categories.some(c => c.name === name)){ alert('Category already exists!'); return; }
  data.categories.push({ name, color: color || '#64748b', subcategories: [], type: type || 'expense' });
  saveData();
  renderCategories();
}

/* ====== Summary Bar (top) update & interactivity ====== */
function updateSummaryBar(){
  let totalIncome=0, totalExpense=0;
  data.transactions.forEach(t=>{
    if(t.type==='income') totalIncome += Number(t.amount) + Number(t.cashbackAmount||0);
    if(t.type==='expense') totalExpense += Number(t.amount) - Number(t.cashbackAmount||0);
  });
  const net = data.accounts.reduce((s,acc)=> s + getAccountTotalBalance(acc), 0);

  document.getElementById('summaryIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('summaryExpense').textContent = formatCurrency(totalExpense);

  const netEl = document.getElementById('summaryNet');
  netEl.textContent = formatCurrency(net);
  netEl.style.color = net < 0 ? '#dc2626' : '#047857';
}

function highlightSummaryBox(activeId){
  document.querySelectorAll('#summaryBar > div').forEach(d => d.classList.remove('active'));
  activeSummary = null;
  if(!activeId) return;
  document.getElementById(activeId).classList.add('active');
  if(activeId === 'summaryIncomeBox') activeSummary = 'income';
  if(activeId === 'summaryExpenseBox') activeSummary = 'expense';
  if(activeId === 'summaryNetBox') activeSummary = 'net';
}

document.getElementById('summaryIncomeBox').onclick = ()=>{ filterType.value='income'; renderTransactions(); highlightSummaryBox('summaryIncomeBox'); };
document.getElementById('summaryExpenseBox').onclick = ()=>{ filterType.value='expense'; renderTransactions(); highlightSummaryBox('summaryExpenseBox'); };
document.getElementById('summaryNetBox').onclick = ()=>{ filterType.value='all'; filterMode.value='all'; filterAccount.value='all'; filterSearch.value=''; renderTransactions(); highlightSummaryBox('summaryNetBox'); };

/* ====== Render Transactions (with mini-summary, chip, animations, clickable items) ====== */
function renderTransactions(){
  // reapply activeSummary state
  if(activeSummary === 'income') filterType.value='income';
  else if(activeSummary === 'expense') filterType.value='expense';
  else if(activeSummary === 'net'){ filterType.value='all'; filterMode.value='all'; filterAccount.value='all'; filterSearch.value=''; }

  // filtering
  let filtered = data.transactions.slice();
  if(filterType.value !== 'all') filtered = filtered.filter(t => t.type === filterType.value);
  if(filterMode.value !== 'all') filtered = filtered.filter(t => t.mode === filterMode.value);
  if(filterAccount.value !== 'all') filtered = filtered.filter(t => (t.from===filterAccount.value || t.to===filterAccount.value));
  if(filterCategory.value !== 'all') filtered = filtered.filter(t => t.category === filterCategory.value);
  if(filterSubCategory.value !== 'all') filtered = filtered.filter(t => t.subCategory === filterSubCategory.value);
  if(filterSearch.value && filterSearch.value.trim() !== '') filtered = filtered.filter(t => (t.desc||'').toLowerCase().includes(filterSearch.value.toLowerCase()));

  // mini summary breakdown
  const filteredCount = filtered.length;
  let incomeTotal=0, expenseTotal=0, transferTotal=0;
  filtered.forEach(t=>{
    if(t.type==='income') incomeTotal += Number(t.amount) + Number(t.cashbackAmount||0);
    if(t.type==='expense') expenseTotal += Number(t.amount) - Number(t.cashbackAmount||0);
    if(t.type==='transfer') transferTotal += Number(t.amount);
  });
  const netTotal = incomeTotal - expenseTotal;

  // filters active?
  const filtersActive = (filterType.value!=='all' || filterMode.value!=='all' || filterAccount.value!=='all' || filterCategory.value!=='all' || filterSubCategory.value!=='all' || (filterSearch.value && filterSearch.value.trim() !== ''));

  // build summary HTML
  let summaryHTML = '';
  if(filteredCount > 0){
    summaryHTML = (filtersActive ? ` Filtered View × ` : '') +
      `Showing ${filteredCount} ${filterType.value !== 'all' ? filterType.value : 'transactions'} | ` +
      ` Income: ${formatCurrency(incomeTotal)}</span> | ` +
      `<span class="expense summaryItem" data-filter="expense"><i class="fas fa-arrow-up"></i> Expense: ${formatCurrency(expenseTotal)} | ` +
      ` Transfer: ${formatCurrency(transferTotal)}</span> | ` +
      `<span class="net ${netTotal>0?'positive':(netTotal<0?'negative':'neutral')} summaryItem" data-filter="all"> Net: ${formatCurrency(netTotal)}</span>`;
  } else {
    summaryHTML = '<i class="fas fa-info-circle"></i> No transactions found.';
  }

  txListSummary.innerHTML = summaryHTML;

  // attach events for summary items
  setTimeout(()=>{
    // show chip if exists
    const chip = document.getElementById('filterTag');
    if(chip){
      chip.onclick = ()=> {
        filterType.value='all'; filterMode.value='all'; filterAccount.value='all'; filterCategory.value='all'; filterSubCategory.value='all'; filterSearch.value='';
        highlightSummaryBox('summaryNetBox');
        renderTransactions();
      };
    }

    // summary items clickable
    const items = Array.from(document.querySelectorAll('#txListSummary .summaryItem'));
    items.forEach((el)=>{
      el.onclick = () => {
        const f = el.dataset.filter;
        if(f === 'income' || f === 'expense') {
          filterType.value = f;
          highlightSummaryBox(f==='income'?'summaryIncomeBox':'summaryExpenseBox');
        } else if(f === 'transfer') {
          filterType.value = 'transfer';
          highlightSummaryBox(null);
        } else {
          filterType.value = 'all';
          filterMode.value='all'; filterAccount.value='all'; filterCategory.value='all'; filterSubCategory.value='all'; filterSearch.value='';
          highlightSummaryBox('summaryNetBox');
        }
        renderTransactions();
      };
    });
  }, 30);

  // render header + items with animation
  renderTxItems(filtered);
  updateSummaryBar();
}

function renderTxItems(filtered){
  // header
  transactionsListHeader.innerHTML = `<div id="txListHeader"><span style="flex:1"><i class="fas fa-calendar"></i> Date</span><span style="flex:2"><i class="fas fa-comment"></i> Description</span><span style="flex:1"><i class="fas fa-rupee-sign"></i> Amount</span><span style="flex:1"><i class="fas fa-gift"></i> Cashback</span><span style="flex:1"><i class="fas fa-exchange-alt"></i> Accounts</span></div>`;

  // clear list
  transactionsList.innerHTML = '';

  // reverse so latest on top
  const arr = filtered.slice().reverse();

  arr.forEach((tx, idx)=>{
    const li = document.createElement('div');
    li.className = 'item';
    // left text
    const icon = tx.type === 'income' ? '<i class="fas fa-arrow-down" style="color:#047857"></i>' : tx.type === 'expense' ? '<i class="fas fa-arrow-up" style="color:#dc2626"></i>' : '<i class="fas fa-exchange-alt" style="color:#2563eb"></i>';
    const accountsText = tx.type === 'transfer' ? `<span class="txAccounts">${tx.from} → ${tx.to}</span>` : (tx.type === 'income' ? `<span class="txAccounts">→ ${tx.to}` : `${tx.from} →</span>`);
    const cbText = (Number(tx.cashbackAmount)||0) > 0 ? `<span class="txCashback">+${formatCurrency(Number(tx.cashbackAmount))}` : '';
    const categoryText = tx.category ? `${tx.category}${tx.subCategory ? ` → ${tx.subCategory}` : ''}</span>` : '';
    
    // Find recurring transaction if exists
    const recurring = data.recurringTransactions.find(rt => rt.id === tx.id);
    let recurringBadge = '';
    let recurringInfo = '';
    
    if (recurring) {
      const badgeClass = recurring.stopped ? 'recurring-badge recurring-stopped' : 'recurring-badge';
      recurringBadge = `<span class="%%%LATEX_BLOCK_34%%%{recurring.stopped ? 'Stopped' : 'Recurring'}</span>`;
      
      if (!recurring.stopped) {
        const occurrences = recurring.occurrences || 0;
        const maxOcc = recurring.maxOccurrences || '∞';
        const endDateInfo = recurring.endDate ? `Ends: %%%LATEX_BLOCK_35%%%{occurrences}/%%%LATEX_BLOCK_36%%%{occInfo}%%%LATEX_BLOCK_37%%%{endDateInfo}` : ''}</div>`;
      }
    }

    li.innerHTML = `<div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap;">
        <span class="txIcon">${icon}
        ${tx.date}</span>
        <span style="flex:1">${tx.desc || 'No description'}${recurringBadge}${categoryText ? `
${categoryText}` : ''}%%%LATEX_BLOCK_41%%%{tx.type}">${formatCurrency(tx.amount)}
        ${cbText || '<span class="muted">-</span>'}</span>
        <span style="min-width:100px">${accountsText}</span>
      </div>`;

    transactionsList.appendChild(li);

    // show container
    setTimeout(()=> li.classList.add('show'), 10 + idx*20);

    // click to open editor
    li.addEventListener('click', (e)=>{
      // find real index in data.transactions
      const txId = tx.id;
      const realIndex = data.transactions.findIndex(t=>t.id===txId);
      if(realIndex !== -1) openEditPanel(data.transactions[realIndex], realIndex);
    });
  });
}

/* ====== Add Transaction Form ====== */
txForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  // validation
  const type = txType.value;
  const amt = Number(txAmount.value) || 0;
  if(amt <= 0){ alert('Please enter a valid amount'); return; }
  if(type !== 'income' && !txFrom.value){ alert('Please select From account'); return; }
  if(type === 'transfer' && (!txFrom.value || !txTo.value)){ alert('Please select both From and To accounts'); return; }
  if(type === 'income' && !txTo.value){ alert('Please select To account'); return; }

  let cashback = 0;
  if(cbValue.value){
    if(cbType.value === 'amount') cashback = Number(cbValue.value) || 0;
    else cashback = (Number(cbValue.value)||0) * amt / 100;
  }

  const tx = {
    id: generateId(),
    type,
    mode: txMode.value,
    date: txDate.value || new Date().toISOString().split('T')[0],
    from: type === 'income' ? null : txFrom.value || null,
    to: type === 'expense' ? null : txTo.value || null,
    amount: amt,
    desc: txDesc.value || '',
    category: txCategory.value || '',
    subCategory: txSubCategory.value || '',
    cashbackAmount: Number(cashback)||0
  };

  data.transactions.push(tx);
  
  // Handle recurring transaction
  if(recurringType.value !== 'none') {
    const recurring = {
      id: tx.id,
      type: recurringType.value,
      mode: txMode.value,
      startDate: txDate.value || new Date().toISOString().split('T')[0],
      endDate: endDate.value || null,
      maxOccurrences: maxOccurrences.value ? Number(maxOccurrences.value) : null,
      lastGenerated: txDate.value || new Date().toISOString().split('T')[0],
      occurrences: 0,
      stopped: false,
      from: tx.from,
      to: tx.to,
      amount: amt,
      desc: txDesc.value || '',
      category: txCategory.value || '',
      subCategory: txSubCategory.value || '',
      cashbackAmount: Number(cashback)||0
    };
    data.recurringTransactions.push(recurring);
  }

  saveData();
  txForm.reset();
  renderTransactions();
  renderAccounts();
});

document.getElementById('clearTx').onclick = ()=> txForm.reset();

// Update subcategories when category changes
txCategory.addEventListener('change', updateSubCategoryDropdowns);
document.getElementById('editCategory').addEventListener('change', function() {
  const selectedCategory = this.value;
  const editSubCategory = document.getElementById('editSubCategory');
  editSubCategory.innerHTML = '<option value="">Select Sub Category</option>';
  editSubCategory.innerHTML += '<option value="">No Sub Category</option>';

  if (selectedCategory) {
    const category = data.categories.find(c => c.name === selectedCategory);
    if (category && category.subcategories) {
      category.subcategories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        editSubCategory.appendChild(opt);
      });
    }
  }
});

// Show/hide recurring options based on selection
recurringType.addEventListener('change', function() {
  if (this.value === 'none') {
    recurringOptions.classList.add('hidden');
  } else {
    recurringOptions.classList.remove('hidden');
  }
});

// Show/hide To Account based on transaction type
txType.addEventListener('change', function() {
  if (this.value === 'transfer') {
    toAccountContainer.style.display = 'block';
  } else {
    toAccountContainer.style.display = 'none';
  }
  // Re-render categories based on transaction type
  renderCategories();
});

/* ====== Edit Panel ====== */
function openEditPanel(tx, index){
  editingTxIndex = index;
  document.getElementById('editDate').value = tx.date;
  document.getElementById('editDesc').value = tx.desc || '';
  document.getElementById('editAmount').value = tx.amount;
  document.getElementById('editMode').value = tx.mode;
  document.getElementById('editCategory').value = tx.category || '';
  document.getElementById('editSubCategory').value = tx.subCategory || '';
  
  // Update subcategory dropdown based on selected category
  const editSubCategory = document.getElementById('editSubCategory');
  editSubCategory.innerHTML = '<option value="">Select Sub Category</option>';
  editSubCategory.innerHTML += '<option value="">No Sub Category</option>';

  if (tx.category) {
    const category = data.categories.find(c => c.name === tx.category);
    if (category && category.subcategories) {
      category.subcategories.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        if (sub === tx.subCategory) opt.selected = true;
        editSubCategory.appendChild(opt);
      });
    }
  }
  
  // Find recurring transaction if exists
  const recurring = data.recurringTransactions.find(rt => rt.id === tx.id);
  if(recurring) {
    document.getElementById('editRecurringType').value = recurring.type;
    document.getElementById('editEndDate').value = recurring.endDate || '';
    document.getElementById('editMaxOccurrences').value = recurring.maxOccurrences || '';
    document.getElementById('editRecurringOptions').classList.remove('hidden');
  } else {
    document.getElementById('editRecurringType').value = 'none';
    document.getElementById('editEndDate').value = '';
    document.getElementById('editMaxOccurrences').value = '';
    document.getElementById('editRecurringOptions').classList.add('hidden');
  }
  
  document.getElementById('editPanelOverlay').classList.add('show');
  setTimeout(()=> document.getElementById('editPanel').classList.add('show'), 30);
}
function closeEditPanel(){
  document.getElementById('editPanel').classList.remove('show');
  setTimeout(()=> document.getElementById('editPanelOverlay').classList.remove('show'), 300);
  editingTxIndex = null;
}
document.getElementById('closeEditBtn').onclick = closeEditPanel;

// Show/hide edit recurring options based on selection
document.getElementById('editRecurringType').addEventListener('change', function() {
  if (this.value === 'none') {
    document.getElementById('editRecurringOptions').classList.add('hidden');
  } else {
    document.getElementById('editRecurringOptions').classList.remove('hidden');
  }
});

document.getElementById('editTxForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  if(editingTxIndex === null){ closeEditPanel(); return; }
  const tx = data.transactions[editingTxIndex];
  tx.date = document.getElementById('editDate').value;
  tx.desc = document.getElementById('editDesc').value;
  tx.amount = Number(document.getElementById('editAmount').value) || 0;
  tx.mode = document.getElementById('editMode').value;
  tx.category = document.getElementById('editCategory').value || '';
  tx.subCategory = document.getElementById('editSubCategory').value || '';
  
  // Update recurring transaction if exists
  const recurringIndex = data.recurringTransactions.findIndex(rt => rt.id === tx.id);
  const recurringType = document.getElementById('editRecurringType').value;
  
  if(recurringType === 'none') {
    // Remove recurring if set to none
    if(recurringIndex !== -1) {
      data.recurringTransactions.splice(recurringIndex, 1);
    }
  } else {
    // Update or create recurring transaction
    const recurringData = {
      id: tx.id,
      type: recurringType,
      mode: tx.mode,
      startDate: tx.date,
      endDate: document.getElementById('editEndDate').value || null,
      maxOccurrences: document.getElementById('editMaxOccurrences').value ? 
        Number(document.getElementById('editMaxOccurrences').value) : null,
      lastGenerated: tx.date,
      occurrences: recurringIndex !== -1 ? data.recurringTransactions[recurringIndex].occurrences : 0,
      stopped: recurringIndex !== -1 ? data.recurringTransactions[recurringIndex].stopped : false,
      from: tx.from,
      to: tx.to,
      amount: tx.amount,
      desc: tx.desc,
      category: tx.category,
      subCategory: tx.subCategory,
      cashbackAmount: tx.cashbackAmount || 0
    };
    
    if(recurringIndex !== -1) {
      data.recurringTransactions[recurringIndex] = recurringData;
    } else {
      data.recurringTransactions.push(recurringData);
    }
  }
  
  saveData();
  renderTransactions(); renderAccounts();
  closeEditPanel();
});

document.getElementById('stopRecurringBtn').addEventListener('click', ()=>{
  if(editingTxIndex === null) return;
  const tx = data.transactions[editingTxIndex];
  const recurringIndex = data.recurringTransactions.findIndex(rt => rt.id === tx.id);
  
  if(recurringIndex !== -1) {
    data.recurringTransactions[recurringIndex].stopped = true;
    saveData();
    renderTransactions(); renderAccounts();
    closeEditPanel();
  }
});

document.getElementById('deleteTxBtn').addEventListener('click', ()=>{
  if(editingTxIndex === null) return;
  if(confirm('Are you sure you want to delete this transaction?')){
    const tx = data.transactions[editingTxIndex];
    
    // Remove from transactions
    data.transactions.splice(editingTxIndex, 1);
    
    // Remove from recurring transactions if exists
    const recurringIndex = data.recurringTransactions.findIndex(rt => rt.id === tx.id);
    if(recurringIndex !== -1) {
      data.recurringTransactions.splice(recurringIndex, 1);
    }
    
    saveData();
    renderTransactions(); renderAccounts();
    closeEditPanel();
  }
});

/* ====== Filters handlers ====== */
filterType.onchange = filterMode.onchange = filterAccount.onchange = filterCategory.onchange = filterSubCategory.onchange = filterSearch.oninput = ()=> { renderTransactions(); };
document.getElementById('resetFilters').onclick = ()=>{
  filterType.value='all'; filterMode.value='all'; filterAccount.value='all'; filterCategory.value='all'; filterSubCategory.value='all'; filterSearch.value='';
  highlightSummaryBox('summaryNetBox'); renderTransactions();
};

/* ====== Accounts UI ====== */
document.getElementById('addAccountBtn').onclick = ()=>{
  const name = prompt('Enter a unique account name:');
  if(name && name.trim() !== '') addAccount(name.trim());
};

/* ====== Categories UI ====== */
document.getElementById('addCategoryBtn').onclick = ()=>{
  const name = prompt('Enter a unique category name:');
  if(name && name.trim() !== '') {
    const type = prompt('Enter category type (expense/income/transfer):', 'expense');
    if (!['expense', 'income', 'transfer'].includes(type)) {
      alert('Invalid category type. Using "expense" as default.');
    }
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#84cc16', '#ec4899', '#64748b', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addCategory(name.trim(), randomColor, type);
  }
};

/* ====== Export / Import / Reset ====== */
document.getElementById('exportJson').onclick = ()=>{
  const blob = new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'daily-transactions.json'; a.click();
  URL.revokeObjectURL(url);
};
document.getElementById('importJsonBtn').onclick = ()=> importFile.click();
importFile.onchange = (e)=>{
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    try{
      const parsed = JSON.parse(reader.result);
      if(parsed.accounts && parsed.transactions){
        data = parsed;
        saveData();
        renderAccounts(); renderTransactions(); renderCategories();
        alert('Data imported successfully!');
      } else {
        alert('Invalid file structure');
      }
    } catch(err){ alert('Invalid JSON file'); }
  };
  reader.readAsText(file);
  importFile.value = '';
};
document.getElementById('resetAppBtn').onclick = ()=>{
  if(confirm('Are you sure you want to reset all data? This action cannot be undone.')){
    data = { 
      accounts: [], 
      transactions: [], 
      initialBalances: {}, 
      recurringTransactions: [],
      categories: defaultCategories,
      subAccounts: {},
      subAccountBalances: {},
      creditCardBillingCycles: {}
    };
    saveData(); renderAccounts(); renderTransactions(); renderCategories();
  }
};

/* ====== Mobile Tabs ====== */
document.querySelectorAll('.mobile-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    
    // Update active tab
    document.querySelectorAll('.mobile-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    
    // Hide all content first
    document.querySelectorAll('.mobile-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // Show selected content with animation
    setTimeout(() => {
      document.querySelectorAll('.mobile-tab-content').forEach(content => {
        if (content.getAttribute('data-tab') === tabName) {
          content.classList.add('active');
        }
      });
    }, 10);
  });
});

/* ====== Expand/Collapse with animations ====== */
// Add click handlers for section titles to toggle content
document.querySelectorAll('.sectionTitle').forEach(title => {
  title.addEventListener('click', function() {
    const card = this.closest('.card');
    const content = card.querySelector('.collapsible-content');
    
    if (content) {
      content.classList.toggle('collapsed');
      const icon = this.querySelector('i');
      if (icon) {
        if (content.classList.contains('collapsed')) {
          icon.className = icon.className.replace('fa-chevron-up', 'fa-chevron-down');
        } else {
          icon.className = icon.className.replace('fa-chevron-down', 'fa-chevron-up');
        }
      }
    }
  });
});

document.getElementById('expandAllBtn').onclick = function() {
  document.querySelectorAll('.collapsible-content').forEach(content => {
    content.classList.remove('collapsed');
  });
  document.querySelectorAll('.sectionTitle i').forEach(icon => {
    icon.className = icon.className.replace('fa-chevron-down', 'fa-chevron-up');
  });
};


document.getElementById('collapseAllBtn').onclick = function() {
  document.querySelectorAll('.collapsible-content').forEach(content => {
    content.classList.add('collapsed');
  });
  document.querySelectorAll('.sectionTitle i').forEach(icon => {
    icon.className = icon.className.replace('fa-chevron-up', 'fa-chevron-down');
  });
};

/* ====== Initial load ====== */
loadData();

// If no accounts, add sample account
if(!data.accounts || data.accounts.length === 0){
  data.accounts = ['Cash','Bank Account','Credit Card'];
  data.initialBalances = { 'Cash': 0, 'Bank Account': 0, 'Credit Card': 0 };
  data.transactions = data.transactions || [];
  data.recurringTransactions = data.recurringTransactions || [];
  data.subAccounts = data.subAccounts || {};
  data.subAccountBalances = data.subAccountBalances || {};
  data.creditCardBillingCycles = data.creditCardBillingCycles || {};
  saveData();
}

// ensure shape
data.transactions = (data.transactions||[]).map(t=>{
  t.cashbackAmount = t.cashbackAmount || 0;
  return t;
});

// Generate recurring transactions
addRecurringTransactions();

// kick things off
renderAccounts();
renderTransactions();
renderCategories();

// ensure summary highlight default
highlightSummaryBox('summaryNetBox');

// Set today's date as default
document.getElementById('txDate').valueAsDate = new Date();

// Initialize To Account visibility
if (txType.value === 'transfer') {
  toAccountContainer.style.display = 'block';
} else {
  toAccountContainer.style.display = 'none';
}
