// ========== History Popup Functions ==========

function viewHistory() {
  renderHistoryPopup();
  document.getElementById('historyPopup').classList.add('show');
}


function closeHistoryPopup() {
  document.getElementById('historyPopup').classList.remove('show');
}

// 渲染歷史記錄內容
function renderHistoryPopup() {
  // 從 localStorage 讀取歷史記錄
  const history = JSON.parse(localStorage.getItem("businessCardHistory") || "[]");
  const list = document.getElementById('historyList');
  
  const total = history.length;
  const synced = history.filter(card => card.synced).length;
  const unsynced = total - synced;

  // 更新統計數字
  document.getElementById('totalCards').textContent = total;
  document.getElementById('syncedCards').textContent = synced;
  document.getElementById('unsyncedCards').textContent = unsynced;

  // 更新多語系文字（如果有）
  updateHistoryPopupTranslations();

  // 渲染列表
  if (total === 0) {
    list.innerHTML = `
      <div class="no-history">
        <i class="material-icons">inbox</i>
        <p>${translations[currentLanguage]?.alertNoHistory || 'No scan history available'}</p>
      </div>
    `;
    return;
  }

  // 顯示最近的記錄（最新的在前）
  const recentHistory = history.slice().reverse().slice(0, 20); // 只顯示最近 20 筆

  list.innerHTML = recentHistory.map(card => {
    const time = formatTimeAgo(card.timestamp);
    const syncStatus = card.synced ? 'synced' : 'unsynced';
    const syncText = card.synced ? 
      (translations[currentLanguage]?.syncStatusSynced || 'Synced') : 
      (translations[currentLanguage]?.syncStatusUnsynced || 'Unsynced');

    return `
      <div class="history-item">
        <div class="history-item-left">
          <div class="history-item-name">${card.name || 'Unnamed'}</div>
          <div class="history-item-company">${card.company || 'No Company'}</div>
        </div>
        <div class="history-item-right">
          <div class="history-item-time">${time}</div>
          <div class="sync-status ${syncStatus}">${syncText}</div>
        </div>
      </div>
    `;
  }).join('');
}

// 格式化時間顯示（相對時間）
function formatTimeAgo(timestamp) {
  if (!timestamp) return '';
  
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // 超過 7 天顯示日期
  return past.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
}

// 更新彈窗多語系文字
function updateHistoryPopupTranslations() {
  const t = translations[currentLanguage];
  if (!t) return;

  document.getElementById('popupTitle').textContent = t.historyTitle || 'Scan History';
  document.getElementById('statLabelTotal').textContent = t.statTotal || 'Total';
  document.getElementById('statLabelSynced').textContent = t.statSynced || 'Synced';
  document.getElementById('statLabelUnsynced').textContent = t.statUnsynced || 'Unsynced';
  document.getElementById('recentTitle').textContent = t.recentHistory || 'Recent History';
}

// 點擊遮罩關閉彈窗
document.addEventListener('DOMContentLoaded', function() {
  const popup = document.getElementById('historyPopup');
  if (popup) {
    popup.addEventListener('click', function(e) {
      if (e.target === this) {
        closeHistoryPopup();
      }
    });
  }
});