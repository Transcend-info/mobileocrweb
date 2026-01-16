
async function downloadFirebaseExcel() {
  // 檢查 Firebase 是否初始化
  if (!window. firebaseDB || !window.firebaseModules) {
    alert('❌ Firebase 未初始化\n\n請確認網路連線正常。');
    return;
  }

  const loadingDiv = document.getElementById("loadingDiv");
  const loadingText = document.getElementById("loadingText");
  const progressText = document.getElementById("progressText");
  
  loadingDiv. classList.add("show");
  loadingText.innerHTML = '<i class="material-icons">cloud_download</i> 正在從雲端下載資料...';
  progressText.textContent = '請稍候...';

  try {
    console.log('📥 開始從 Firebase 下載 exhibition_cards.. .');

    // 從 Firestore 取得所有 exhibition_cards 資料
    const cardsCollection = window.firebaseModules.collection(
      window.firebaseDB, 
      'exhibition_cards'
    );
    
    // 建立查詢（可選：加上排序）
    const q = window.firebaseModules.query(
      cardsCollection,
      window.firebaseModules.orderBy('scannedAt', 'desc')
    );

    const querySnapshot = await window.firebaseModules.getDocs(q);

    // 檢查是否有資料
    if (querySnapshot.empty) {
      alert('📭 目前雲端沒有任何資料');
      loadingDiv.classList.remove("show");
      return;
    }

    console.log(`✅ 取得 ${querySnapshot.size} 筆資料`);
    progressText.textContent = `已取得 ${querySnapshot.size} 筆資料，正在產生 Excel... `;

    // 轉換為陣列
    const cards = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // 處理 Firebase Timestamp
      let scannedAtStr = '';
      if (data.scannedAt && data.scannedAt.toDate) {
        scannedAtStr = formatDateTime(data.scannedAt. toDate());
      }

      cards.push({
        'Cloud ID': doc.id,
        'Name': data.name || '',
        'Job Title': data.jobTitle || '',
        'Department': data.department || '',
        'Phone': data.phone || '',
        'Mobile': data.mobile || '',
        'Fax': data.fax || '',
        'Email':  data.email || '',
        'Company Name': data.companyName || '',
        'Company Address': data.companyAddress || '',
        'Company Website': data.companyWebsite || '',
        'Tax ID': data.taxId || '',
        'Note': data.note || '',
        'Scanned By': data.scannedBy || '',
        'Scanned By Office': data.scannedByOffice || '',
        'Exhibition ID': data.exhibitionId || '',
        'Scanned At':  scannedAtStr
      });
    });

    // 使用 XLSX 產生 Excel
    const worksheet = XLSX.utils.json_to_sheet(cards);
    
    // 設定欄位寬度
    worksheet['!cols'] = [
      { wch: 25 }, // Cloud ID
      { wch: 20 }, // Name
      { wch: 25 }, // Job Title
      { wch: 20 }, // Department
      { wch: 18 }, // Phone
      { wch: 18 }, // Mobile
      { wch: 18 }, // Fax
      { wch: 30 }, // Email
      { wch: 30 }, // Company Name
      { wch: 40 }, // Company Address
      { wch: 30 }, // Company Website
      { wch: 15 }, // Tax ID
      { wch: 30 }, // Note
      { wch: 20 }, // Scanned By
      { wch: 15 }, // Scanned By Office
      { wch: 20 }, // Exhibition ID
      { wch: 20 }  // Scanned At
    ];

    const workbook = XLSX.utils. book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Exhibition Cards");

    const fileName = `${getFileTimestamp()}_exhibition_cards.xlsx`;

    XLSX.writeFile(workbook, fileName);

    console.log(`✅ Excel 檔案已下載:  ${fileName}`);
    
    // 顯示成功訊息
    showAlert(
      "success",
      `✅ 已下載 ${cards.length} 筆資料\n檔案名稱: ${fileName}`
    );

  } catch (error) {
    console.error('❌ 下載失敗:', error);
    alert(`❌ 下載失敗\n\n錯誤訊息: ${error.message}`);
  } finally {
    // 隱藏 Loading
    loadingDiv.classList.remove("show");
  }
}

function getFileTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}${month}${day}${hour}${minute}`;
}


function formatDateTime(date) {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date. getMonth() + 1).padStart(2, '0');
  const day = String(date. getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}