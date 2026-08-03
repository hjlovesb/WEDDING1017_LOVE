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
    const counter = document.getElementById('rsvp-counter');
    const countEl = document.getElementById('rsvp-count');
    const minusBtn = document.getElementById('rsvp-minus');
    const plusBtn = document.getElementById('rsvp-plus');
    const helpEl = document.getElementById('rsvp-help');
    const nameInput = document.getElementById('rsvp-name');

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

    function getCount() {
      return Number((countEl && countEl.dataset.count) || '1');
    }

    function setCount(value) {
      const next = Math.max(1, Math.min(10, Number(value) || 1));
      if (countEl) {
        countEl.dataset.count = String(next);
        countEl.textContent = `${next}명`;
      }
    }

    function updateCounterState() {
      const attending = !!(attendRadio && attendRadio.checked);
      if (counter) counter.classList.toggle('is-disabled', !attending);
      if (minusBtn) minusBtn.disabled = !attending;
      if (plusBtn) plusBtn.disabled = !attending;
      if (helpEl) {
        helpEl.textContent = attending ? '본인 포함 참석 인원' : '불참으로 전달됩니다';
      }
      if (countEl && !attending) {
        countEl.textContent = '0명';
      } else if (countEl && attending) {
        countEl.textContent = `${getCount()}명`;
      }
    }

    function resetMessage() {
      if (!message) return;
      message.textContent = '';
      message.classList.remove('is-success', 'is-error');
    }

    window.openAttendModal = function () { return false; };

    if (minusBtn) minusBtn.addEventListener('click', () => setCount(getCount() - 1));
    if (plusBtn) plusBtn.addEventListener('click', () => setCount(getCount() + 1));
    if (attendRadio) attendRadio.addEventListener('change', updateCounterState);
    if (absentRadio) absentRadio.addEventListener('change', updateCounterState);

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
        const attending = !!(attendRadio && attendRadio.checked);
        const count = attending ? `${getCount()}명` : '불참';
        if (message) {
          message.textContent = attending
            ? `${name}님의 참석 의사(${count})가 확인되었습니다.`
            : `${name}님의 불참 의사가 확인되었습니다.`;
          message.classList.add('is-success');
        }
        markSubmitted();
      });
    }

    updateCounterState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRsvp);
  } else {
    initRsvp();
  }
})();
