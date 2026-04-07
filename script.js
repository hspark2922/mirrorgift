const ADMIN_ID = "admin0430";
const PRESET_SLOT_COUNT = 5;

let activePresetSlotId = null;
let editingPresetSlotId = null;

let gifts = [];
let selectedKeywords = ["전체"];
let currentUserData = null;
let selectedGiftIds = [];
let selectedGrades = [];
let currentPresets = {};

/* =========================
   시작
========================= */
function waitForFirebaseAndStart() {
  if (window.firebaseReady && window.db && window.fb && window.auth) {
    init();
    return;
  }

  window.addEventListener("firebase-ready", init, { once: true });
}

async function init() {
  console.log("Firebase 준비 완료");
  setupAuthUI();
  setupEnterKeySubmit();
  await loadGifts();
  await loadSelectedGifts();
  await loadPresets();
  updateKeywordFilterUI();
  updateGradeFilterUI();
  updatePresetViewBar();
  renderGifts();
  renderPresetPanel();
}

/* =========================
   데이터
========================= */
const keywordOrder = {
  "화상": 1,
  "출혈": 2,
  "진동": 3,
  "파열": 4,
  "침잠": 5,
  "호흡": 6,
  "충전": 7,
  "참격": 8,
  "관통": 9,
  "타격": 10,
  "범용": 11,
  "EX": 12
};

async function loadGifts() {
  try {
    const snapshot = await window.fb.getDocs(
      window.fb.collection(window.db, "gifts")
    );

    gifts = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    sortGifts();
    console.log("불러온 기프트:", gifts);
  } catch (error) {
    console.error("기프트 불러오기 실패:", error);

    const list = document.getElementById("gift-list");
    if (list) {
      list.innerHTML = `<div class="empty-message">데이터를 불러오지 못했습니다.</div>`;
    }
  }
}

function sortGifts() {
  gifts.sort((a, b) => {
    const aKeyword = keywordOrder[a.keyword] || 99;
    const bKeyword = keywordOrder[b.keyword] || 99;

    if (aKeyword !== bKeyword) return aKeyword - bKeyword;
    if ((a.grade || 0) !== (b.grade || 0)) return (a.grade || 0) - (b.grade || 0);

    return String(a.name || "").localeCompare(String(b.name || ""), "ko");
  });
}

function toRoman(num) {
  const romanMap = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V"
  };
  return romanMap[num] || "";
}

/* =========================
   권한 / UI
========================= */
function isAdmin() {
  if (!currentUserData) return false;
  return currentUserData.userId === ADMIN_ID || currentUserData.isAdmin === true;
}

function updateAdminUI() {
  const adminSection = document.getElementById("admin-section");
  if (!adminSection) return;
  adminSection.style.display = isAdmin() ? "block" : "none";
}

function updateKeywordFilterUI() {
  const buttons = document.querySelectorAll(".keyword-btn");

  buttons.forEach((btn) => {
    const keyword = btn.dataset.keyword;
    btn.classList.toggle("active", selectedKeywords.includes(keyword));
  });
}

function isOnlyEXSelected() {
  return selectedKeywords.length === 1 && selectedKeywords.includes("EX");
}

function hasOnlyNormalKeywordsSelected() {
  const normalKeywords = [
    "화상", "출혈", "진동", "파열", "침잠",
    "호흡", "충전", "참격", "관통", "타격"
  ];

  if (selectedKeywords.includes("전체")) return false;
  if (selectedKeywords.includes("EX")) return false;
  if (selectedKeywords.includes("범용")) return false;

  return selectedKeywords.length > 0 &&
    selectedKeywords.every((keyword) => normalKeywords.includes(keyword));
}

function updateGradeFilterUI() {
  const filterWrap = document.querySelector(".grade-filter");
  const buttons = document.querySelectorAll(".grade-btn");

  const onlyEX = isOnlyEXSelected();
  const hideGrade5 = hasOnlyNormalKeywordsSelected();

  if (filterWrap) {
    filterWrap.style.display = onlyEX ? "none" : "flex";
  }

  buttons.forEach((btn) => {
    const grade = Number(btn.dataset.grade);

    btn.classList.toggle("active", selectedGrades.includes(grade));

    if (grade === 5) {
      btn.style.display = hideGrade5 ? "flex" : "flex";
      if (hideGrade5) btn.style.display = "none";
    } else {
      btn.style.display = "flex";
    }
  });

  if (hideGrade5 && selectedGrades.includes(5)) {
    selectedGrades = selectedGrades.filter((grade) => grade !== 5);
  }
}

/* =========================
   렌더링
========================= */
function renderGifts() {
  const list = document.getElementById("gift-list");
  if (!list) return;

  list.innerHTML = "";

  const filtered = gifts.filter((gift) => {
    const keywordMatch =
      selectedKeywords.includes("전체") ||
      selectedKeywords.length === 0 ||
      selectedKeywords.includes(gift.keyword);

    const gradeMatch =
      selectedGrades.length === 0 || selectedGrades.includes(Number(gift.grade));

    const presetMatch =
      !activePresetSlotId ||
      (
        currentPresets?.[activePresetSlotId] &&
        Array.isArray(currentPresets[activePresetSlotId].giftIds) &&
        currentPresets[activePresetSlotId].giftIds.includes(gift.id)
      );

    return keywordMatch && gradeMatch && presetMatch;
  });

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-message">표시할 기프트가 없습니다.</div>`;
    return;
  }

  filtered.forEach((gift) => {
    const card = document.createElement("div");
    card.className = "gift-card";

    if (selectedGiftIds.includes(gift.id)) {
      card.classList.add("selected");
    }

    if (gift.keyword === "EX") {
      card.classList.add("gift-card-ex");
    }

    const keywordIconMap = {
      "화상": "images/burn/화상.png",
      "출혈": "images/bleed/출혈.png",
      "진동": "images/vibration/진동.png",
      "파열": "images/rupture/파열.png",
      "침잠": "images/sinking/침잠.png",
      "호흡": "images/breath/호흡.png",
      "충전": "images/charge/충전.png",
      "참격": "images/slash/참격.png",
      "관통": "images/pierce/관통.png",
      "타격": "images/blunt/타격.png"
    };

    const keywordIconHtml = keywordIconMap[gift.keyword]
      ? `<img src="${keywordIconMap[gift.keyword]}" class="keyword-icon" alt="${escapeAttr(gift.keyword)}" onerror="this.style.display='none'">`
      : "";

    card.innerHTML = `
      <div class="gift-card-inner">
        <div class="gift-top">
          <div class="gift-name">${escapeHtml(gift.name || "이름 없음")}</div>
        </div>

        <div class="gift-icon-wrap">
          ${
            gift.keyword === "EX"
              ? `<div class="ex-badge">EX</div>`
              : gift.grade
                ? `<div class="grade-badge">${toRoman(Number(gift.grade))}</div>`
                : ""
          }
          <img src="images/frame.png" class="gift-frame" alt="프레임">
          ${
            gift.img
              ? `<img src="${escapeAttr(gift.img)}" alt="${escapeAttr(gift.name || "기프트")}" class="gift-icon" onerror="this.style.display='none'">`
              : ""
          }
          ${keywordIconHtml}
        </div>
      </div>
    `;

    card.addEventListener("click", async () => {
      if (isAdmin()) {
        fillAdminForm(gift);
      }
      await toggleGiftSelection(gift.id);
    });

    card.style.cursor = "pointer";
    list.appendChild(card);
  });
}

function updatePresetViewBar() {
  const bar = document.getElementById("preset-view-bar");
  const title = document.getElementById("preset-view-title");

  if (!bar || !title) return;

  if (!activePresetSlotId || !currentPresets?.[activePresetSlotId]) {
    bar.style.display = "none";
    title.textContent = "";
    return;
  }

  const preset = currentPresets[activePresetSlotId];
  bar.style.display = "flex";
  title.textContent = `프리셋 보기 - ${preset.name || activePresetSlotId}`;
}

window.openPresetView = function (slotId) {
  const preset = currentPresets?.[slotId];

  if (!preset || !Array.isArray(preset.giftIds)) {
    alert("저장된 프리셋이 없습니다.");
    return;
  }

  activePresetSlotId = slotId;
  updatePresetViewBar();
  renderGifts();
};

window.closePresetView = function () {
  activePresetSlotId = null;
  updatePresetViewBar();
  renderGifts();
};

function renderPresetPanel() {
  const panel = document.getElementById("preset-panel");
  const list = document.getElementById("preset-list");
  const loginGuide = document.getElementById("preset-login-guide");

  if (!panel || !list) return;

  if (!window.auth?.currentUser) {
    if (loginGuide) loginGuide.style.display = "block";

    list.innerHTML = getPresetSlotIds().map((slotId, index) => `
      <div class="preset-card">
        <div class="preset-card-top">
          <div class="preset-slot">프리셋 ${index + 1}</div>
          <div class="preset-count">-</div>
        </div>

        <input
          type="text"
          class="preset-name-input"
          placeholder="로그인 필요"
          disabled
        />

        <div class="preset-actions preset-actions-4">
          <button type="button" disabled>저장</button>
          <button type="button" disabled>수정</button>
          <button type="button" disabled>불러오기</button>
          <button type="button" disabled>삭제</button>
        </div>
      </div>
    `).join("");

    return;
  }

  if (loginGuide) loginGuide.style.display = "none";

  list.innerHTML = getPresetSlotIds().map((slotId, index) => {
    const preset = currentPresets?.[slotId];
    const hasPreset = !!preset;
    const count = hasPreset && Array.isArray(preset.giftIds) ? preset.giftIds.length : 0;
    const presetName = hasPreset ? (preset.name || `프리셋 ${index + 1}`) : "";
    const isEditing = editingPresetSlotId === slotId;

    return `
      <div class="preset-card ${hasPreset ? "clickable" : ""}" ${hasPreset ? `onclick="openPresetView('${slotId}')"` : ""}>
        <div class="preset-card-top">
          <div class="preset-slot">프리셋 ${index + 1}</div>
          <div class="preset-count">${hasPreset ? `${count}개` : "-"}</div>
        </div>

        <input
          type="text"
          id="preset-name-${slotId}"
          class="preset-name-input ${hasPreset ? "" : "empty"}"
          placeholder="이름 입력"
          value="${escapeAttr(presetName)}"
          ${isEditing ? "" : "readonly"}
          onclick="event.stopPropagation()"
          onkeydown="if(event.key==='Enter'){ event.preventDefault(); finishPresetRename('${slotId}'); }"
        />

        <div class="preset-actions preset-actions-4" onclick="event.stopPropagation()">
          <button type="button" onclick="savePreset('${slotId}')">저장</button>
          ${
            isEditing
              ? `<button type="button" onclick="finishPresetRename('${slotId}')">완료</button>`
              : `<button type="button" onclick="startPresetRename('${slotId}')">수정</button>`
          }
          <button type="button" onclick="loadPreset('${slotId}')" ${hasPreset ? "" : "disabled"}>불러오기</button>
          <button type="button" onclick="deletePreset('${slotId}')" ${hasPreset ? "" : "disabled"}>삭제</button>
        </div>
      </div>
    `;
  }).join("");
}

/* =========================
   필터
========================= */
window.toggleKeywordFilter = function (keyword) {
  if (keyword === "전체") {
    selectedKeywords = ["전체"];
    updateKeywordFilterUI();
    updateGradeFilterUI();
    renderGifts();
    return;
  }

  selectedKeywords = selectedKeywords.filter((item) => item !== "전체");

  const index = selectedKeywords.indexOf(keyword);

  if (index >= 0) {
    selectedKeywords.splice(index, 1);
  } else {
    selectedKeywords.push(keyword);
  }

  if (selectedKeywords.length === 0) {
    selectedKeywords = ["전체"];
  }

  updateKeywordFilterUI();
  updateGradeFilterUI();
  renderGifts();
};

window.resetKeywordFilter = function () {
  const ok = confirm("선택한 키워드를 초기화하시겠습니까?");
  if (!ok) return;

  selectedKeywords = ["전체"];
  selectedGrades = [];
  updateKeywordFilterUI();
  updateGradeFilterUI();
  renderGifts();
};

window.toggleGradeFilter = function (grade) {
  const numGrade = Number(grade);
  const index = selectedGrades.indexOf(numGrade);

  if (index >= 0) {
    selectedGrades.splice(index, 1);
  } else {
    selectedGrades.push(numGrade);
  }

  updateGradeFilterUI();
  renderGifts();
};

/* =========================
   선택 저장
========================= */
async function loadSelectedGifts() {
  if (!window.auth?.currentUser) {
    selectedGiftIds = JSON.parse(localStorage.getItem("selectedGiftIds") || "[]");
    return;
  }

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);
    const snap = await window.fb.getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      selectedGiftIds = Array.isArray(data.selectedGiftIds) ? data.selectedGiftIds : [];
    } else {
      selectedGiftIds = [];
    }
  } catch (error) {
    console.error("선택 기프트 불러오기 실패:", error);
    selectedGiftIds = [];
  }
}

async function saveSelectedGifts() {
  if (!window.auth?.currentUser) {
    localStorage.setItem("selectedGiftIds", JSON.stringify(selectedGiftIds));
    return;
  }

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);

    await window.fb.setDoc(ref, { selectedGiftIds }, { merge: true });
  } catch (error) {
    console.error("선택 기프트 저장 실패:", error);
  }
}

async function toggleGiftSelection(giftId) {
  const index = selectedGiftIds.indexOf(giftId);

  if (index >= 0) {
    selectedGiftIds.splice(index, 1);
  } else {
    selectedGiftIds.push(giftId);
  }

  await saveSelectedGifts();
  renderGifts();
}

window.resetSelectedGifts = async function () {
  const ok = confirm("선택한 기프트를 모두 초기화하시겠습니까?");
  if (!ok) return;

  selectedGiftIds = [];
  await saveSelectedGifts();
  renderGifts();
};

/* =========================
   프리셋
========================= */
function getPresetSlotIds() {
  return Array.from({ length: PRESET_SLOT_COUNT }, (_, i) => `preset_${i + 1}`);
}

function getDeleteFieldValue() {
  if (typeof window.fb?.deleteField === "function") {
    return window.fb.deleteField();
  }

  throw new Error("firebase-init.js에 deleteField 연결이 필요합니다.");
}

async function loadPresets() {
  if (!window.auth?.currentUser) {
    currentPresets = {};
    renderPresetPanel();
    return;
  }

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);
    const snap = await window.fb.getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      currentPresets = data.presets && typeof data.presets === "object"
        ? data.presets
        : {};
    } else {
      currentPresets = {};
    }
  } catch (error) {
    console.error("프리셋 불러오기 실패:", error);
    currentPresets = {};
  }

  renderPresetPanel();
}

async function savePreset(slotId) {
  if (!window.auth?.currentUser) {
    alert("로그인 후 사용할 수 있습니다.");
    return;
  }

  const input = document.getElementById(`preset-name-${slotId}`);
  const presetName = input ? input.value.trim() : "";

  if (!presetName) {
    alert("프리셋 이름을 입력해주세요.");
    if (input) input.focus();
    return;
  }

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);

    const nextPreset = {
      name: presetName,
      giftIds: [...selectedGiftIds],
      updatedAt: new Date().toISOString()
    };

    await window.fb.setDoc(ref, {
      presets: {
        [slotId]: nextPreset
      }
    }, { merge: true });

    currentPresets[slotId] = nextPreset;
    editingPresetSlotId = null;
    renderPresetPanel();
    updatePresetViewBar();
    alert(`"${presetName}" 프리셋 저장 완료`);
  } catch (error) {
    console.error("프리셋 저장 실패:", error);
    alert("프리셋 저장 실패");
  }
}

async function loadPreset(slotId) {
  if (!window.auth?.currentUser) {
    alert("로그인 후 사용할 수 있습니다.");
    return;
  }

  const preset = currentPresets?.[slotId];

  if (!preset || !Array.isArray(preset.giftIds)) {
    alert("저장된 프리셋이 없습니다.");
    return;
  }

  selectedGiftIds = [...preset.giftIds];
  await saveSelectedGifts();
  renderGifts();

  alert(`"${preset.name || slotId}" 프리셋 불러오기 완료`);
}

async function deletePreset(slotId) {
  if (!window.auth?.currentUser) {
    alert("로그인 후 사용할 수 있습니다.");
    return;
  }

  const preset = currentPresets?.[slotId];
  if (!preset) {
    alert("삭제할 프리셋이 없습니다.");
    return;
  }

  const ok = confirm(`"${preset.name || slotId}" 프리셋을 삭제할까요?`);
  if (!ok) return;

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);

    await window.fb.setDoc(ref, {
      presets: {
        [slotId]: getDeleteFieldValue()
      }
    }, { merge: true });

    delete currentPresets[slotId];
    renderPresetPanel();
    alert("프리셋 삭제 완료");
  } catch (error) {
    console.error("프리셋 삭제 실패:", error);
    alert(error.message || "프리셋 삭제 실패");
  }
}

window.savePreset = savePreset;
window.loadPreset = loadPreset;
window.deletePreset = deletePreset;

/* =========================
   관리자 폼
========================= */
function fillAdminForm(gift) {
  const idInput = document.getElementById("gift-id");
  const nameInput = document.getElementById("gift-name");
  const keywordInput = document.getElementById("gift-keyword");
  const gradeInput = document.getElementById("gift-grade");
  const imgInput = document.getElementById("gift-img");

  if (!idInput || !nameInput || !keywordInput || !gradeInput || !imgInput) return;

  idInput.value = gift.id || "";
  nameInput.value = gift.name || "";
  keywordInput.value = gift.keyword || "";
  gradeInput.value = gift.grade ?? "";
  imgInput.value = gift.img || "";
  updatePreview();
}

window.clearAdminForm = function () {
  const idInput = document.getElementById("gift-id");
  const nameInput = document.getElementById("gift-name");
  const keywordInput = document.getElementById("gift-keyword");
  const gradeInput = document.getElementById("gift-grade");
  const imgInput = document.getElementById("gift-img");
  const preview = document.getElementById("preview-img");

  if (idInput) idInput.value = "";
  if (nameInput) nameInput.value = "";
  if (keywordInput) keywordInput.value = "";
  if (gradeInput) gradeInput.value = "";
  if (imgInput) imgInput.value = "";

  if (preview) {
    preview.style.display = "none";
    preview.removeAttribute("src");
  }
};

window.addGift = async function () {
  if (!isAdmin()) {
    alert("관리자만 추가할 수 있어.");
    return;
  }

  const id = document.getElementById("gift-id")?.value.trim();
  const name = document.getElementById("gift-name")?.value.trim();
  const keyword = document.getElementById("gift-keyword")?.value;
  const gradeValue = document.getElementById("gift-grade")?.value;
  const img = document.getElementById("gift-img")?.value.trim();

  if (!id) {
    alert("문서 ID를 입력해줘.");
    return;
  }

  if (!name) {
    alert("기프트 이름을 입력해줘.");
    return;
  }

  if (!keyword) {
    alert("키워드를 선택해줘.");
    return;
  }

  const grade = gradeValue === "" ? 0 : Number(gradeValue);

  try {
    const ref = window.fb.doc(window.db, "gifts", id);

    await window.fb.setDoc(ref, {
      name,
      keyword,
      grade,
      img
    });

    clearAdminForm();
    await loadGifts();
    renderGifts();
  } catch (error) {
    console.error("기프트 추가 실패:", error);
    alert("추가 실패");
  }
};

window.updateGift = async function () {
  if (!isAdmin()) {
    alert("관리자만 수정할 수 있어.");
    return;
  }

  const id = document.getElementById("gift-id")?.value.trim();
  const name = document.getElementById("gift-name")?.value.trim();
  const keyword = document.getElementById("gift-keyword")?.value;
  const gradeValue = document.getElementById("gift-grade")?.value;
  const img = document.getElementById("gift-img")?.value.trim();

  if (!id) {
    alert("수정할 문서 ID가 필요해.");
    return;
  }

  if (!name) {
    alert("기프트 이름을 입력해줘.");
    return;
  }

  if (!keyword) {
    alert("키워드를 선택해줘.");
    return;
  }

  const grade = gradeValue === "" ? 0 : Number(gradeValue);

  try {
    const ref = window.fb.doc(window.db, "gifts", id);

    await window.fb.updateDoc(ref, {
      name,
      keyword,
      grade,
      img
    });

    clearAdminForm();
    await loadGifts();
    renderGifts();
  } catch (error) {
    console.error("기프트 수정 실패:", error);
    alert("수정 실패");
  }
};

window.deleteGift = async function () {
  if (!isAdmin()) {
    alert("관리자만 삭제할 수 있어.");
    return;
  }

  const id = document.getElementById("gift-id")?.value.trim();

  if (!id) {
    alert("삭제할 문서 ID가 필요해.");
    return;
  }

  try {
    const ref = window.fb.doc(window.db, "gifts", id);
    await window.fb.deleteDoc(ref);

    clearAdminForm();
    await loadGifts();
    renderGifts();
  } catch (error) {
    console.error("기프트 삭제 실패:", error);
    alert("삭제 실패");
  }
};

/* =========================
   미리보기
========================= */
window.updatePreview = function () {
  const imgInput = document.getElementById("gift-img");
  const preview = document.getElementById("preview-img");

  if (!imgInput || !preview) return;

  const value = imgInput.value.trim();

  if (!value) {
    preview.style.display = "none";
    preview.removeAttribute("src");
    return;
  }

  preview.onload = () => {
    preview.style.display = "block";
  };

  preview.onerror = () => {
    preview.style.display = "none";
    preview.removeAttribute("src");
    console.log("미리보기 이미지 로드 실패:", value);
  };

  preview.src = value;
};

/* =========================
   일괄 추가
========================= */
window.clearBulkJson = function () {
  const textarea = document.getElementById("bulk-json");
  if (textarea) textarea.value = "";
};

window.bulkAddGifts = async function () {
  if (!isAdmin()) {
    alert("관리자만 추가할 수 있어.");
    return;
  }

  const textarea = document.getElementById("bulk-json");
  if (!textarea) return;

  const raw = textarea.value.trim();
  if (!raw) {
    alert("내용을 입력해줘.");
    return;
  }

  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line);

  try {
    for (const line of lines) {
      const parts = line.split("|").map((part) => part.trim());
      const [id, name, keyword, gradeStr, img] = parts;

      if (!id || !name || !keyword) {
        throw new Error(`형식 오류: ${line}`);
      }

      if (![
        "화상", "출혈", "진동", "파열", "침잠",
        "호흡", "충전", "참격", "관통", "타격",
        "범용", "EX"
      ].includes(keyword)) {
        throw new Error(`키워드 오류: ${line}`);
      }

      const grade = gradeStr === "" || gradeStr == null ? 0 : Number(gradeStr);
      if (Number.isNaN(grade)) {
        throw new Error(`등급 오류: ${line}`);
      }

      const ref = window.fb.doc(window.db, "gifts", id);

      await window.fb.setDoc(ref, {
        name,
        keyword,
        grade,
        img: img || ""
      });
    }

    textarea.value = "";
    await loadGifts();
    renderGifts();
    alert(`총 ${lines.length}개 추가 완료`);
  } catch (error) {
    console.error("일괄 추가 실패:", error);
    alert(error.message || "일괄 추가 실패");
  }
};

/* =========================
   인증 / 모달
========================= */
window.openLoginModal = function () {
  const modal = document.getElementById("login-modal");
  if (modal) modal.style.display = "flex";
};

window.closeLoginModal = function () {
  const modal = document.getElementById("login-modal");
  if (modal) modal.style.display = "none";
};

window.openSignupModal = function () {
  const modal = document.getElementById("signup-modal");
  if (modal) modal.style.display = "flex";
};

window.closeSignupModal = function () {
  const modal = document.getElementById("signup-modal");
  if (modal) modal.style.display = "none";
};

function setupEnterKeySubmit() {
  const loginId = document.getElementById("login-id");
  const loginPw = document.getElementById("login-password");

  const signupId = document.getElementById("signup-id");
  const signupNickname = document.getElementById("signup-nickname");
  const signupPw = document.getElementById("signup-password");
  const signupPw2 = document.getElementById("signup-password-confirm");

  [loginId, loginPw].forEach((input) => {
    if (!input) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        login();
      }
    });
  });

  [signupId, signupNickname, signupPw, signupPw2].forEach((input) => {
    if (!input) return;
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        signup();
      }
    });
  })
}
async function getUserDocByUid(uid) {
  const ref = window.fb.doc(window.db, "users", uid);
  const snap = await window.fb.getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

async function findUserByUserId(userId) {
  const q = window.fb.query(
    window.fb.collection(window.db, "users"),
    window.fb.where("userId", "==", userId),
    window.fb.limit(1)
  );

  const snap = await window.fb.getDocs(q);

  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return {
    uid: docSnap.id,
    ...docSnap.data()
  };
}

window.signup = async function () {
  const userId = document.getElementById("signup-id")?.value.trim();
  const nickname = document.getElementById("signup-nickname")?.value.trim();
  const pw = document.getElementById("signup-password")?.value;
  const pw2 = document.getElementById("signup-password-confirm")?.value;

  if (!userId || !nickname || !pw || !pw2) {
    alert("모든 항목을 입력해주세요.");
    return;
  }

  if (pw !== pw2) {
    alert("비밀번호가 일치하지 않습니다.");
    return;
  }

  try {
    const existingUser = await findUserByUserId(userId);
    if (existingUser) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    const email = `${userId}@mirrorgift.local`;

    const cred = await window.fb.createUserWithEmailAndPassword(
      window.auth,
      email,
      pw
    );

    await window.fb.setDoc(
      window.fb.doc(window.db, "users", cred.user.uid),
      {
        userId,
        nickname,
        email,
        isAdmin: userId === ADMIN_ID,
        createdAt: new Date().toISOString()
      }
    );

    alert("회원가입이 완료되었습니다.");
    closeSignupModal();
  } catch (e) {
    console.error(e);
    alert(e.message || "회원가입 실패");
  }
};

window.login = async function () {
  const userId = document.getElementById("login-id")?.value.trim();
  const pw = document.getElementById("login-password")?.value;

  if (!userId || !pw) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const userData = await findUserByUserId(userId);

    if (!userData) {
      alert("존재하지 않는 아이디입니다.");
      return;
    }

    await window.fb.signInWithEmailAndPassword(window.auth, userData.email, pw);
    alert("로그인 성공");
    closeLoginModal();
  } catch (e) {
    console.error(e);
    alert("로그인 실패");
  }
};

window.logout = async function () {
  try {
    await window.fb.signOut(window.auth);
  } catch (e) {
    console.error(e);
    alert("로그아웃 실패");
  }
};

function setupAuthUI() {
  window.fb.onAuthStateChanged(window.auth, async (user) => {
    const status = document.getElementById("auth-status");
    const logoutBtn = document.getElementById("logout-btn");
    const loginOpenBtn = document.getElementById("login-open-btn");
    const signupOpenBtn = document.getElementById("signup-open-btn");

    if (user) {
      const userDoc = await getUserDocByUid(user.uid);
      currentUserData = userDoc;

      const nameText =
        userDoc?.nickname || userDoc?.userId || user.email || "사용자";

      if (status) status.textContent = `${nameText} 로그인 상태`;
      if (logoutBtn) logoutBtn.style.display = "inline-block";
      if (loginOpenBtn) loginOpenBtn.style.display = "none";
      if (signupOpenBtn) signupOpenBtn.style.display = "none";
    } else {
      currentUserData = null;

      if (status) status.textContent = "비로그인 상태";
      if (logoutBtn) logoutBtn.style.display = "none";
      if (loginOpenBtn) loginOpenBtn.style.display = "inline-block";
      if (signupOpenBtn) signupOpenBtn.style.display = "inline-block";
    }

    updateAdminUI();
    await loadSelectedGifts();
    await loadPresets();
    updateKeywordFilterUI();
    updateGradeFilterUI();
    updatePresetViewBar();
    renderGifts();
    renderPresetPanel();
  });
}

window.startPresetRename = function (slotId) {
  editingPresetSlotId = slotId;
  renderPresetPanel();

  const input = document.getElementById(`preset-name-${slotId}`);
  if (input) {
    input.removeAttribute("readonly");
    input.focus();
    input.select();
  }
};

window.finishPresetRename = async function (slotId) {
  if (!window.auth?.currentUser) {
    alert("로그인 후 사용할 수 있습니다.");
    return;
  }

  const input = document.getElementById(`preset-name-${slotId}`);
  if (!input) return;

  const newName = input.value.trim();
  if (!newName) {
    alert("이름을 입력해주세요.");
    input.focus();
    return;
  }

  const existing = currentPresets?.[slotId];
  const giftIds = Array.isArray(existing?.giftIds) ? existing.giftIds : [];

  try {
    const uid = window.auth.currentUser.uid;
    const ref = window.fb.doc(window.db, "users", uid);

    const nextPreset = {
      name: newName,
      giftIds,
      updatedAt: new Date().toISOString()
    };

    await window.fb.setDoc(ref, {
      presets: {
        [slotId]: nextPreset
      }
    }, { merge: true });

    currentPresets[slotId] = nextPreset;
    editingPresetSlotId = null;
    renderPresetPanel();
    updatePresetViewBar();
  } catch (error) {
    console.error("프리셋 이름 수정 실패:", error);
    alert("프리셋 이름 수정 실패");
  }
};

/* =========================
   유틸
========================= */
function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

waitForFirebaseAndStart();