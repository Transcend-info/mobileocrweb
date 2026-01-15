let currentImage = null;
let currentImageFile = null;
let currentLanguage = "en";

let AZURE_ENDPOINT = "";
let AZURE_API_KEY = "";

const CONFIG_API_URL =
  "https://g6sa73wbfraryu4ykqhtzvhi4a0sskbs.lambda-url.ap-northeast-1.on.aws/";

const OCR_KEYWORDS = {
  mobile: [
    "Mobile",
    "Mob",
    "Cell",
    "Handy",
    "M:",
    "M.",
    "行動",
    "手機",
    "機:",
    "手提",
    "+",
  ],
  phone: [
    "Tel","Tel:",
    "Phone","Phone direct", "Direct",
    "Ph",
    "Office",
    "T:",
    "T.",
    "D:",
    "電話",
    "話:",
    "代表",
    "+",
    "(",
    "0",
    ")",
  ],
  address: [
    "路",
    "號",
    "樓",
    "室",
    "區",
    "縣",
    "City",
    "Country",
    "Street",
    "Road",
    "Rd.",
    "St.",
    "Ln",
    "Aly.",
    "RUE",
    "Ave",
    "Dist.",
    "No.",
    "Taiwan",
    "Dist",
    "〒",
  ],
  fax: ["Fax", "F:", "F.", "傳真", "真:"],
  email: ["@", "Email", "E-mail", "E:", "E.", "郵箱", "信箱", "電子郵件"],
  website: [
    "http",
    "www.",
    ".com",
    ".tw",
    ".cn",
    ".ch",
    ".jp",
    ".de",
    ".nl",
    ".fr",
    ".kr",
    ".net",
    "Web",
    "Website",
    "網址",
    "網頁",
    ".org",
    ".io",
    ".biz",
    ".co",
    ".info",
  ],
  taxId: ["統一編號", "統編", "Tax ID", "VAT", "GUI", "TAX", "TAX No"],
  company: [
    "Co.",
    "Ltd",
    "Inc",
    "Corp",
    "GmbH",
    "AG",
    "Group",
    "Company",
    "Limited",
    "Technology",
    "University", "Universität",
    "College",
    "School",
    "公司",
    "集團",
    "株式會社","株式会社","製作所",
    "有限公司",
    "股份",
    "工作室",
    "企業",
    "商行",
    "大學",
    "學院",
    "LLC",
    "Enterprise","AG",
  ],
  dept: [
    "Department",
    "Dept",
    "Div",
    "Division",
    "Team", "메모리사업부", "상품기획팀",
    "Center",
    "BU",
    "Unit",
    "處",
    "中心","セ ン タ",
    "部門",
    "部",
    "課",
    "事業",
  ],
  job: [
    "Manager",
    "Mgr",
    "Director",
    "Chief",
    "Engineer",
    "Specialist",
    "Senior",
    "Assistant",
    "President",
    "Founder",
    "CEO","Geschäftsführer",
    "CTO",
    "CFO",
    "COO",
    "Fellow",
    "representative",
    "Head",
    "VP",
    "Sr",
    "Sr.",
    "Jr",
    "Jr.",
    "Lead", "リーダー",
    "Supervisor",
    "Staff",
    "PhD",
    "MD",
    "Dr.",
    "Prof.",
    "Ph.D.", "Dipl.",
    "Architect",
    "Sales",
    "CFA",
    "經理",
    "副理",
    "總監",
    "主任",
    "專員",
    "業務",
    "資深",
    "工程師",
    "處長",
    "執行長",
    "營運長",
    "董事",
    "董事長",
    "特助",
    "顧問",
    "代表",
    "負責人",
    "取締役",
    "監査役",
    "社長",
    "役員",
    "部長",
    "課長",
    "室長",
    "組長",
    "專家",
    "領班",
    "主管",
    "助理",
    "博士",
    "教授",
    "이사",
  ],
  industry: [
    "科技",
    "資訊",
    "實業",
    "工業",
    "貿易",
    "國際",
    "電子",
    "生技",
    "文化",
    "創意",
    "設計",
    "物流",
    "System",
    "Global",
    "Digital",
    "Consulting",
    "Solutions", "シ ス テ ム ソ リ ュ ー シ", "ン プ ロ ジ ェ ク ト",
    "Industry",
    "International",
  ],
};

async function fetchConfig() {
  try {
    const response = await fetch(CONFIG_API_URL);
    if (!response.ok) throw new Error("Failed to load configuration");
    const config = await response.json();
    AZURE_ENDPOINT = config.endpoint;
    AZURE_API_KEY = config.apiKey;
    console.log("Configuration loaded successfully");
  } catch (error) {
    console.error("Error loading config:", error);
    showAlert("error", "System configuration failed to load.");
  }
}

function changeLanguage() {
  const lang = document.getElementById("languageSelect").value;
  currentLanguage = lang;
  localStorage.setItem("preferredLanguage", lang);
  const t = translations[lang];

  // Use innerHTML instead of textContent to render icons
  document.getElementById("headerTitle").textContent = t.title;
  document.getElementById("btnCamera").innerHTML = t.btnCamera;
  
  // Update Init Dialog if function exists
  if (typeof updateInitDialogTranslations === 'function') {
    updateInitDialogTranslations();
  }

  document.getElementById("loadingText").innerHTML = t.loadingText;
  document.getElementById("formTitle").innerHTML = t.formTitle;
  document.getElementById("labelName").innerHTML = t.labelName;
  document.getElementById("labelJobTitle").innerHTML = t.labelJobTitle;
  document.getElementById("labelDepartment").innerHTML = t.labelDepartment;
  document.getElementById("labelPhone").innerHTML = t.labelPhone;
  document.getElementById("labelMobile").innerHTML = t.labelMobile;
  document.getElementById("labelFax").innerHTML = t.labelFax;
  document.getElementById("labelEmail").innerHTML = t.labelEmail;
  document.getElementById("labelCompany").innerHTML = t.labelCompany;
  document.getElementById("labelAddress").innerHTML = t.labelAddress;
  document.getElementById("labelWebsite").innerHTML = t.labelWebsite;
  document.getElementById("labelNote").innerHTML = t.labelNote;
  document.getElementById("labelTaxId").innerHTML = t.labelTaxId;
  document.getElementById("btnSave").innerHTML = t.btnSave;
  document.getElementById("btnRescan").innerHTML = t.btnRescan;
  document.getElementById("btnSync").innerHTML = t.btnSync;

  // Update Export Button with Count
  updateExportButton();

  // Show/hide Tax ID field based on language
  const taxIdField = document.getElementById("taxIdField");
  if (lang === "tc") {
    taxIdField.style.display = "block";
  } else {
    taxIdField.style.display = "none";
  }

  // Update preview text if no image loaded
  if (!currentImage) {
    const previewBox = document.getElementById("previewBox");
    if (previewBox.querySelector(".preview-placeholder")) {
      previewBox.querySelector("p").textContent = t.previewText;
    }
  }
}

// Helper function to update the Export Button with the count
function updateExportButton() {
  const history = JSON.parse(
    localStorage.getItem("businessCardHistory") || "[]"
  );
  const count = history.length;
  const t = translations[currentLanguage];
  document.getElementById("btnExport").innerHTML = `${t.btnExport} (${count})`;
}

function openCamera() {
  document.getElementById("cameraInput").click();
}

// Prevent triggering file input when clicking on OCR boxes
function triggerFileInput(event) {
  if (event.target.classList.contains("ocr-box")) return;
  document.getElementById("fileInput").click();
}

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  currentImageFile = file;

  // Check if file is HEIC/HEIF format
  const isHEIC = /\.(heic|heif)$/i.test(file.name) || 
                 file.type === 'image/heic' || 
                 file.type === 'image/heif';

  if (isHEIC) {
    // Show loading indicator
    showAlert("info", translations[currentLanguage].alertConvertingImage || "Converting HEIC image...");
    
    // Convert HEIC to JPEG
    heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9
    })
    .then(function(convertedBlob) {
      // Create a new File object from the converted blob
      currentImageFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
        type: 'image/jpeg'
      });
      
      // Read the converted file
      const reader = new FileReader();
      reader.onload = function (e) {
        currentImage = e.target.result;
        displayImage(currentImage);
        showAlert("success", translations[currentLanguage].alertImageLoaded);

        // Automatically start OCR after image is loaded
        setTimeout(() => {
          performOCR();
        }, 500);
      };
      reader.readAsDataURL(convertedBlob);
    })
    .catch(function(error) {
      console.error("HEIC conversion error:", error);
      showAlert("error", translations[currentLanguage].alertHEICError || "Failed to convert HEIC image. Please use JPG or PNG format.");
      currentImageFile = null;
    });
  } else {
    // Handle regular image formats
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImage = e.target.result;
      displayImage(currentImage);
      showAlert("success", translations[currentLanguage].alertImageLoaded);

      // Automatically start OCR after image is loaded
      setTimeout(() => {
        performOCR();
      }, 500);
    };
    reader.readAsDataURL(file);
  }
}

function displayImage(imageSrc) {
  const previewBox = document.getElementById("previewBox");
  // Create a relative container for image and overlays
  previewBox.innerHTML = `
        <div id="imageWrapper">
            <img id="previewImage" src="${imageSrc}" alt="Business Card Preview">
            <div id="overlayLayer"></div>
        </div>
      `;
}

async function performOCR() {
  if (!currentImage) {
    showAlert("error", translations[currentLanguage].alertUploadFirst);
    return;
  }

  if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
    showAlert("error", "System configuration not loaded. Retrying...");
    await fetchConfig();
    if (!AZURE_ENDPOINT) return;
  }

  const loadingDiv = document.getElementById("loadingDiv");
  const progressText = document.getElementById("progressText");
  loadingDiv.classList.add("show");
  progressText.textContent = translations[currentLanguage].progressText;

  try {
    // Convert base64 to blob
    const base64Data = currentImage.split(",")[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "image/jpeg" });

    // Azure Document Intelligence (prebuilt-read) endpoint
    const apiUrl = `${AZURE_ENDPOINT.replace(
      /\/$/,
      ""
    )}/documentintelligence/documentModels/prebuilt-read:analyze?api-version=2024-11-30`;

    // Submit image for analysis
    const submitResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_API_KEY,
        "Content-Type": "application/octet-stream",
      },
      body: blob,
    });

    if (!submitResponse.ok) {
      const errText = await submitResponse.text();
      throw new Error(
        `Azure API error: ${submitResponse.status} ${submitResponse.statusText} - ${errText}`
      );
    }

    // Get operation location from response headers
    const operationLocation = submitResponse.headers.get("Operation-Location");
    if (!operationLocation) {
      throw new Error("No Operation-Location header in response");
    }

    // Poll for results
    let result;
    let attempts = 0;
    const maxAttempts = 30;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const resultResponse = await fetch(operationLocation, {
        method: "GET",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_API_KEY,
        },
      });

      if (!resultResponse.ok) {
        throw new Error(`Failed to get results: ${resultResponse.status}`);
      }

      result = await resultResponse.json();

      if (result.status === "succeeded") {
        break;
      } else if (result.status === "failed") {
        throw new Error("OCR analysis failed");
      }

      attempts++;
      progressText.textContent = `${translations[currentLanguage].progressText} (${attempts}/${maxAttempts})`;
    }

    if (result.status !== "succeeded") {
      throw new Error("OCR timeout");
    }

    // Extract text from results
    let extractedText = "";
    if (result.analyzeResult && result.analyzeResult.pages) {
      for (const page of result.analyzeResult.pages) {
        if (page.lines) {
          for (const line of page.lines) {
            extractedText += line.content + "\n";
          }
        }
      }
    } else if (result.analyzeResult && result.analyzeResult.content) {
      extractedText = result.analyzeResult.content;
    }

    // Draw OCR Overlay
    drawOCROverlay(result);

    parseOCRResult(extractedText);

    loadingDiv.classList.remove("show");
    showAlert("success", translations[currentLanguage].alertScanComplete);
  } catch (error) {
    loadingDiv.classList.remove("show");
    showAlert(
      "error",
      translations[currentLanguage].alertScanFailed + error.message
    );
  }
}

// Function to draw OCR bounding boxes
function drawOCROverlay(result) {
  const overlayLayer = document.getElementById("overlayLayer");
  const img = document.getElementById("previewImage");

  if (!overlayLayer || !img || !result.analyzeResult) return;

  overlayLayer.innerHTML = ""; // Clear existing

  // We need to wait for the image to load to get its display dimensions
  // If image is already loaded:
  if (img.complete) {
    renderBoxes();
  } else {
    img.onload = renderBoxes;
  }

  function renderBoxes() {
    // Azure coordinates are usually based on original image size
    // We need to scale them to the displayed image size
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const displayWidth = img.width;
    const displayHeight = img.height;

    const scaleX = displayWidth / naturalWidth;
    const scaleY = displayHeight / naturalHeight;

    const pages = result.analyzeResult.pages;
    if (!pages) return;

    pages.forEach((page) => {
      if (page.lines) {
        page.lines.forEach((line) => {
          // polygon: [x1, y1, x2, y2, x3, y3, x4, y4]
          // Simple bounding box logic (min x, min y, width, height)
          const p = line.polygon;
          if (!p) return;

          // Calculate bounding box from polygon
          const xs = [p[0], p[2], p[4], p[6]];
          const ys = [p[1], p[3], p[5], p[7]];

          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          const maxX = Math.max(...xs);
          const maxY = Math.max(...ys);

          const box = document.createElement("div");
          box.className = "ocr-box";
          box.style.left = minX * scaleX + "px";
          box.style.top = minY * scaleY + "px";
          box.style.width = (maxX - minX) * scaleX + "px";
          box.style.height = (maxY - minY) * scaleY + "px";

          // Set hover text
          box.setAttribute("data-text", line.content);

          overlayLayer.appendChild(box);
        });
      }
    });
  }
}

function guessName(lines, jobTitleIndex = -1) {
  // 1. 擴充排除關鍵字：包含產業別、公司型態、常見標語
  const excludeKeywords = [
    ...OCR_KEYWORDS.company,
    ...OCR_KEYWORDS.dept,
    ...OCR_KEYWORDS.address,
    ...OCR_KEYWORDS.phone,
    ...OCR_KEYWORDS.mobile,
    ...OCR_KEYWORDS.fax,
    ...OCR_KEYWORDS.email,
    ...OCR_KEYWORDS.website,
    ...OCR_KEYWORDS.taxId,
    ...OCR_KEYWORDS.industry,
  ];

  // 常見職稱 (用於從同一行移除)
  const jobTitles = OCR_KEYWORDS.job;

  // --- 策略 A: 職稱錨點 (Anchor Strategy) ---
  // 如果已知職稱index (jobTitleIndex)，優先檢查該行的上下一行
  if (jobTitleIndex > 0) {
    let prevLine = lines[jobTitleIndex - 1].trim();
    let isBlockedprevLine = excludeKeywords.some((k) =>
      prevLine.toLowerCase().includes(k.toLowerCase())
    );
    let hasNumberprevLine = /\d/.test(prevLine);

    if (
      !isBlockedprevLine &&
      !hasNumberprevLine &&
      prevLine.length >= 2 &&
      !/^[a-z]+$/.test(prevLine) &&
      !/^[A-Z]+$/.test(prevLine) &&
      !excludeKeywords.some((keyword) =>
        prevLine.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      return prevLine;
    }
  }

  if (jobTitleIndex >= 2) {
    let prevLine2 = lines[jobTitleIndex - 2].trim();
    let isBlockedprevLine2 = excludeKeywords.some((k) =>
      prevLine2.toLowerCase().includes(k.toLowerCase())
    );
    let hasNumberprevLine2 = /\d/.test(prevLine2);

    if (
      !isBlockedprevLine2 &&
      !hasNumberprevLine2 &&
      prevLine2.length >= 2 &&
      !/^[a-z]+$/.test(prevLine2) &&
      !/^[A-Z]+$/.test(prevLine2) &&
      !excludeKeywords.some((keyword) =>
        prevLine2.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      return prevLine2;
    }
  }

  if (jobTitleIndex >= 0 && jobTitleIndex < lines.length - 1) {
    let nextLine = lines[jobTitleIndex + 1].trim();
    let isBlockednextLine = excludeKeywords.some((k) =>
      nextLine.toLowerCase().includes(k.toLowerCase())
    );
    let hasNumbernextLine = /\d/.test(nextLine);

    if (
      !isBlockednextLine &&
      !hasNumbernextLine &&
      nextLine.length >= 2 &&
      !/^[a-z]+$/.test(nextLine) &&
      !/^[A-Z]+$/.test(nextLine) &&
      !excludeKeywords.some((keyword) =>
        nextLine.toLowerCase().includes(keyword.toLowerCase())
      )
    ) {
      return nextLine;
    }
  }

  // --- 策略 B: 全局掃描 (Fallback) ---
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // 過濾 1: 基本雜訊
    if (line.length < 2 || line.includes("@") || /\d/.test(line)) continue;

    // 過濾 2: 關鍵字排除
    if (
      excludeKeywords.some((keyword) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      )
    )
      continue;

    // 過濾 3: 職稱處理 (同一行)
    const matchedTitle = jobTitles.find((title) =>
      line.toLowerCase().includes(title.toLowerCase())
    );
    let possibleName = "";
    if (matchedTitle) {
      possibleName = line.replace(matchedTitle, "").trim();
      possibleName = possibleName.replace(/[\|\-,\.]/g, "").trim(); // 移除標點

      // 嚴格檢查剩餘文字
      if (possibleName.length >= 2 && possibleName.length <= 15) {
        // 如果是中文，長度大於4通常是"XX科技股份有限公司"移除職稱後的殘留
        if (/[\u4e00-\u9fa5]/.test(possibleName) && possibleName.length > 4)
          continue;
        return possibleName;
      }
    }
    if (matchedTitle && possibleName.length == 0) continue;

    // 過濾 4: 純名字猜測 (通常在前10行)
    if (i < 10) {
      // 中文名字嚴格限制 2-4 字
      if (/[\u4e00-\u9fa5]/.test(line)) {
        if (line.length >= 2 && line.length <= 4) return line;
      }
      // 日文（平假名/片假名）或含日本漢字的情況：允許長度小於等於 5
      else if (/[\u3040-\u30ff]/.test(line)) {
        if (line.length >= 2 && line.length <= 5) return line;
      }
      // 韓文（Hangul）：允許長度小於等於 5
      else if (/[\uac00-\ud7af]/.test(line)) {
        if (line.length >= 2 && line.length <= 5) return line;
      }
      // 英文名字 排除全大寫小寫或全是連結符號的
      else {
        if (
          line.length >= 3 &&
          line.length <= 20 &&
          !/^[a-z]+$/.test(line) &&
          !/^[A-Z]+$/.test(line)
        ) {
          return line;
        }
      }
    }
  }
  return "";
}

function extractGlobalPhoneNumber(line) {
  // Regex ：
  // ((\+|00)\d{1,4})?  -> 可選的國碼，如 +886 或 00886
  // [\s\-\.]?          -> 分隔符
  // \(?\d{1,5}\)?      -> 區碼或前綴，可能帶括號 (02)
  // ... 後續的數字群組

  // TW: 0912-345-678, (02) 2792-8000
  // US: 555.123.4567, +1-555-555-5555
  // CN: +86 138 1234 5678
  // DE: +49 30 123456
  // JP: 03-1234-5678

  const globalPhoneRegex =
    /(?:(?:\+|00)\d{1,4}[\s\-\.]*)?(?:\(?\d{1,5}\)?[\s\-\.]*){1,5}\d{3,}/g;

  const matches = line.match(globalPhoneRegex);
  if (!matches) return null;

  // 從匹配結果中找出最像電話號碼的 (長度檢查)
  // 過濾掉太短的 (可能是分機號碼或門牌) 或太長的
  for (let match of matches) {
    // 計算純數字長度
    const digitCount = match.replace(/\D/g, "").length;

    // 國際電話通常至少 8 碼 (包含區碼)，最多約 15 碼 (ITU標準)
    if (digitCount >= 8 && digitCount <= 17) {
      return match.trim();
    }
  }
  return null;
}

function parseOCRResult(text) {
  const lines = text.split("\n").filter((line) => line.trim());

  let name = "";
  let jobTitle = "";
  let department = "";
  let phone = "";
  let mobile = "";
  let fax = "";
  let email = "";
  let company = "";
  let address = "";
  let website = "";
  let taxId = "";

  const keywords = OCR_KEYWORDS;

  let jobTitleIndex = -1;

  // 第一輪掃描：先找明確的欄位 (職稱、電話、Email、公司名)
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    let lineLower = line.toLowerCase();

    // Tax ID - TW only
    const taxIdMatch = line.match(/\b\d{8}\b/);
    if (taxIdMatch && !taxId) {
      taxId = taxIdMatch[0];
      continue;
    }
    // Mobile
    if (
      keywords.mobile.some(
        (k) => line.includes(k) || lineLower.startsWith(k.toLowerCase())
      )
    ) {
      if (!mobile) {
        const extracted = extractGlobalPhoneNumber(line);
        if (extracted) {
          mobile = extracted;
          continue;
        }
      }
    }

    // Fax
    if (
      keywords.fax.some(
        (k) => line.includes(k) || lineLower.startsWith(k.toLowerCase())
      )
    ) {
      if (!fax) {
        const extracted = extractGlobalPhoneNumber(line);
        if (extracted) {
          fax = extracted;
          continue;
        }
      }
    }

    // TEL
    if (
      keywords.phone.some(
        (k) => line.includes(k) || lineLower.startsWith(k.toLowerCase())
      )
    ) {
      if (!phone) {
        const extracted = extractGlobalPhoneNumber(line);
        if (extracted) {
          phone = extracted;
          continue;
        }
      }
    }

    // Website
    const websiteMatch = line.match(
      /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?/
    );
    if (websiteMatch && !website && !line.includes("@")) {
      website = websiteMatch[0];
      continue;
    }

    // Email
    const emailMatch = line.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    if (emailMatch && !email) {
      email = emailMatch[0];
      continue;
    }

    if (!jobTitle && keywords.job.some((k) => line.includes(k))) {
      jobTitle = line;
      jobTitleIndex = i;
      continue;
    }
    if (!department && keywords.dept.some((k) => line.includes(k))) {
      department = line;
      continue;
    }

    const isAllCaps = /^[A-Z.,&-]+$/.test(line) && line.length > 3;
    const isAllLowerCase = /^[a-z.,&-]+$/.test(line) && line.length > 3;
    if (keywords.company.some((k) => line.includes(k))) {
      company = line;
      continue;
    } else if (!company && isAllCaps) {
      company = line;
      continue;
    } else if (!company && isAllLowerCase) {
      company = line;
      continue;
    }

    if (
      !address &&
      line.length > 10 &&
      keywords.address.some(
        (k) => line.includes(k) || lineLower.startsWith(k.toLowerCase())
      )
    ) {
      address = line;
      continue;
    }
  }

  // 第二輪：如果還沒找到名字，利用職稱位置來猜
  if (!name) {
    name = guessName(lines, jobTitleIndex);
  }

  // 填入表單
  document.getElementById("nameInput").value = name;
  document.getElementById("jobTitleInput").value = jobTitle;
  document.getElementById("departmentInput").value = department;
  document.getElementById("phoneInput").value = phone;
  document.getElementById("mobileInput").value = mobile;
  document.getElementById("faxInput").value = fax;
  document.getElementById("emailInput").value = email;
  document.getElementById("companyInput").value = company;
  document.getElementById("addressInput").value = address;
  document.getElementById("websiteInput").value = website;
  document.getElementById("taxIdInput").value = taxId;
}

// Save current form data to localStorage
function saveToLocalStorage() {
  const cardData = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    name: document.getElementById("nameInput").value,
    jobTitle: document.getElementById("jobTitleInput").value,
    department: document.getElementById("departmentInput").value,
    phone: document.getElementById("phoneInput").value,
    mobile: document.getElementById("mobileInput").value,
    fax: document.getElementById("faxInput").value,
    email: document.getElementById("emailInput").value,
    company: document.getElementById("companyInput").value,
    address: document.getElementById("addressInput").value,
    website: document.getElementById("websiteInput").value,
    note: document.getElementById("noteInput").value,
    taxId: document.getElementById("taxIdInput").value,
  };

  // Get existing history or initialize empty array
  let history = JSON.parse(localStorage.getItem("businessCardHistory") || "[]");

  // Add new card to history
  history.push(cardData);

  // Save back to localStorage
  localStorage.setItem("businessCardHistory", JSON.stringify(history));

  console.log("Saved to localStorage:", cardData);
}

// Renamed from uploadNew to saveCard
function saveCard() {
  // Check if there is any data in the form to save
  const hasData = [
    "nameInput",
    "jobTitleInput",
    "departmentInput",
    "phoneInput",
    "mobileInput",
    "faxInput",
    "emailInput",
    "companyInput",
    "addressInput",
    "websiteInput",
    "noteInput",
    "taxIdInput",
  ].some((id) => document.getElementById(id).value.trim() !== "");

  if (hasData) {
    saveToLocalStorage();
    showAlert("success", translations[currentLanguage].alertSaved);
    clearAll();
    // Update the export button count
    updateExportButton();
  } else {
    showAlert("error", translations[currentLanguage].alertFillField);
  }
}

function rescan() {
  if (!currentImage) {
    showAlert("error", translations[currentLanguage].alertNoImage);
    return;
  }

  if (confirm(translations[currentLanguage].confirmRescan)) {
    performOCR();
  }
}

function clearAll() {
  currentImage = null;
  currentImageFile = null;
  const t = translations[currentLanguage];
  document.getElementById("previewBox").innerHTML = `
        <div class="preview-placeholder">
          <i class="material-icons">add_a_photo</i>
          <p>${t.previewText}</p>
        </div>
      `;
  document.getElementById("nameInput").value = "";
  document.getElementById("jobTitleInput").value = "";
  document.getElementById("departmentInput").value = "";
  document.getElementById("phoneInput").value = "";
  document.getElementById("mobileInput").value = "";
  document.getElementById("faxInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("companyInput").value = "";
  document.getElementById("addressInput").value = "";
  document.getElementById("websiteInput").value = "";
  document.getElementById("noteInput").value = "";
  document.getElementById("taxIdInput").value = "";
  document.getElementById("fileInput").value = "";
  document.getElementById("cameraInput").value = "";
}

// Updated function to export history from LocalStorage
function exportHistoryToExcel() {
  // Retrieve history from local storage
  const historyJSON = localStorage.getItem("businessCardHistory");
  const history = JSON.parse(historyJSON || "[]");

  if (history.length === 0) {
    showAlert("error", translations[currentLanguage].alertNoHistory);
    return;
  }

  // Create workbook
  const wb = XLSX.utils.book_new();

  // Get column headers based on current language by stripping HTML tags
  const t = translations[currentLanguage];
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const headers = [
    stripHtml(t.labelName),
    stripHtml(t.labelJobTitle),
    stripHtml(t.labelDepartment),
    stripHtml(t.labelPhone),
    stripHtml(t.labelMobile),
    stripHtml(t.labelFax),
    stripHtml(t.labelEmail),
    stripHtml(t.labelCompany),
    stripHtml(t.labelAddress),
    stripHtml(t.labelWebsite),
    stripHtml(t.labelNote),
    stripHtml(t.labelTaxId),
  ];

  // Map history data to array of arrays
  const dataRows = history.map((item) => [
    item.name,
    item.jobTitle,
    item.department,
    item.phone,
    item.mobile,
    item.fax,
    item.email,
    item.company,
    item.address,
    item.website,
    item.note,
    item.taxId,
  ]);

  // Create data (Headers + Rows)
  const wsData = [headers, ...dataRows];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws["!cols"] = [
    { wch: 15 }, // Name
    { wch: 20 }, // Job Title
    { wch: 20 }, // Department
    { wch: 20 }, // Phone
    { wch: 20 }, // Mobile
    { wch: 20 }, // Fax
    { wch: 30 }, // Email
    { wch: 25 }, // Company
    { wch: 40 }, // Address
    { wch: 30 }, // Website
    { wch: 30 }, // Note
    { wch: 15 }, // Tax ID
  ];

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Card History");

  // Generate filename
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const filename = `BusinessCard_History_${timestamp}.xlsx`;

  // Export file
  XLSX.writeFile(wb, filename);

  showAlert(
    "success",
    translations[currentLanguage].alertExcelDownloaded + filename
  );
}

async function syncToAWS() {
  console.log("Sync button clicked");
  const history = JSON.parse(localStorage.getItem("businessCardHistory") || "[]");
  if (history.length === 0) {
     showAlert("error", translations[currentLanguage].alertNoHistory || "No history to sync");
     return;
  }
  
  // TODO: Implement actual AWS sync logic here
  // Example:
  // try {
  //   const response = await fetch('YOUR_AWS_ENDPOINT', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(history)
  //   });
  //   if (response.ok) showAlert("success", "Sync successful!");
  //   else throw new Error("Sync failed");
  // } catch (e) {
  //   showAlert("error", "Sync error: " + e.message);
  // }
  
  showAlert("info", "Sync to AWS functionality will be implemented here.");
}

function showAlert(type, message) {
  const alertSuccess = document.getElementById("alertSuccess");
  const alertError = document.getElementById("alertError");

  alertSuccess.classList.remove("show");
  alertError.classList.remove("show");

  // Use innerHTML because message now contains HTML icons
  if (type === "success" || type === "info") {
    alertSuccess.innerHTML = message;
    alertSuccess.classList.add("show");
    setTimeout(() => alertSuccess.classList.remove("show"), type === "info" ? 3000 : 2000);
  } else {
    alertError.innerHTML = message;
    alertError.classList.add("show");
    setTimeout(() => alertError.classList.remove("show"), 5000);
  }
}

// Initialize button count on load
window.onload = function () {
  // Initialize Dialog
  if (typeof initDialogEventListeners === 'function') initDialogEventListeners();
  if (typeof checkAndShowInitDialog === 'function') checkAndShowInitDialog();

  fetchConfig();
  
  const savedLang = localStorage.getItem("preferredLanguage");
  if (savedLang && translations[savedLang]) {
    document.getElementById("languageSelect").value = savedLang;
    changeLanguage();
  } else {
    updateExportButton();
  }
};
