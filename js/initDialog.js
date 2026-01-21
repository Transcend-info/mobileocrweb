// js/initDialog.js - 初始化對話框邏輯

// ============================================
// 初始化事件監聽
// ============================================
function initDialogEventListeners() {
  const officeSelect = document.getElementById('officeSelect');
  const tradeshowSelect = document.getElementById('tradeshowSelect');
  const userNameInput = document.getElementById('userNameInput');
  
  if (!officeSelect || !userNameInput) {
    console.error('找不到對話框元素');
    return;
  }

  // Initial State: Disable dependent fields
  if (tradeshowSelect) tradeshowSelect.disabled = true;
  if (userNameInput) userNameInput.disabled = true;

  // 1. Office Select Change Event
  officeSelect.addEventListener('change', function() {
    if (this.value && this.value !== 'initOptionSelect') {
      if (tradeshowSelect) {
         tradeshowSelect.disabled = false;
         // Optional: Focus and open dropdown could be tricky across browsers, 
         // so just enabling it is safer.
      }
    } else {
      if (tradeshowSelect) {
        tradeshowSelect.disabled = true;
        tradeshowSelect.value = 'initOptionSelect';
      } 
      if (userNameInput) {
        userNameInput.disabled = true;
        userNameInput.value = '';
      }
    }
  });

  // 2. Tradeshow Select Change Event
  if (tradeshowSelect) {
    tradeshowSelect.addEventListener('change', function() {
       if (this.value && this.value !== 'initOptionSelect') {
          if (userNameInput) userNameInput.disabled = false;
       } else {
          if (userNameInput) {
            userNameInput.disabled = true;
             userNameInput.value = '';
          }
       }
    });
  }
  
  // 監聽 Enter 鍵
  userNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveUserInfo();
    }
  });

}

// ============================================
// 驗證函數
// ============================================
function validateUserInput(office, tradeshow, userName) {
  const errors = [];
  
  if (!office || office === 'initOptionSelect') {
    errors.push({
      field: 'office',
      message: t('Please select your office')
    });
  }

  if (!tradeshow || tradeshow === 'initOptionSelect') {
    errors.push({
      field: 'tradeshow',
      message: 'Please select a tradeshow'
    });
  }

   if (!userName) {
    errors.push({
      field: 'name',
      message: t('Please enter your name')
    });
  }  

  if (userName.length < 2 || userName.length > 32) {
    errors.push({
      field: 'userName',
      message: t('Username must be 2-32 characters') });
  }
  
  return errors;
}

// ============================================
// 顯示錯誤訊息
// ============================================
function showError(message) {
  const errorDiv = document.getElementById('nameError');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // 3 秒後自動隱藏
    setTimeout(() => {
      errorDiv.style.display = 'none';
    }, 5000);
  }
}

// ============================================
// 隱藏錯誤訊息
// ============================================
function hideError() {
  const errorDiv = document.getElementById('nameError');
  if (errorDiv) {
    errorDiv.style.display = 'none';
  }
}

// ============================================
// 儲存使用者資訊
// ============================================
function saveUserInfo() {
  const office = document.getElementById('officeSelect').value;
  const tradeshow = document.getElementById('tradeshowSelect') ? document.getElementById('tradeshowSelect').value : '';
  const userName = document.getElementById('userNameInput').value.trim();
  const saveBtn = document.getElementById('saveUserInfoBtn');

  hideError();

  const errors = validateUserInput(office, tradeshow, userName);
  
  if (errors.length > 0) {
    showError(errors[0].message);
    if (errors[0].field === 'office') {
      document.getElementById('officeSelect').focus();
    } else if (errors[0].field === 'tradeshow') {
      if (document.getElementById('tradeshowSelect')) document.getElementById('tradeshowSelect').focus();
    } else {
      document.getElementById('userNameInput').focus();
    }
    
    return;
  }
  
  // 禁用按鈕，防止重複點擊
  saveBtn.disabled = true;
  saveBtn.innerHTML = t('initBtnSaving');

  const userIdentity = `${office}-${userName}`;
  
  // 儲存到 localStorage
  try {
    localStorage.setItem('userOffice', office);
    localStorage.setItem('exhibitionId', tradeshow); 
    localStorage.setItem('userRealName', userName);
    localStorage.setItem('userIdentity', userIdentity);
    localStorage.setItem('userSetupComplete', 'true');
    localStorage.setItem('userSetupTime', Date.now().toString());
    
    // 顯示成功狀態
    saveBtn.innerHTML = t("Here we go!");
    saveBtn.style.background = 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)';
    
    // 延遲關閉對話框
    setTimeout(function() {
      // 隱藏對話框
      const dialog = document.getElementById('initDialog');
      if (dialog) {
        dialog.style.display = 'none';
      }
      
      // 如果 syncToCloud 已載入，更新識別
      if (window.syncToCloud) {
        window.syncToCloud.userName = userIdentity;
        console.log('update syncToCloud userName to:', userIdentity);
      }      
      
      // 重新整理頁面以確保所有組件使用新識別
      location.reload();
      
    }, 1200);
    
  } catch (error) {
    console.error('❌ 儲存失敗:', error);
    showError(t('initErrorSave'));
    
    // 恢復按鈕狀態
    saveBtn.disabled = false;
    saveBtn.innerHTML = t('initBtnSave');
  }
}

// ============================================
// 檢查是否需要顯示初始化對話框
// ============================================
function checkAndShowInitDialog() {
  const setupComplete = localStorage.getItem('userSetupComplete');
  
  if (! setupComplete || setupComplete !== 'true') {
    console.log('🔧 第一次使用，顯示初始化對話框');
    
    // 延遲顯示，確保頁面完全載入
    setTimeout(function() {

      const dialog = document.getElementById('initDialog');
      if (dialog) {
        dialog.style.display = 'flex';
        
        // 自動聚焦到第一個欄位
        const officeSelect = document.getElementById('officeSelect');
        if (officeSelect) {
          setTimeout(() => officeSelect.focus(), 500);
        }
      } else {
        console.error('❌ 找不到初始化對話框元素');
      }
    }, 300);
  } else {
    console.log('✅ 使用者已完成設定');
    const userIdentity = localStorage.getItem('userIdentity');
    if (userIdentity) console.log('   ID:', userIdentity);
  }
}

async function loadTradeshows() {
  console.log('📥 從 Firebase 載入 Tradeshows清單...');
  
  if (!window.firebaseDB || ! window.firebaseModules) {
    console.error('❌ Firebase 未初始化');
    return null;
  }
  
  try {
    const tradeshowCollection = window.firebaseModules. collection(
      window.firebaseDB,
      'tradeshow2026'  // Collection name
    );
    
    // Query all tradeshows
    const q = window.firebaseModules.query(
      tradeshowCollection,
      window.firebaseModules()
    );
    
    const querySnapshot = await window.firebaseModules.getDocs(q);
    
    if (querySnapshot.empty) {
      console.warn('⚠️ No tradeshows in Firebase tradeshow2026 collection');
      return null;
    }
    
    // Convert to array format [{ id, tradeshow, office }]
    const tradeshows = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tradeshows.push({
        id: doc.id,           
        tradeshow: data.tradeshow,      
        office: data.office   
      });
    });
    
    // Sort by name
    tradeshows.sort((a, b) => a.tradeshow.localeCompare(b.tradeshow));
    
    console.log(`✅ Successfully loaded ${tradeshows.length} Tradeshows`);
    console.table(tradeshows);
    
    // Cache data
    tradeshowsCache = tradeshows;
    
    return tradeshows;
    
  } catch (error) {
    console.error('❌ Failed to load Tradeshows:', error);
    return null;
  }
}

async function updateTradeshowSelect() {
  const tradeshowSelect = document.getElementById('tradeshowSelect');
  if (!tradeshowSelect) {
    console.error('❌ tradeshowSelect element not found');
    return;
  }

  tradeshowSelect.innerHTML = '<option value="">Loading...</option>';
  tradeshowSelect.disabled = true;
  
  const tradeshows = await loadTradeshows();
  
  if (!tradeshows || tradeshows.length === 0) {
    tradeshowSelect.innerHTML = '<option value="">No available tradeshows</option>';
    tradeshowSelect.disabled = true;
    return;
  }
  
  // Clear and rebuild options
  tradeshowSelect.innerHTML = '<option value="">Please select...</option>';
  
  // Dynamically add each admin
  tradeshows.forEach(tradeshow => {
    const option = document.createElement('option');
    option.value = tradeshow.id;  // Document ID as value
    option.textContent = tradeshow.tradeshow;  // Display name
    option.dataset.tsid = tradeshow.TSID;  // Store TSID in data attribute
    option.dataset.office = tradeshow.office;  // Store Office
    tradeshowSelect.appendChild(option);
  });
  
  tradeshowSelect.disabled = false;
  console.log('✅ Tradeshow dropdown updated');
}
