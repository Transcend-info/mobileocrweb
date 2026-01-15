// js/initDialog.js - 初始化對話框邏輯

// ============================================
// 初始化事件監聽
// ============================================
function initDialogEventListeners() {
  const officeSelect = document.getElementById('officeSelect');
  const userNameInput = document.getElementById('userNameInput');
  
  if (!officeSelect || !userNameInput) {
    console.error('找不到對話框元素');
    return;
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
function validateUserInput(office, userName) {
  const errors = [];
  
  if (!office) {
    errors.push({
      field: 'office',
      message: t('Please select your office')
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
  const userName = document.getElementById('userNameInput').value.trim();
  const saveBtn = document.getElementById('saveUserInfoBtn');

  hideError();

  const errors = validateUserInput(office, userName);
  
  if (errors.length > 0) {
    showError(errors[0].message);
    if (errors[0].field === 'office') {
      document.getElementById('officeSelect').focus();
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

