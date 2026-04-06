let currentFilter = "전체";
let selectedGiftIds = new Set();
let firebaseReady = false;

let pendingSignup = {
  username: "",
  password: "",
  nickname: ""
};

const gifts = [
  { id: "ex_1", name: "부", img: "images/ex/부.png", keyword: "EX", checked: false },
  { id: "ex_2", name: "어떤 철학", img: "images/ex/어떤철학.png", keyword: "EX", checked: false },

  // 화상
  { id: "burn_1_1", name: "융해된 파라핀", img: "images/burn/융해된파라핀.png", keyword: "화상", grade: 1, checked: false },
  { id: "burn_1_2", name: "재에서 재로", img: "images/burn/재에서재로.png", keyword: "화상", grade: 1, checked: false },
  { id: "burn_1_3", name: "타오르는 지성", img: "images/burn/타오르는지성.png", keyword: "화상", grade: 1, checked: false },
  { id: "burn_1_4", name: "편광", img: "images/burn/편광.png", keyword: "화상", grade: 1, checked: false },

  { id: "burn_2_1", name: "울화통", img: "images/burn/울화통.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_2", name: "일점타격논리회로", img: "images/burn/일점타격논리회로.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_3", name: "작열우모", img: "images/burn/작열우모.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_4", name: "지옥나비의 꿈", img: "images/burn/지옥나비의꿈.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_5", name: "만년 동안 끓는 솥", img: "images/burn/만년동안끓는솥.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_6", name: "만년 화롯불", img: "images/burn/만년화롯불.png", keyword: "화상", grade: 2, checked: false },
  { id: "burn_2_7", name: "혈염도", img: "images/burn/혈염도.png", keyword: "화상", grade: 2, checked: false },

  { id: "burn_3_1", name: "그을린 원반", img: "images/burn/그을린원반.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_2", name: "먼지에서 먼지로", img: "images/burn/먼지에서먼지로.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_3", name: "불빛꽃", img: "images/burn/불빛꽃.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_4", name: "뜨거운 육즙 다리살", img: "images/burn/뜨거운육즙다리살.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_5", name: "로열 젤리 퍼퓸", img: "images/burn/로열젤리퍼퓸.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_6", name: "잔불", img: "images/burn/잔불.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_7", name: "재점화 플러그", img: "images/burn/재점화플러그.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_8", name: "점화 장갑", img: "images/burn/점화장갑.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_9", name: "붉은색 넥타이", img: "images/burn/붉은색넥타이.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_10", name: "시험추출 : 홍염살", img: "images/burn/시험추출홍염살.png", keyword: "화상", grade: 3, checked: false },
  { id: "burn_3_11", name: "요리 비법 전서", img: "images/burn/요리비법전서.png", keyword: "화상", grade: 3, checked: false },

  { id: "burn_4_1", name: "불꽃의 편린", img: "images/burn/불꽃의편린.png", keyword: "화상", grade: 4, checked: false },
  { id: "burn_4_2", name: "업화 조각", img: "images/burn/업화조각.png", keyword: "화상", grade: 4, checked: false },
  { id: "burn_4_3", name: "부화하지 않은 불씨", img: "images/burn/부화하지않은불씨.png", keyword: "화상", grade: 4, checked: false },
  { id: "burn_4_4", name: "진혼", img: "images/burn/진혼.png", keyword: "화상", grade: 4, checked: false },
  { id: "burn_4_5", name: "훔쳐온 불꽃", img: "images/burn/훔쳐온불꽃.png", keyword: "화상", grade: 4, checked: false },
  { id: "burn_4_6", name: "제식 복장 - 리우 협회", img: "images/burn/제식복장리우협회.png", keyword: "화상", grade: 4, checked: false },

  // 출혈
  { id: "bleed_1_1", name: "녹슨 입마개", img: "images/bleed/녹슨입마개.png", keyword: "출혈", grade: 1, checked: false },
  { id: "bleed_1_2", name: "늘어붙은 쇠말뚝", img: "images/bleed/늘어붙은쇠말뚝.png", keyword: "출혈", grade: 1, checked: false },
  { id: "bleed_1_3", name: "덧붙인 반창고", img: "images/bleed/덧붙인반창고.png", keyword: "출혈", grade: 1, checked: false },
  { id: "bleed_1_4", name: "억류된 찬송", img: "images/bleed/억류된찬송.png", keyword: "출혈", grade: 1, checked: false },
  { id: "bleed_1_5", name: "옭아맨 타래", img: "images/bleed/옭아맨타래.png", keyword: "출혈", grade: 1, checked: false },

  { id: "bleed_2_1", name: "경외심", img: "images/bleed/경외심.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_2", name: "밀라르카", img: "images/bleed/밀라르카.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_3", name: "상처붙이", img: "images/bleed/상처붙이.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_4", name: "작고 나쁠 인형", img: "images/bleed/작고나쁠인형.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_5", name: "전혈 플라스크", img: "images/bleed/전혈플라스크.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_6", name: "흰 목화", img: "images/bleed/흰목화.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_7", name: "결정화된 혈액", img: "images/bleed/결정화된혈액.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_8", name: "못과 망치의 책", img: "images/bleed/못과망치의책.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_9", name: "불결함", img: "images/bleed/불결함.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_10", name: "오염된 실과 바늘", img: "images/bleed/오염된실과바늘.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_11", name: "워킹 베이스", img: "images/bleed/워킹베이스.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_12", name: "치사랑", img: "images/bleed/치사랑.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_13", name: "범작", img: "images/bleed/범작.png", keyword: "출혈", grade: 2, checked: false },
  { id: "bleed_2_14", name: "새하얀 캔버스", img: "images/bleed/새하얀캔버스.png", keyword: "출혈", grade: 2, checked: false },

  { id: "bleed_3_1", name: "녹슨 커터 나이프", img: "images/bleed/녹슨커터나이프.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_2", name: "안식처", img: "images/bleed/안식처.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_3", name: "연기와 철조망", img: "images/bleed/연기와철조망.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_4", name: "혈향도래", img: "images/bleed/혈향도래.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_5", name: "찢어진 피주머니", img: "images/bleed/찢어진피주머니.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_6", name: "갇힌 구더기", img: "images/bleed/갇힌구더기.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_7", name: "부리 모양 목걸이", img: "images/bleed/부리모양목걸이.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_8", name: "열선 무기", img: "images/bleed/열선무기.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_9", name: "조각난 칼날", img: "images/bleed/조각난칼날.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_10", name: "하모닉스", img: "images/bleed/하모닉스.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_11", name: "경혈식 글레이브", img: "images/bleed/경혈식글레이브.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_12", name: "라만차랜드 자유이용권", img: "images/bleed/라만차랜드자유이용권.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_13", name: "승리의 증표", img: "images/bleed/승리의증표.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_14", name: "피로 된 살점, 살점으로 된 피", img: "images/bleed/피로된살점살점으로된피.png", keyword: "출혈", grade: 3, checked: false },
  { id: "bleed_3_15", name: "치성", img: "images/bleed/치성.png", keyword: "출혈", grade: 3, checked: false },

  { id: "bleed_4_1", name: "매혹 조각", img: "images/bleed/매혹조각.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_2", name: "붉게 물든 목화", img: "images/bleed/붉게물든목화.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_3", name: "가족의 원망", img: "images/bleed/가족의원망.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_4", name: "떨어진 한 방울", img: "images/bleed/떨어진한방울.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_5", name: "탐하는 가시", img: "images/bleed/탐하는가시.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_6", name: "퍼레이드의 가면", img: "images/bleed/퍼레이드의가면.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_7", name: "피안개", img: "images/bleed/피안개.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_8", name: "출혈성 쇼크", img: "images/bleed/출혈성쇼크.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_9", name: "완전함", img: "images/bleed/완전함.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_10", name: "미니어처 대관람차", img: "images/bleed/미니어처대관람차.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_11", name: "수작", img: "images/bleed/수작.png", keyword: "출혈", grade: 4, checked: false },
  { id: "bleed_4_12", name: "절경", img: "images/bleed/절경.png", keyword: "출혈", grade: 4, checked: false }
];

const list = document.getElementById("list");

function toRoman(num) {
  const map = ["", "I", "II", "III", "IV", "V"];
  return map[num] || num;
}

function usernameToEmail(username) {
  return `${username}@mirrorgift.local`;
}

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{4,20}$/.test(username);
}

function applyCheckedFromSet() {
  gifts.forEach(gift => {
    gift.checked = selectedGiftIds.has(gift.id);
  });
}

function createGiftCard(gift) {
  const div = document.createElement("div");
  div.className =
    "card" +
    (gift.keyword === "EX" ? " ex-card" : "") +
    (gift.checked ? " checked" : "");

  const keywordClass =
    gift.keyword === "EX" ? "keyword ex" :
    gift.keyword === "화상" ? "keyword burn" :
    gift.keyword === "출혈" ? "keyword bleed" :
    "keyword";

  div.innerHTML = `
    <div class="image-wrap">
      <img src="images/frame.png" class="frame" alt="프레임">
      ${gift.keyword === "EX"
        ? `<div class="grade-badge ex-badge">EX</div>`
        : gift.grade
          ? `<div class="grade-badge">${toRoman(gift.grade)}</div>`
          : ""
      }
      <img src="${gift.img}" class="icon" alt="${gift.name}" onerror="this.style.display='none'">
    </div>
    <div class="name">${gift.name}</div>
    <div class="${keywordClass}">${gift.keyword === "EX" ? "" : gift.keyword}</div>
  `;

  div.onclick = async () => {
    gift.checked = !gift.checked;

    if (gift.checked) {
      selectedGiftIds.add(gift.id);
    } else {
      selectedGiftIds.delete(gift.id);
    }

    render();
    await saveGiftState();
  };

  return div;
}

function createBurnCell(gift) {
  const cell = document.createElement("div");
  cell.className = "burn-cell compact-cell" + (gift.checked ? " checked" : "");

  const badgeMap = {
    "화상": "images/burn/화상.png",
    "출혈": "images/bleed/출혈.png"
  };

  cell.innerHTML = `
    <div class="mini-wrap">
      <img src="images/frame.png" class="mini-frame" alt="프레임">
      <div class="mini-grade">${toRoman(gift.grade)}</div>
      <img src="${gift.img}" class="mini-icon" alt="${gift.name}" onerror="this.style.display='none'">
      ${badgeMap[gift.keyword] ? `<img src="${badgeMap[gift.keyword]}" class="keyword-badge" alt="${gift.keyword}">` : ""}
    </div>
    <div class="burn-name">${gift.name}</div>
  `;

  cell.onclick = async () => {
    gift.checked = !gift.checked;

    if (gift.checked) {
      selectedGiftIds.add(gift.id);
    } else {
      selectedGiftIds.delete(gift.id);
    }

    render();
    await saveGiftState();
  };

  return cell;
}

function renderBurnSection(section, filtered) {
  const container = document.createElement("div");
  container.className = "grade-grid-2x2 compact-grade-grid";

  [1, 2, 3, 4].forEach(grade => {
    const gradeGifts = filtered.filter(g => g.grade === grade);

    const block = document.createElement("div");
    block.className = `grade-block grid-grade-block compact-grade-block grade-${grade} keyword-${filtered[0].keyword}`;

    const gradeCell = document.createElement("div");
    gradeCell.className = "burn-grade grid-burn-grade compact-burn-grade";
    gradeCell.textContent = toRoman(grade);

    const cells = document.createElement("div");
    cells.className = "burn-cells grid-burn-cells compact-burn-cells";

    gradeGifts.forEach(gift => {
      cells.appendChild(createBurnCell(gift));
    });

    block.appendChild(gradeCell);
    block.appendChild(cells);
    container.appendChild(block);
  });

  section.appendChild(container);
}

function renderKeywordSection(group) {
  const filtered = gifts.filter(g => g.keyword === group.keyword);
  if (filtered.length === 0) return null;

  const section = document.createElement("div");
  section.className = "section side-section";

  const title = document.createElement("div");
  title.className = "section-title";

  if (group.titleImage) {
    title.innerHTML = `
      <img src="${group.titleImage}" alt="${group.keyword}" onerror="this.style.display='none'">
      <span>${group.keyword}</span>
    `;
  } else {
    title.textContent = group.keyword;
  }

  section.appendChild(title);

  const rowBox = document.createElement("div");
  rowBox.className = "section-box";

  if (group.keyword === "EX") {
    const row = document.createElement("div");
    row.className = "gift-row";

    filtered.forEach(gift => {
      row.appendChild(createGiftCard(gift));
    });

    rowBox.appendChild(row);
  } else {
    renderBurnSection(rowBox, filtered);
  }

  section.appendChild(rowBox);
  return section;
}

function render() {
  list.innerHTML = "";

  const burnGroup = { keyword: "화상", titleImage: "images/burn/화상.png" };
  const bleedGroup = { keyword: "출혈", titleImage: "images/bleed/출혈.png" };
  const exGroup = { keyword: "EX" };

  if (currentFilter === "전체") {
    const topLayout = document.createElement("div");
    topLayout.className = "top-layout";

    const leftArea = document.createElement("div");
    leftArea.className = "left-area";

    const rightArea = document.createElement("div");
    rightArea.className = "right-area";

    const burnSection = renderKeywordSection(burnGroup);
    const bleedSection = renderKeywordSection(bleedGroup);

    if (burnSection) leftArea.appendChild(burnSection);
    if (bleedSection) rightArea.appendChild(bleedSection);

    topLayout.appendChild(leftArea);
    topLayout.appendChild(rightArea);

    list.appendChild(topLayout);

    const exSection = renderKeywordSection(exGroup);
    if (exSection) list.appendChild(exSection);

    return;
  }

  if (currentFilter === "화상") {
    const burnSection = renderKeywordSection(burnGroup);
    if (burnSection) list.appendChild(burnSection);
    return;
  }

  if (currentFilter === "출혈") {
    const bleedSection = renderKeywordSection(bleedGroup);
    if (bleedSection) list.appendChild(bleedSection);
    return;
  }

  if (currentFilter === "EX") {
    const exSection = renderKeywordSection(exGroup);
    if (exSection) list.appendChild(exSection);
  }
}

async function saveGiftState() {
  if (!firebaseReady || !window.auth || !window.db || !window.auth.currentUser) return;

  try {
    await window.setDoc(
      window.doc(window.db, "users", window.auth.currentUser.uid),
      { selectedGifts: Array.from(selectedGiftIds) },
      { merge: true }
    );
  } catch (error) {
    console.error("기프트 상태 저장 실패:", error);
  }
}

async function loadGiftState() {
  if (!firebaseReady || !window.auth || !window.db || !window.auth.currentUser) return;

  try {
    const snapshot = await window.getDoc(
      window.doc(window.db, "users", window.auth.currentUser.uid)
    );

    if (snapshot.exists()) {
      const data = snapshot.data();
      selectedGiftIds = new Set(data.selectedGifts || []);
    } else {
      selectedGiftIds = new Set();
    }

    applyCheckedFromSet();
    render();
  } catch (error) {
    console.error("기프트 상태 불러오기 실패:", error);
  }
}

async function resetData() {
  selectedGiftIds = new Set();
  applyCheckedFromSet();
  render();
  await saveGiftState();
}

function setFilter(type) {
  currentFilter = type;

  document.getElementById("btn-all").classList.remove("active");
  document.getElementById("btn-burn").classList.remove("active");
  document.getElementById("btn-bleed").classList.remove("active");
  document.getElementById("btn-ex").classList.remove("active");

  if (type === "전체") document.getElementById("btn-all").classList.add("active");
  if (type === "화상") document.getElementById("btn-burn").classList.add("active");
  if (type === "출혈") document.getElementById("btn-bleed").classList.add("active");
  if (type === "EX") document.getElementById("btn-ex").classList.add("active");

  render();
}

function openLoginModal() {
  const modal = document.getElementById("login-modal");
  modal.style.display = "flex";
  document.getElementById("login-id").focus();
}

function closeLoginModal(event) {
  const modal = document.getElementById("login-modal");
  if (event && event.target !== modal) return;
  modal.style.display = "none";
}

function openSignupModal() {
  document.getElementById("signup-modal-step1").style.display = "flex";
  document.getElementById("signup-id").focus();
}

function closeSignupStep1Modal(event) {
  const modal = document.getElementById("signup-modal-step1");
  if (event && event.target !== modal) return;
  modal.style.display = "none";
}

function closeSignupStep2Modal(event) {
  const modal = document.getElementById("signup-modal-step2");
  if (event && event.target !== modal) return;
  modal.style.display = "none";
}

function closeSignupModal() {
  document.getElementById("signup-modal-step1").style.display = "none";
  document.getElementById("signup-modal-step2").style.display = "none";
}

function switchToSignup() {
  closeLoginModal();
  openSignupModal();
}

async function goToSignupStep2() {
  const idInput = document.getElementById("signup-id");
  const pwInput = document.getElementById("signup-pw");
  const pwConfirmInput = document.getElementById("signup-pw-confirm");

  const rawUsername = idInput.value.trim();
  const username = normalizeUsername(rawUsername);
  const password = pwInput.value.trim();
  const passwordConfirm = pwConfirmInput.value.trim();

  if (!username || !password || !passwordConfirm) {
    alert("아이디, 비밀번호, 비밀번호 확인을 모두 입력하세요.");
    return;
  }

  if (!isValidUsername(username)) {
    alert("아이디는 4~20자의 영문, 숫자, 밑줄(_)만 사용할 수 있습니다.");
    return;
  }

  if (password.length < 6) {
    alert("비밀번호는 6자 이상이어야 합니다.");
    return;
  }

  if (password !== passwordConfirm) {
    alert("비밀번호 확인이 일치하지 않습니다.");
    return;
  }

  try {
    const usernameSnapshot = await window.getDoc(
      window.doc(window.db, "usernames", username)
    );

    if (usernameSnapshot.exists()) {
      alert("이미 사용 중인 아이디입니다.");
      return;
    }

    pendingSignup.username = username;
    pendingSignup.password = password;

    document.getElementById("signup-modal-step1").style.display = "none";
    document.getElementById("signup-modal-step2").style.display = "flex";
    document.getElementById("signup-nickname").focus();
  } catch (error) {
    console.error(error);
    alert("아이디 확인 중 오류가 발생했습니다.");
  }
}

function backToSignupStep1() {
  document.getElementById("signup-modal-step2").style.display = "none";
  document.getElementById("signup-modal-step1").style.display = "flex";
}

async function signup() {
  const nicknameInput = document.getElementById("signup-nickname");
  const nickname = nicknameInput.value.trim();

  if (!pendingSignup.username || !pendingSignup.password) {
    alert("회원가입 정보를 다시 입력해주세요.");
    closeSignupModal();
    return;
  }

  if (!nickname) {
    alert("닉네임을 입력하세요.");
    return;
  }

  const username = pendingSignup.username;
  const password = pendingSignup.password;
  const email = usernameToEmail(username);

  try {
    const credential = await window.createUserWithEmailAndPassword(
      window.auth,
      email,
      password
    );

    const uid = credential.user.uid;

    await window.setDoc(
      window.doc(window.db, "users", uid),
      {
        username,
        nickname,
        selectedGifts: []
      },
      { merge: true }
    );

    await window.setDoc(
      window.doc(window.db, "usernames", username),
      { uid }
    );

    pendingSignup = {
      username: "",
      password: "",
      nickname: ""
    };

    document.getElementById("signup-id").value = "";
    document.getElementById("signup-pw").value = "";
    document.getElementById("signup-pw-confirm").value = "";
    document.getElementById("signup-nickname").value = "";

    closeSignupModal();
    alert("회원가입이 완료되었습니다.");
  } catch (error) {
    console.error(error);

    if (error.code === "auth/email-already-in-use") {
      alert("이미 사용 중인 아이디입니다.");
    } else if (error.code === "auth/weak-password") {
      alert("비밀번호는 6자 이상이어야 합니다.");
    } else {
      alert("회원가입에 실패했습니다.");
    }
  }
}

async function login() {
  const idInput = document.getElementById("login-id");
  const pwInput = document.getElementById("login-pw");

  const rawUsername = idInput.value.trim();
  const username = normalizeUsername(rawUsername);
  const password = pwInput.value.trim();

  if (!username || !password) {
    alert("아이디와 비밀번호를 입력하세요.");
    return;
  }

  const email = usernameToEmail(username);

  try {
    await window.signInWithEmailAndPassword(window.auth, email, password);

    idInput.value = "";
    pwInput.value = "";

    closeLoginModal();
    alert("로그인되었습니다.");
  } catch (error) {
    console.error(error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/user-not-found" ||
      error.code === "auth/wrong-password"
    ) {
      alert("아이디 또는 비밀번호가 틀렸습니다.");
    } else {
      alert("로그인에 실패했습니다.");
    }
  }
}

async function logout() {
  try {
    await window.signOutFirebase(window.auth);
    alert("로그아웃되었습니다.");
  } catch (error) {
    console.error(error);
    alert("로그아웃에 실패했습니다.");
  }
}

async function updateAuthUI(user) {
  const authStatus = document.getElementById("auth-status");
  const authTools = document.getElementById("auth-tools");
  const guestButtons = document.getElementById("auth-guest-buttons");

  if (user) {
    try {
      const snapshot = await window.getDoc(window.doc(window.db, "users", user.uid));
      const userData = snapshot.exists() ? snapshot.data() : null;
      const nickname = userData?.nickname || userData?.username || "사용자";

      authStatus.textContent = `${nickname} 로그인 중`;
      authTools.style.display = "flex";
      guestButtons.style.display = "none";
    } catch (error) {
      console.error(error);
      authStatus.textContent = "로그인 중";
      authTools.style.display = "flex";
      guestButtons.style.display = "none";
    }
  } else {
    authStatus.textContent = "비로그인 상태";
    authTools.style.display = "none";
    guestButtons.style.display = "flex";
  }
}

function bindModalEnterKeys() {
  const loginId = document.getElementById("login-id");
  const loginPw = document.getElementById("login-pw");

  const signupId = document.getElementById("signup-id");
  const signupPw = document.getElementById("signup-pw");
  const signupPwConfirm = document.getElementById("signup-pw-confirm");
  const signupNickname = document.getElementById("signup-nickname");

  [loginId, loginPw].forEach(input => {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        login();
      }
    });
  });

  [signupId, signupPw, signupPwConfirm].forEach(input => {
    input.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        goToSignupStep2();
      }
    });
  });

  signupNickname.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      signup();
    }
  });
}

function bindFirebaseAuth() {
  if (!window.auth || !window.onAuthStateChanged) return;

  window.onAuthStateChanged(window.auth, async user => {
    await updateAuthUI(user);

    if (user) {
      await loadGiftState();
    } else {
      selectedGiftIds = new Set();
      applyCheckedFromSet();
      render();
    }
  });
}

window.addEventListener("firebase-ready", () => {
  firebaseReady = true;
  bindFirebaseAuth();
});

window.addEventListener("DOMContentLoaded", () => {
  bindModalEnterKeys();
  setFilter("전체");
});