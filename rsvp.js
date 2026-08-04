/* ============================================
   참석 여부(RSVP) 팝업
   - DOM 준비 후에 초기화되므로 <head>·본문 어디에서
     로드해도 항상 작동합니다.
   ============================================ */
(function () {
  'use strict';

  function initRsvp() {
    const form = document.getElementById('rsvp-form');
    const message = document.getElementById('rsvp-message');
    const attendRadio = document.getElementById('rsvp-attend');
    const absentRadio = document.getElementById('rsvp-absent');
    const groomRadio = document.getElementById('rsvp-side-groom');
    const brideRadio = document.getElementById('rsvp-side-bride');
    const nameInput = document.getElementById('rsvp-name');
    const countInput = document.getElementById('rsvp-count');

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
        const side = groomRadio && groomRadio.checked ? '신랑측' : '신부측';
        const attending = !!(attendRadio && attendRadio.checked);
        const count = Math.max(1, Math.min(9, Number(countInput && countInput.value) || 1));
        if (message) {
          message.textContent = attending
            ? `${side} ${name}님의 참석 의사(${count}명)가 확인되었습니다.`
            : `${side} ${name}님의 불참 의사가 확인되었습니다.`;
          message.classList.add('is-success');
        }
        markSubmitted();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRsvp);
  } else {
    initRsvp();
  }
})();
