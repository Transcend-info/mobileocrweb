let adminUsersCache = null; // 快取 Admin 使用者資料
let isAdminUnlocked = false;

/**
 * 從 Firebase 載入 Admin 使用者清單
 */
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