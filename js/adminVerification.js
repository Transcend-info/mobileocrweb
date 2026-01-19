let adminUsersCache = null; // 快取 Admin 使用者資料
let isAdminUnlocked = false;

async function verifyAdminUsers(){
    const nameSelect = document.getElementById('adminNameSelect');
    const tsidInput = document.getElementById('adminEmployeeInput');
    const inputHint = document.getElementById('input-hint');
    const selectedAdminId = nameSelect.value;
    const enteredTSID = tsidInput.value.trim().toUpperCase();      

    if (!selectedAdminId) {   
        inputHint.innerHTML = '❌ Please select an Admin name.';
        //alert('❌ Please select an Admin name.');
        return;
    }
    if (!enteredTSID) {
        inputHint.textContent = '❌ Please enter the TSID. Format: 2 letters + 4 digits, e.g., LA0001';
        //alert('❌ Please enter the TSID. Format: 2 letters + 4 digits, e.g., LA0001');
        return;
    }

    // 從快取或重新載入 Admin 使用者清單
    let adminUsers = adminUsersCache;       
    if (!adminUsers) {
        adminUsers = await loadAdminUsers();
        if (!adminUsers) {
            inputHint.innerHTML = '❌ Unable to load Admin users. Please try again later.';
            return;
        }   
    }   
    // 找到選取的 Admin 使用者
    const selectedAdmin = adminUsers.find(admin => admin.id === selectedAdminId);   
    if (!selectedAdmin) {
        inputHint.innerHTML = '❌ Selected Admin not found.';
        return;
    }
    // 驗證 TSID
    if (selectedAdmin.TSID !== enteredTSID) {
        inputHint.innerHTML = '❌ TSID does not match. Access denied.';
        return;
    }
    // 成功驗證
    isAdminUnlocked = true;
    //alert(`✅ Welcome, ${selectedAdmin.name}! Admin access granted.`);
    closeAdminPopup();
    console.log(`🔓 Admin access granted to ${selectedAdmin.name} (ID: ${selectedAdmin.id})`)  ;  

    // 清除輸入欄位
    nameSelect.value = '';
    tsidInput.value = '';   

    // display download export button
    const exportBtn = document.getElementById('btnExportCloud');  
    if (exportBtn) {
        exportBtn.style.display = 'inline-block';
    } 

    // ✅ 儲存登入狀態（重新整理頁面後仍有效）
    localStorage.setItem('adminUnlocked', 'true');
    localStorage.setItem('adminUnlockTime', Date.now().toString());
    localStorage.setItem('adminName', selectedAdmin.name);
    localStorage.setItem('adminOffice', selectedAdmin.office);
    localStorage.setItem('adminTSID', selectedAdmin.TSID);
    location.reload();
}

async function loadAdminUsers() {
  console.log('📥 從 Firebase 載入 Admin 使用者清單...');
  
  if (!window.firebaseDB || ! window.firebaseModules) {
    console.error('❌ Firebase 未初始化');
    return null;
  }
  
  try {
    const adminCollection = window.firebaseModules. collection(
      window.firebaseDB,
      'admin_list'  // Collection name
    );
    
    // Query all enabled Admins
    const q = window.firebaseModules.query(
      adminCollection,
      window.firebaseModules.where('enabled', '==', true)
    );
    
    const querySnapshot = await window.firebaseModules.getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn('⚠️ No enabled users in Firebase admin_list');
      return null;
    }
    
    // Convert to array format [{ id, name, TSID, office }]
    const adminUsers = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      adminUsers.push({
        id: doc.id,           
        name: data.name,      
        TSID:  data.TSID,     
        office: data.office   
      });
    });
    
    // Sort by name
    adminUsers.sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`✅ Successfully loaded ${adminUsers.length} Admin users`);
    console.table(adminUsers);
    
    // Cache data
    adminUsersCache = adminUsers;
    
    return adminUsers;
    
  } catch (error) {
    console.error('❌ Failed to load Admin users:', error);
    return null;
  }
}

async function updateAdminNameSelect() {
  const nameSelect = document.getElementById('adminNameSelect');
  if (!nameSelect) {
    console.error('❌ adminNameSelect element not found');
    return;
  }

  nameSelect.innerHTML = '<option value="">Loading...</option>';
  nameSelect.disabled = true;
  
  const adminUsers = await loadAdminUsers();
  
  if (!adminUsers || adminUsers.length === 0) {
    nameSelect.innerHTML = '<option value="">No available admins</option>';
    nameSelect.disabled = true;
    return;
  }
  
  // Clear and rebuild options
  nameSelect.innerHTML = '<option value="">Please select...</option>';
  
  // Dynamically add each admin
  adminUsers.forEach(admin => {
    const option = document.createElement('option');
    option.value = admin.id;  // Document ID as value
    option.textContent = admin.name;  // Display name
    option.dataset.tsid = admin.TSID;  // Store TSID in data attribute
    option.dataset.office = admin.office;  // Store Office
    nameSelect.appendChild(option);
  });
  
  nameSelect.disabled = false;
  console.log('✅ Admin dropdown updated');
}