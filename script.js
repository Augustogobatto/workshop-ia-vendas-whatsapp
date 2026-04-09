/* =============================================
   CONFIGURAÇÃO — editar aqui
   ============================================= */
const CONFIG = {
  stripeUrls: {
    1: 'https://buy.stripe.com/6oU00k1yY6pf4Dm4pm9fW08', // Lote 1 — R$150 (10 vagas)
    2: 'https://buy.stripe.com/bJe6oIfpO3d3edW3li9fW09', // Lote 2 — R$200 (10 vagas)
    3: 'https://buy.stripe.com/14AeVe1yYcND8TCbRO9fW0a', // Lote 3 — R$300 (10 vagas)
  },
  webhookUrl:        'https://n8n-n8n.0pqeuc.easypanel.host/webhook/3409a797-a9b1-4ca8-8699-5c63c405572b',
  proofWebhookUrl:   'https://n8n-n8n.0pqeuc.easypanel.host/webhook/cadffaec-6bf0-44bd-8f68-c927246ffeaf',
  whatsappBotNumber: '',           // Fallback: número do bot (ex: "5551999990000") — usado se proofWebhookUrl vazio
  vagasRestantes:    6,            // Atualizar manualmente
  vagasTotal:        10,           // Lote 1: 10 | Lote 2: 10 | Lote 3: 10
  loteAtual:         1,            // Trocar aqui quando mudar de lote (1, 2 ou 3)
  preco:             'R$150',      // Lote 1: R$150 | Lote 2: R$200 | Lote 3: R$300
  workshopDate:      new Date('2026-04-21T08:00:00-03:00'),
};

/* =============================================
   VAGAS
   ============================================= */
function initVagas() {
  const filled   = CONFIG.vagasTotal - CONFIG.vagasRestantes;
  const pct      = (filled / CONFIG.vagasTotal) * 100;

  document.querySelectorAll('[data-vagas]').forEach(el => {
    el.textContent = CONFIG.vagasRestantes;
  });

  document.querySelectorAll('.vagas-fill').forEach(bar => {
    // delay para a transição ficar visível
    setTimeout(() => { bar.style.width = pct + '%'; }, 400);
  });

  document.querySelectorAll('[data-cta]').forEach(el => {
    el.href = CONFIG.stripeUrls[CONFIG.loteAtual];
  });
}

/* =============================================
   COUNTDOWN
   ============================================= */
function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = CONFIG.workshopDate - Date.now();
    if (diff <= 0) {
      el.innerHTML = '<span style="color:var(--green);font-family:var(--font-display);font-size:24px;font-weight:700">Workshop ao vivo!</span>';
      return;
    }
    const d = Math.floor(diff / 864e5);
    const h = Math.floor((diff % 864e5) / 36e5);
    const m = Math.floor((diff % 36e5)  / 6e4);
    const s = Math.floor((diff % 6e4)   / 1e3);

    const ids = { 'cd-days': d, 'cd-hours': h, 'cd-minutes': m, 'cd-seconds': s };
    for (const [id, val] of Object.entries(ids)) {
      const node = document.getElementById(id);
      if (node) node.textContent = pad(val);
    }
  }

  tick();
  setInterval(tick, 1000);
}

/* =============================================
   COUNTERS ANIMADOS
   ============================================= */
function animateCounter(el, target, duration) {
  const prefix  = el.dataset.prefix || '';
  const suffix  = el.dataset.suffix || '';
  const start   = performance.now();

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val   = Math.round(eased * target);
    el.textContent = prefix + val + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = prefix + target + suffix;
  }

  requestAnimationFrame(step);
}

function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.counted) {
        entry.target.dataset.counted = '1';
        const target   = parseFloat(entry.target.dataset.count);
        const duration = parseInt(entry.target.dataset.duration || '1800');
        animateCounter(entry.target, target, duration);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
}

/* =============================================
   SCROLL REVEAL
   ============================================= */
function initReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* =============================================
   STICKY HEADER (mobile)
   ============================================= */
function initStickyHeader() {
  const header = document.getElementById('sticky-header');
  const hero   = document.getElementById('hero');
  if (!header || !hero) return;

  const observer = new IntersectionObserver(entries => {
    const inView = entries[0].isIntersecting;
    header.classList.toggle('visible', !inView);
  }, { threshold: 0 });

  observer.observe(hero);
}

/* =============================================
   FAQ ACCORDION
   ============================================= */
function initFAQ() {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* =============================================
   CONVERSA — Expandir / Fechar
   ============================================= */
function toggleConv(btn) {
  const mockup  = btn.closest('.wapp-mockup');
  const summary = mockup.querySelector('.wapp-summary');
  const full    = mockup.querySelector('.wapp-full');
  const span    = btn.querySelector('span');
  const arrow   = btn.querySelector('.conv-arrow');

  const isExpanding = full.style.display !== 'block';
  summary.style.display  = isExpanding ? 'none'  : 'block';
  full.style.display     = isExpanding ? 'block' : 'none';
  span.textContent       = isExpanding ? 'Fechar' : 'Ver conversa completa';
  arrow.style.transform  = isExpanding ? 'rotate(180deg)' : 'rotate(0deg)';
}

/* =============================================
   CHAT WIDGET — Webhook
   ============================================= */
function initChat() {
  const btn    = document.getElementById('chat-btn');
  const panel  = document.getElementById('chat-panel');
  const input  = document.getElementById('chat-input');
  const send   = document.getElementById('chat-send');
  const msgs   = document.getElementById('chat-msgs');
  if (!btn || !panel || !msgs) return;

  let isOpen    = false;
  let isBusy    = false;
  let sessionId = sessionStorage.getItem('ws_sid') ||
    ('s_' + Math.random().toString(36).slice(2, 10));
  sessionStorage.setItem('ws_sid', sessionId);

  let greeted = false;

  // Toggle
  btn.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) {
      if (!greeted) { greet(); greeted = true; }
      input?.focus();
    }
  });

  // Send on Enter (não Shift+Enter)
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });

  send?.addEventListener('click', handleSend);

  function greet() {
    addMsg('Fala! Aposto que você tá perdendo pelo menos 3 leads por semana porque demora pra responder no WhatsApp. Acertei?', 'bot');
  }

  function addMsg(text, type) {
    const el = document.createElement('div');
    el.className = `msg msg-${type}`;
    const normalized = text.replace(/\\n/g, '\n');
    const escaped = normalized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const html = escaped
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
    el.innerHTML = html;
    msgs.appendChild(el);
    scrollDown();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'typing';
    el.id = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    scrollDown();
  }

  function hideTyping() { document.getElementById('typing')?.remove(); }

  function scrollDown() {
    setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 40);
  }

  async function handleSend() {
    if (isBusy || !input) return;
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    addMsg(text, 'user');

    if (!CONFIG.webhookUrl) {
      showTyping();
      await delay(1000);
      hideTyping();
      addMsg('O chat ainda não está conectado. Para tirar dúvidas, chama no WhatsApp.', 'bot');
      return;
    }

    isBusy = true;
    if (send) send.disabled = true;
    showTyping();

    try {
      const res = await fetch(CONFIG.webhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          message:   text,
          sessionId,
          source:    'landing_page',
          timestamp: new Date().toISOString(),
        }),
      });

      hideTyping();

      if (!res.ok) throw new Error('HTTP ' + res.status);

      const data  = await res.json();
      const reply = data.response || data.text || data.message || data.output ||
        'Desculpa, não consegui processar agora. Tenta de novo!';

      addMsg(reply, 'bot');
    } catch {
      hideTyping();
      addMsg('Erro de conexão. Tenta novamente em instantes.', 'bot');
    } finally {
      isBusy = false;
      if (send) send.disabled = false;
      input?.focus();
    }
  }
}

/* =============================================
   UTILS
   ============================================= */
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

/* =============================================
   PHONE MASK
   ============================================= */
(function () {
  const input = document.getElementById('proof-phone');
  if (!input) return;

  input.addEventListener('input', function () {
    let v = this.value.replace(/\D/g, '');
    // Remove prefixo 55 do autocomplete (+5548999... → 48999...)
    if (v.length >= 12 && v.startsWith('55')) v = v.slice(2);
    v = v.slice(0, 11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (v.length > 0) {
      v = v.replace(/^(\d{0,2})/, '($1');
    }
    this.value = v;
  });
})();

/* =============================================
   PROOF FORM — Testa no WhatsApp
   ============================================= */
async function handleProofSubmit(e) {
  e.preventDefault();

  const input   = document.getElementById('proof-phone');
  const success = document.getElementById('proof-success');
  const btn     = e.target.querySelector('button[type="submit"]');
  let raw = (input?.value || '').replace(/\D/g, '');
  if (raw.length >= 12 && raw.startsWith('55')) raw = raw.slice(2);

  if (raw.length < 10) {
    input?.focus();
    input?.style && (input.style.borderColor = 'var(--red)');
    setTimeout(() => input?.style && (input.style.borderColor = ''), 1500);
    return;
  }

  const phone = '55' + raw; // E.164 BR

  // Se tem webhook configurado → envia número pro webhook disparar mensagem ativa
  if (CONFIG.proofWebhookUrl) {
    btn.disabled   = true;
    btn.textContent = 'ENVIANDO...';
    try {
      await fetch(CONFIG.proofWebhookUrl, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, source: 'proof_form' }),
      });
      if (success) success.style.display = 'block';
      if (input)   input.value = '';
    } catch {
      // fallback pra link direto
      openWhatsApp(phone);
    } finally {
      btn.disabled   = false;
      btn.textContent = 'QUERO TESTAR A IA';
    }
    return;
  }

  // Fallback: abre wa.me pro número do bot
  if (CONFIG.whatsappBotNumber) {
    openWhatsApp(CONFIG.whatsappBotNumber);
    return;
  }

  // Nenhum configurado
  alert('Configure proofWebhookUrl ou whatsappBotNumber no CONFIG de script.js');
}

function openWhatsApp(number) {
  const msg  = encodeURIComponent('Oi! Quero testar a IA do workshop.');
  window.open(`https://wa.me/${number}?text=${msg}`, '_blank');
}

/* =============================================
   INIT
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initVagas();
  initCountdown();
  initCounters();
  initReveal();
  initStickyHeader();
  initFAQ();
  initChat();
});
