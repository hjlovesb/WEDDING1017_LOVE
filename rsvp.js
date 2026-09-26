/* ============================================
   참석 여부(RSVP) 폼 — 시니어판
   - DOM 준비 후에 초기화되므로 <head>·본문 어디에서
     로드해도 항상 작동합니다.
   - 제출된 응답은 Firebase Firestore(rsvpResponses 컬렉션)에 저장됩니다.
   ============================================ */
(function () {
  'use strict';

  // ── Firebase 연결 (참석여부 응답을 Firestore에 저장) ──
  var firebaseConfig = {
    apiKey: "AIzaSyCjSJ84mUFZSReIkb-TyJuP4F5iQQAWOhA",
    authDomain: "wedding-88902.firebaseapp.com",
    projectId: "wedding-88902",
    storageBucket: "wedding-88902.firebasestorage.app",
    messagingSenderId: "331843175920",
    appId: "1:331843175920:web:3d34801d0314f5496a8935"
  };

  var db = null;
  try {
    if (window.firebase && !firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    if (window.firebase) {
      db = firebase.firestore();
    }
  } catch (e) {
    db = null;
  }

  function saveRsvpToFirestore(data) {
    if (!db) {
      return Promise.reject(new Error('Firestore not available'));
    }
    return db.collection('rsvpResponses').add({
      invitationId: data.invitationId,
      name: data.name,
      attendance: data.attendance,
      count: data.count,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      userAgent: (navigator.userAgent || '').slice(0, 180)
    });
  }

  function initRsvp() {
    const form = document.getElementById('rsvp-form');
    const message = document.getElementById('rsvp-message');
    const attendRadio = document.getElementById('rsvp-attend');
    const absentRadio = document.getElementById('rsvp-absent');
    const groomRadio = document.getElementById('rsvp-side-groom');
    const brideRadio = document.getElementById('rsvp-side-bride');
    const nameInput = document.getElementById('rsvp-name');
    const countInput = document.getElementById('rsvp-count');
    const submitBtn = document.getElementById('rsvp-submit');

    // 한 번이라도 참석/불참을 "전달하기"로 제출한 사람에게는 폼이 다시
    // 나타나지 않고 완료 문구만 보이도록 합니다.
    const SUBMITTED_KEY = 'wedding_rsvp_submitted';

    function hasSubmitted() {
      try {
        return localStorage.getItem(SUBMITTED_KEY) === '1';
      } catch (e) {
        return false;
      }
    }

    function markSubmitted() {
      try {
        localStorage.setItem(SUBMITTED_KEY, '1');
      } catch (e) {}
    }

    function resetMessage() {
      if (!message) return;
      message.textContent = '';
      message.classList.remove('is-success', 'is-error');
    }

    window.openAttendModal = function () { return false; };

    // 이미 제출한 적이 있다면 폼 대신 완료 안내만 보여줍니다.
    if (hasSubmitted() && form) {
      form.style.display = 'none';
      if (message) {
        message.textContent = '참석여부를 이미 전달해 주셨습니다. 감사합니다.';
        message.classList.add('is-success');
      }
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput && nameInput.value ? nameInput.value.trim() : '';
        resetMessage();
        if (!name) {
          if (message) {
            message.textContent = '성함을 입력해 주세요.';
            message.classList.add('is-error');
          }
          if (nameInput) nameInput.focus();
          return;
        }

        const sideKo = groomRadio && groomRadio.checked ? '신랑측' : '신부측';
        const sideKey = groomRadio && groomRadio.checked ? 'groom' : 'bride';
        const attending = !!(attendRadio && attendRadio.checked);
        const count = attending
          ? Math.max(1, Math.min(9, Number(countInput && countInput.value) || 1))
          : 0;

        if (submitBtn) submitBtn.disabled = true;
        if (message) {
          message.textContent = '전달 중입니다...';
          message.classList.remove('is-error', 'is-success');
        }

        saveRsvpToFirestore({
          invitationId: 'senior-' + sideKey,
          name: name,
          attendance: attending ? 'attend' : 'absent',
          count: count
        }).then(() => {
          if (message) {
            message.textContent = attending
              ? `${sideKo} ${name}님의 참석 의사(${count}명)가 확인되었습니다.`
              : `${sideKo} ${name}님의 불참 의사가 확인되었습니다.`;
            message.classList.remove('is-error');
            message.classList.add('is-success');
          }
          markSubmitted();
        }).catch(() => {
          if (submitBtn) submitBtn.disabled = false;
          if (message) {
            message.textContent = '전달에 실패했습니다. 잠시 후 다시 시도해 주세요.';
            message.classList.remove('is-success');
            message.classList.add('is-error');
          }
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRsvp);
  } else {
    initRsvp();
  }
})();
