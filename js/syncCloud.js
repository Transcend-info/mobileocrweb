class syncCloud {
  constructor() {
    // 確保 Firebase 已初始化
    if (!window.firebaseDB || !window.firebaseModules) {
      console.warn('⏳ 等待 Firebase 初始化...');
      this.initWhenReady();
      return;
    }
    
    this.db = window.firebaseDB;
    this.modules = window.firebaseModules;
    this.init();
  }

  // 等待 Firebase 就緒後初始化
  initWhenReady() {
    const checkInterval = setInterval(() => {
      if (window.firebaseDB && window.firebaseModules) {
        clearInterval(checkInterval);
        this.db = window.firebaseDB;
        this.modules = window.firebaseModules;
        this. init();
      }
    }, 100);
  }

  // 初始化
  init() {
    this.userName = this.getUserIdentity();
    this.exhibitionId = this.getExhibitionId();
    
    console.log('✅ 雲端同步系統已啟動');
    console.log('👤 使用者:', this.userName);
    console.log('📍 展覽:', this.exhibitionId);
    
    // 定期檢查未同步數量
    this.startAutoCheck();
  }

  // ============================================
  // 取得使用者識別
  // ============================================
  getUserIdentity() {
    const setupComplete = localStorage.getItem('userSetupComplete');
    
    const userIdentity = localStorage.getItem('userIdentity');
    const office = localStorage.getItem('userOffice');
    const realName = localStorage.getItem('userRealName');
    
    if (userIdentity) {
      console.log('✅ 使用者識別:', userIdentity);
      return userIdentity;
    }
    
    console.warn('⚠️ 使用者資料不完整');
    return 'PENDING-SETUP';
  }

  // 取得辦公室
  getUserOffice() {
    return localStorage.getItem('userOffice') || 'Unknown';
  }

  // 取得真實姓名
  getUserRealName() {
    return localStorage.getItem('userRealName') || 'Unknown';
  }

  // 檢查是否已完成設定
  isSetupComplete() {
    return localStorage.getItem('userSetupComplete') === 'true';
  }

  // 取得展覽 ID
  getExhibitionId() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlExhibition = urlParams.get('exhibition');
    const savedExhibition = localStorage.getItem('exhibitionId');
    const defaultExhibition = 'computex-2026';
    
    const exhibitionId = urlExhibition || savedExhibition || defaultExhibition;
    localStorage.setItem('exhibitionId', exhibitionId);
    
    return exhibitionId;
  }

  // 定期檢查
  startAutoCheck() {
    this.updateUnsyncedBadge();
    setInterval(() => {
        this.updateUnsyncedBadge();
    }, 60000); // Check every 1 minute
  }

  // 更新未同步徽章
  updateUnsyncedBadge() {
    try {
        const historyStr = localStorage.getItem('businessCardHistory');
        if (!historyStr) return;
        
        const history = JSON.parse(historyStr);
        if (!Array.isArray(history)) return;

        const unsyncedCount = history.filter(c => !c.cloudId && !c.synced).length;
        console.log('🔄 Pending Sync:', unsyncedCount);
        
        // Example: Update a UI badge if it exists
        const badge = document.getElementById('syncBadge');
        if (badge) {
            badge.textContent = unsyncedCount > 0 ? unsyncedCount : '';
            badge.style.display = unsyncedCount > 0 ? 'block' : 'none';
        }
    } catch(e) {
        console.error('Badge update error:', e);
    }
  }
}

// Instantiate the helper
window.syncToCloud = new syncCloud();


async function syncHistoryToCloud() {

  if (!window.firebaseDB || !window.firebaseModules) {
    alert('❌ Firebase 未初始化\n\n請確認網路連線正常。');
    return {
      success: false,
      error: 'FIREBASE_NOT_INITIALIZED'
    };
  }
  

  let history = [];
  try {
    const historyStr = localStorage.getItem('businessCardHistory');
    if (!historyStr) {
      alert('✅ 沒有資料需要同步');
      return {
        success: true,
        total: 0,
        message: '沒有資料'
      };
    }
    
    history = JSON.parse(historyStr);
    
    if (!Array.isArray(history) || history.length === 0) {
      alert('✅ 沒有資料需要同步');
      return {
        success: true,
        total: 0,
        message: '沒有資料'
      };
    }
  } catch (error) {
    console.error('❌ 讀取歷史資料失敗:', error);
    alert('❌ 讀取本地資料失敗');
    return {
      success: false,
      error: 'READ_ERROR'
    };
  }
  
  console.log(`📊 讀取到 ${history.length} 筆歷史資料`);
  
  // ============================================
  // 3. 篩選未同步的資料
  // ============================================
  
  const unsyncedCards = history.filter(card => {
    // 檢查是否已有 cloudId 或 synced 標記
    return !card.cloudId && !card.synced;
  });
  
  if (unsyncedCards.length === 0) {
    alert('✅ 所有資料都已同步！');
    return {
      success: true,
      total: history.length,
      synced: history.length,
      unsynced: 0,
      message: '所有資料都已同步'
    };
  }
  
  console.log(`📤 發現 ${unsyncedCards.length} 筆未同步資料`);
  
  // ============================================
  // 4. 確認對話框
  // ============================================
  
  const userInfo = window.syncToCloud;
  const confirmMessage = 
    `📤 準備同步到 Firebase\n\n` +
    `待同步:  ${unsyncedCards.length} 張名片\n` +
    `已同步: ${history.length - unsyncedCards.length} 張\n` +
    `總計: ${history.length} 張\n\n` +
    `使用者: ${userInfo.userName}\n` +
    `辦公室: ${userInfo.getUserOffice()}\n` +
    `展覽:  ${userInfo.exhibitionId}\n\n` +
    `確定要開始同步嗎？`;
  
  if (!confirm(confirmMessage)) {
    console.log('❌ 使用者取消同步');
    return {
      success: false,
      cancelled: true,
      message: '使用者取消'
    };
  }
  
  // ============================================
  // 5. 開始批次上傳
  // ============================================
  
  // 顯示 Loading
  if (window.showLoading) {
    showLoading('正在同步到雲端...');
  }
  
  let successCount = 0;
  let failCount = 0;
  const failedCards = [];
  const startTime = Date.now();
  
  console.log('🚀 開始批次上傳...');
  
  for (let i = 0; i < unsyncedCards.length; i++) {
    const card = unsyncedCards[i];
    const cardIndex = i + 1;
    
    try {
      // 更新進度顯示
      if (window.updateSyncProgress) {
        updateSyncProgress(cardIndex, unsyncedCards.length);
      }
      
      // 更新 Loading 文字
      if (window.showLoading) {
        showLoading(`正在同步 ${cardIndex}/${unsyncedCards.length}... `);
      }
      
      console.log(`📤 [${cardIndex}/${unsyncedCards.length}] 上傳: `, card.name || card.company || card.email);
      
      // 準備上傳資料（與 exportHistoryToExcel 類似的資料結構）
      const uploadData = {
        // === 基本資訊 ===
        name:  card.name || '',
        company: card.company || '',
        jobTitle: card.jobTitle || '',
        department: card.department || '',
        phone: card.phone || '',
        mobile: card.mobile || '',
        fax: card.fax || '',
        email: card.email || '',
        address: card.address || '',
        website: card.website || '',
        taxId: card.taxId || '',
        note: card.note || '',        

        scannedBy: userInfo.getUserRealName(),
        scannedByOffice: userInfo.getUserOffice(),
        exhibitionId: userInfo.exhibitionId,
        
        // === 時間戳記 ===
        scannedAt: card.timestamp ?  
          window.firebaseModules.Timestamp.fromMillis(card.timestamp) : 
          window.firebaseModules.serverTimestamp(),
        
        // === 元資料 ===
        localId: card.id || card.timestamp?.toString(),
        deviceInfo: navigator.userAgent,
        createdAt: window.firebaseModules.serverTimestamp(),
        syncedAt: window.firebaseModules.serverTimestamp(),
        
        // === 來源標記 ===
        source: 'batch_sync',
        batchSyncTime: Date.now()
      };      

      
      // 上傳到 Firestore
      const docRef = await window.firebaseModules.addDoc(
        window.firebaseModules.collection(window.firebaseDB, 'exhibition_cards'),
        uploadData
      );
      
      console.log(`  ✅ 成功，雲端 ID: ${docRef.id}`);
      
      // 標記為已同步
      card.cloudId = docRef.id;
      card.synced = true;
      card.syncedAt = Date.now();
      
      successCount++;
      
      // 避免請求過快，稍微延遲
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.error(`  ❌ 失敗: `, error.message);
      
      failCount++;
      failedCards.push({
        card: card,
        error: error.message
      });
    }
  }
  
  // ============================================
  // 6. 更新 localStorage（保存同步狀態）
  // ============================================
  
  try {
    localStorage.setItem('businessCardHistory', JSON.stringify(history));
    console.log('✅ 已更新本地同步狀態');
  } catch (error) {
    console.error('⚠️ 更新本地狀態失敗:', error);
  }
  
  // ============================================
  // 7. 計算統計資訊
  // ============================================
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  const result = {
    success: true,
    total: unsyncedCards.length,
    successCount,
    failCount,
    failedCards,
    duration,
    message: `同步完成:  ${successCount} 成功, ${failCount} 失敗 (耗時 ${duration} 秒)`
  };
  
  console.log('📊 同步結果:', result);
  
  // ============================================
  // 8. 隱藏 Loading 並顯示結果
  // ============================================
  
  if (window.hideLoading) {
    hideLoading();
  }
  
  // 顯示結果對話框
  const resultMessage = 
    `✅ 同步完成！\n\n` +
    `成功: ${successCount} 張\n` +
    `失敗: ${failCount} 張\n` +
    `總計: ${unsyncedCards.length} 張\n` +
    `耗時: ${duration} 秒\n\n` +
    (failCount > 0 ? 
      `⚠️ 部分資料同步失敗，請檢查網路連線後重試。` : 
      `🎉 所有資料都已成功同步到雲端！`);
  
  alert(resultMessage);
  
  // 如果有失敗的，輸出到 Console
  if (failedCards.length > 0) {
    console.error('❌ 失敗的名片:', failedCards);
  }
  
  // ============================================
  // 9. 更新 UI 顯示
  // ============================================
  
  if (window.syncToCloud) {
    window.syncToCloud.updateUnsyncedBadge();
  }
  
  return result;
}
