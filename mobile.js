let mobileMenu = null;
let backdrop = null;

let isMenuOpen = false;
let startX = 0;
let endX = 0;

function isMobileWidth() {
  return window.innerWidth <= 760;
}

function openMobileMenu() {
  if (!mobileMenu || !backdrop) return;
  if (!isMobileWidth()) return;

  renderMobilePresetList();
  syncMobileAuthUI();

  mobileMenu.classList.add("open");
  backdrop.classList.add("open");
  isMenuOpen = true;
}

function closeMobileMenu() {
  if (!mobileMenu || !backdrop) return;

  mobileMenu.classList.remove("open");
  backdrop.classList.remove("open");
  isMenuOpen = false;
}

window.toggleMobileMenu = function () {
  if (!isMobileWidth()) return;

  if (isMenuOpen) {
    closeMobileMenu();
  } else {
    openMobileMenu();
  }
};

window.toggleMobileSection = function (sectionId) {
  if (!isMobileWidth()) return;

  const section = document.getElementById(sectionId);
  if (!section) return;
  section.classList.toggle("open");
};

window.mobileLogin = async function () {
  const userId = document.getElementById("mobile-login-id")?.value.trim();
  const pw = document.getElementById("mobile-login-password")?.value;

  if (!userId || !pw) {
    alert("아이디와 비밀번호를 입력해주세요.");
    return;
  }

  try {
    const userData = await window.findUserByUserId(userId);

    if (!userData) {
      alert("존재하지 않는 아이디입니다.");
      return;
    }

    await window.fb.signInWithEmailAndPassword(window.auth, userData.email, pw);
    alert("로그인 성공");
    closeMobileMenu();
  } catch (e) {
    console.error(e);
    alert("로그인 실패");
  }
};

function setupSwipeGesture() {
  document.addEventListener("touchstart", (e) => {
    if (!isMobileWidth()) return;
    startX = e.changedTouches[0].screenX;
  });

  document.addEventListener("touchend", (e) => {
    if (!isMobileWidth()) return;

    endX = e.changedTouches[0].screenX;

    const diff = startX - endX;
    const screenWidth = window.innerWidth;

    const fromRightEdge = startX > screenWidth - 120;
    const insideMenu = startX > screenWidth - 320;

    if (!isMenuOpen && fromRightEdge && diff > 60) {
      openMobileMenu();
    }

    if (isMenuOpen && insideMenu && diff < -60) {
      closeMobileMenu();
    }
  });
}

function renderMobilePresetList() {
  const source = document.getElementById("preset-list");
  const target = document.getElementById("mobile-preset-list");

  if (!source || !target) return;
  target.innerHTML = source.innerHTML;
}

function syncMobileAuthUI() {
  const loggedOut = document.getElementById("mobile-auth-logged-out");
  const loggedIn = document.getElementById("mobile-auth-logged-in");
  const statusText = document.getElementById("mobile-auth-status-text");
  const desktopStatus = document.getElementById("auth-status");

  if (!loggedOut || !loggedIn || !statusText) return;

  const isLoggedIn = !!window.auth?.currentUser;

  if (isLoggedIn) {
    loggedOut.style.display = "none";
    loggedIn.style.display = "block";
    statusText.textContent = desktopStatus ? desktopStatus.textContent : "로그인 상태";
  } else {
    loggedOut.style.display = "block";
    loggedIn.style.display = "none";
    statusText.textContent = "";
  }
}

function setupMobileMenuButton() {
  const btn = document.querySelector(".mobile-menu-btn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.toggleMobileMenu();
  });
}

function setupMobileMenu() {
  mobileMenu = document.getElementById("mobile-menu");
  backdrop = document.getElementById("mobile-menu-backdrop");

  if (!mobileMenu || !backdrop) return;

  backdrop.addEventListener("click", closeMobileMenu);
  setupSwipeGesture();
  setupMobileMenuButton();

  window.addEventListener("resize", () => {
    if (!isMobileWidth()) {
      closeMobileMenu();
    }
  });
}

document.addEventListener("DOMContentLoaded", setupMobileMenu);