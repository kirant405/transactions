    :root{
      --bg: #f8fafc;
      --card: #ffffff;
      --muted: #64748b;
      --accent: #0ea5e9;
      --accent-hover: #0284c7;
      --danger: #ef4444;
      --success: #10b981;
      --warning: #f59e0b;
      --border: #e2e8f0;
      --radius: 12px;
      --pad: 16px;
      --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      --transition: all 0.2s ease;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    html,body { 
      height:100%; 
      margin:0; 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      color:#0f172a; 
      overflow-x: hidden;
    }
    
    .container { 
      max-width:1200px; 
      margin:0 auto; 
      padding:16px; 
    }
    
    header { 
      text-align:center; 
      margin-bottom:16px;
      padding: 16px;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    
    h1 { 
      margin:0; 
      font-size:24px;
      background: linear-gradient(90deg, var(--accent), var(--success));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .muted { 
      color:var(--muted); 
      font-size:14px; 
      margin-top: 8px;
    }
    
    .controls { 
      display:flex; 
      gap:8px; 
      justify-content:center; 
      margin:16px 0; 
      flex-wrap:wrap; 
    }
    
    button { 
      cursor:pointer; 
      border:0; 
      padding:8px 12px; 
      border-radius:8px; 
      background: var(--accent);
      color:white; 
      position:relative; 
      overflow:hidden; 
      transition: var(--transition);
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      font-size: 14px;
    }
    
    button:hover {
      background: var(--accent-hover);
      transform: translateY(-2px);
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    
    button.ghost { 
      background:transparent; 
      color:var(--accent); 
      border:1px solid var(--accent);
    }
    
    button.ghost:hover {
      background: rgba(14, 165, 233, 0.1);
    }
    
    button:active { 
      transform:scale(0.98); 
    }
    
    button.danger {
      background: var(--danger);
    }
    
    button.danger:hover {
      background: #dc2626;
    }
    
    .grid { 
      display:grid; 
      gap:16px; 
      grid-template-columns:1fr; 
    }
    
    .col { 
      display:flex; 
      flex-direction:column; 
      gap:16px; 
    }
    
    .card { 
      background:var(--card); 
      padding:var(--pad); 
      border-radius:var(--radius); 
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
    }
    
    .sectionTitle { 
      display:flex; 
      justify-content:space-between; 
      align-items:center; 
      margin-bottom:12px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--border);
      cursor: pointer;
    }
    
    .sectionTitle h2 { 
      margin:0; 
      font-size:18px;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    label { 
      display:block; 
      font-size:13px; 
      color:var(--muted); 
      margin-bottom:6px;
      font-weight: 500;
    }
    
    input, select { 
      width:100%; 
      padding:10px 12px; 
      border-radius:8px; 
      border:1px solid var(--border); 
      box-sizing:border-box;
      transition: var(--transition);
      font-family: inherit;
      font-size: 14px;
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2);
    }
    
    .row { 
      display:flex; 
      gap:12px; 
      margin-bottom: 12px;
    }
    
    .row > * { 
      flex:1; 
    }
    
    .smallBtn { 
      padding:6px 10px; 
      border-radius:6px; 
      background:#dbeafe; 
      color:#1d4ed8; 
      border:0; 
      position:relative; 
      overflow:hidden; 
      transition: var(--transition);
      font-size: 12px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    
    .smallBtn:hover {
      background: #bfdbfe;
      transform: translateY(-1px);
    }
    
    .smallBtn:active { 
      transform:scale(0.98); 
    }
    
    #transactionsList { 
      max-height:300px; 
      overflow-y:auto; 
      padding:8px 0; 
    }
    
    li.item { 
      display:flex; 
      justify-content:space-between; 
      padding:12px; 
      border-radius:8px; 
      border:1px solid var(--border); 
      background:#f8fafc; 
      cursor:pointer; 
      position:relative; 
      overflow:hidden; 
      transition: var(--transition);
      margin-bottom: 8px;
    }
    
    li.item.show { 
      opacity:1; 
      transform:translateY(0); 
      transition:opacity 0.3s ease, transform 0.3s ease; 
    }
    
    li.item:hover { 
      background:#f1f5f9; 
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transform: translateY(-2px);
    }
    
    li.item:active { 
      transform:scale(0.99); 
    }
    
    .accountName { 
      font-weight:600; 
      color: #1e293b;
    }
    
    .text-sm { 
      font-size:12px; 
      color:var(--muted); 
    }
    
    .balance { 
      font-weight:700; 
      font-size: 14px;
    }
    
    .danger { 
      background:#fee2e2; 
      color:var(--danger); 
      border:1px solid rgba(239,68,68,0.2); 
    }
    
    /* header list */
    #txListHeader { 
      display:flex; 
      justify-content:space-between; 
      font-weight:600; 
      padding:8px 12px; 
      border-bottom:1px solid var(--border); 
      background: #f1f5f9;
      border-radius: 8px 8px 0 0;
      margin-bottom: 8px;
      font-size: 13px;
    }
    
    /* summary mini */
    #txListSummary { 
      margin:10px 0; 
      font-weight:500; 
      color:#334155;
      padding: 10px;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 13px;
    }
    
    #txListSummary .filterTag { 
      background:#fef3c7; 
      color:#92400e; 
      font-size:11px; 
      font-weight:600; 
      padding:3px 8px; 
      border-radius:999px; 
      margin-right:6px; 
      cursor:pointer; 
      display:inline-flex; 
      align-items:center; 
      gap:3px; 
      transition: var(--transition);
    }
    
    #txListSummary .filterTag:hover {
      background: #fde68a;
    }
    
    #txListSummary .summaryItem { 
      display:inline-block; 
      margin-right:8px; 
      padding: 3px 6px;
      border-radius: 5px;
      font-size: 12px;
    }
    
    #txListSummary .income { 
      color:#047857; 
      background: rgba(16, 185, 129, 0.1);
      font-weight:600; 
    }
    
    #txListSummary .expense { 
      color:#dc2626; 
      background: rgba(239, 68, 68, 0.1);
      font-weight:600; 
    }
    
    #txListSummary .transfer { 
      color:#2563eb; 
      background: rgba(37, 99, 235, 0.1);
      font-weight:600; 
    }
    
    #txListSummary .net.positive { 
      color:#047857; 
      font-weight:700; 
      background: rgba(16, 185, 129, 0.1);
    }
    
    #txListSummary .net.negative { 
      color:#dc2626; 
      font-weight:700; 
      background: rgba(239, 68, 68, 0.1);
    }
    
    #txListSummary .net.neutral { 
      color:#374151; 
      font-weight:700; 
      background: rgba(100, 116, 139, 0.1);
    }
    
    /* tx parts */
    .txIcon { 
      margin-right:6px; 
      display:inline-block; 
      font-size: 14px;
    }
    
    .txAmount { 
      font-weight:600; 
      display:inline-block; 
    }
    
    .txAmount.income { 
      color:#047857; 
    }
    
    .txAmount.expense { 
      color:#dc2626; 
    }
    
    .txAmount.transfer { 
      color:#2563eb; 
    }
    
    .txCashback { 
      font-size:11px; 
      color:#0ea5a4; 
      margin-left:6px; 
      display:inline-block; 
      background: rgba(14, 165, 164, 0.1);
      padding: 2px 5px;
      border-radius: 3px;
    }
    
    .txAccounts { 
      font-size:11px; 
      color:#64748b; 
      margin-left:6px; 
      display:inline-block; 
      background: rgba(100, 116, 139, 0.1);
      padding: 2px 5px;
      border-radius: 3px;
    }
    
    .recurring-badge {
      font-size: 9px;
      background: #a78bfa;
      color: white;
      padding: 2px 5px;
      border-radius: 3px;
      margin-left: 5px;
    }
    
    .recurring-stopped {
      background: #94a3b8;
    }
    
    /* edit panel */
    #editPanelOverlay { 
      position:fixed; 
      top:0; 
      left:0; 
      right:0; 
      bottom:0; 
      background:rgba(0,0,0,0.5); 
      display:none; 
      justify-content:flex-end; 
      z-index:1000; 
    }
    
    #editPanelOverlay.show { 
      display:flex; 
    }
    
    #editPanel { 
      background:var(--card); 
      width:100%; 
      height:100%; 
      padding:16px; 
      box-shadow:-2px 0 15px rgba(0,0,0,0.2); 
      transform:translateX(100%); 
      transition:transform 0.3s ease; 
      display:flex; 
      flex-direction:column; 
      gap:12px; 
      overflow-y: auto;
    }
    
    #editPanel.show { 
      transform:translateX(0); 
    }
    
    #editPanel h2 {
      margin-top: 0;
      color: #1e293b;
      border-bottom: 1px solid var(--border);
      padding-bottom: 10px;
      font-size: 20px;
    }
    
    /* summary bar */
    #summaryBar {
      display: flex;
      gap: 12px;
      justify-content: space-around;
      text-align: center;
      padding: 16px;
      background: linear-gradient(135deg, #e0f2fe 0%, #dbeafe 100%);
      border: none;
      flex-wrap: wrap;
    }
    
    #summaryBar > div {
      padding: 12px;
      border-radius: 10px;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: var(--transition);
      cursor: pointer;
      border: 1px solid var(--border);
      flex: 1;
      min-width: 100px;
    }
    
    #summaryBar > div:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    
    #summaryBar > div.active {
      border: 2px solid var(--accent);
      background: #f0f9ff;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: 700;
      margin-top: 6px;
    }
    
    /* footer */
    footer {
      text-align: center;
      margin-top: 16px;
      padding: 12px;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      border: 1px solid var(--border);
      font-size: 12px;
    }
    
    .hidden {
      display: none;
    }
    
    .recurring-info {
      font-size: 11px;
      color: #64748b;
      margin-top: 3px;
    }
    
    .recurring-options {
      background-color: #f1f5f9;
      padding: 10px;
      border-radius: 8px;
      margin-top: 6px;
    }
    
    .sub-account {
      margin-left: 16px;
      font-size: 12px;
      color: #64748b;
    }
    
    .category-item {
      padding: 8px 10px;
      border-radius: 6px;
      background: #f1f5f9;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .category-item:hover {
      background: #e2e8f0;
    }
    
    .category-color {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 6px;
    }
    
    .subcategory-list {
      margin-left: 16px;
      margin-top: 5px;
      padding-left: 8px;
      border-left: 2px solid #cbd5e1;
      display: none;
    }
    
    .subcategory-list.expanded {
      display: block;
    }
    
    .subcategory-item {
      padding: 3px 6px;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .subcategory-actions {
      display: flex;
      gap: 3px;
    }
    
    .subaccount-list {
      margin-left: 16px;
      margin-top: 5px;
      padding-left: 8px;
      border-left: 2px solid #cbd5e1;
      display: none;
    }
    
    .subaccount-list.expanded {
      display: block;
    }
    
    .subaccount-item {
      padding: 6px;
      font-size: 12px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border-radius: 5px;
      margin-bottom: 3px;
    }
    
    .billing-cycle-info {
      font-size: 10px;
      color: #94a3b8;
      margin-top: 2px;
    }
    
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-radius: 8px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      margin-bottom: 10px;
      cursor: pointer;
    }
    
    .account-header:hover {
      background: #f1f5f9;
    }
    
    .account-actions {
      display: flex;
      gap: 5px;
    }
    
    .account-balance-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 5px;
      margin-bottom: 6px;
      font-size: 13px;
      cursor: pointer;
    }
    
    .subaccount-balance-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 10px;
      background: #f8fafc;
      border-radius: 4px;
      margin-bottom: 3px;
      font-size: 12px;
      margin-left: 16px;
    }
    
    .delete-transaction-btn {
      background: var(--danger);
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }
    
    .delete-transaction-btn:hover {
      background: #dc2626;
    }
    
    .fixed-delete-btn {
      position: fixed;
      right: 10px;
      top: 10px;
      z-index: 1001;
    }
    
    .subaccount-actions {
      display: flex;
      gap: 5px;
    }
    
    .edit-subaccount-btn, .delete-subaccount-btn {
      padding: 3px 6px;
      font-size: 10px;
    }
    
    .category-type-badge {
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      margin-left: 8px;
    }
    
    .category-type-expense {
      background: rgba(239, 68, 68, 0.1);
      color: #dc2626;
    }
    
    .category-type-income {
      background: rgba(16, 185, 129, 0.1);
      color: #047857;
    }
    
    .category-type-transfer {
      background: rgba(37, 99, 235, 0.1);
      color: #2563eb;
    }
    
    /* Mobile tabs */
    .mobile-tabs {
      display: flex;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      margin-bottom: 16px;
      overflow: hidden;
    }
    
    .mobile-tab {
      flex: 1;
      text-align: center;
      padding: 12px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
      position: relative;
      overflow: hidden;
    }
    
    .mobile-tab.active {
      border-bottom: 3px solid var(--accent);
      background: rgba(14, 165, 233, 0.1);
    }
    
    .mobile-tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }
    
    .mobile-tab-content.active {
      display: block;
    }
    
    /* Expand/Collapse animations */
    .collapsible-content {
      max-height: 1000px;
      overflow: hidden;
      transition: max-height 0.3s ease, opacity 0.3s ease;
    }
    
    .collapsible-content.collapsed {
      max-height: 0;
      opacity: 0;
    }
    
    /* Tab animations */
    @keyframes slideInLeft {
      from {
        transform: translateX(-20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(20px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    
    .slide-in-left {
      animation: slideInLeft 0.3s ease;
    }
    
    .slide-in-right {
      animation: slideInRight 0.3s ease;
    }
    
    @media (min-width: 768px) {
      .container {
        padding: 24px;
      }
      
      .grid {
        grid-template-columns: 1fr 400px;
      }
      
      #editPanel {
        width: 400px;
        height: 100%;
      }
      
      .controls {
        gap: 12px;
      }
      
      button {
        padding: 10px 16px;
        font-size: 15px;
      }
      
      .smallBtn {
        padding: 6px 12px;
        font-size: 13px;
      }
      
      #summaryBar > div {
        min-width: 150px;
      }
      
      .summary-value {
        font-size: 24px;
      }
      
      .mobile-tabs {
        display: none;
      }
      
      .mobile-tab-content {
        display: block;
        animation: none;
      }
    }
