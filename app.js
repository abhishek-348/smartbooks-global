'use strict';
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const node = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const menu = $('.menu-button');
function closeMenu() { menu?.setAttribute('aria-expanded', 'false'); $('#main-nav')?.classList.remove('open'); }
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  $('#main-nav').classList.toggle('open', open);
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
$$('#main-nav a').forEach(link => link.addEventListener('click', closeMenu));

// Illustrative report: explicit sample figures, not customer data.
const reports = {
  profit: { label: 'Quarterly revenue', value: '$144,000', tag: 'Profit & loss', bars: ['60%', '80%', '100%'], guides: ['$60k', '$40k', '$20k', '$0'], aLabel: 'Operating expenses', aValue: '$108,000', bLabel: 'Operating profit', bValue: '$36,000', chartLabel: 'Sample revenue: April $36,000, May $48,000, June $60,000' },
  cash: { label: 'Closing cash balance', value: '$54,000', tag: 'Cash flow', bars: ['60%', '75%', '90%'], guides: ['$60k', '$40k', '$20k', '$0'], aLabel: 'Quarterly cash inflow', aValue: '$132,000', bLabel: 'Quarterly cash outflow', bValue: '$108,000', chartLabel: 'Sample closing cash: April $36,000, May $45,000, June $54,000. Opening quarter cash $30,000.' }
};
function setReport(view) {
  const report = reports[view];
  if (!report || !$('#report-panel')) return;
  $$('[data-report]').forEach(tab => { const selected = tab.dataset.report === view; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  $('#report-panel').setAttribute('aria-labelledby', view + '-tab');
  $('#metric-label').textContent = report.label;
  $('#metric-value').replaceChildren(document.createTextNode(report.value), node('span', '.00'));
  $('#metric-tag').textContent = report.tag;
  ['a', 'b'].forEach(key => { $('#stat-' + key + '-label').textContent = report[key + 'Label']; $('#stat-' + key + '-value').textContent = report[key + 'Value']; });
  $$('.bar').forEach((bar, index) => bar.style.setProperty('--bar', report.bars[index]));
  $$('.chart-guides span').forEach((label, index) => label.textContent = report.guides[index]);
  $('.chart').setAttribute('aria-label', report.chartLabel);
}
$$('[data-report]').forEach(tab => {
  tab.addEventListener('click', () => setReport(tab.dataset.report));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const view = event.key === 'Home' ? 'profit' : event.key === 'End' ? 'cash' : tab.dataset.report === 'profit' ? 'cash' : 'profit';
    setReport(view); $('#' + view + '-tab').focus();
  });
});
setReport('profit');

// Service context and checklists. Inputs are processed only in this page.
async function setupServices() {
  if (!$('#checklist-service') && !$('#contact-context')) return;
  let services;
  try { const response = await fetch('/services.json'); if (!response.ok) throw Error(); services = await response.json(); }
  catch { if ($('#checklist-result')) $('#checklist-result').textContent = 'Please contact us for a preparation checklist.'; return; }
  const params = new URLSearchParams(location.search);
  const selected = services.find(service => service.id === params.get('service'));
  if ($('#checklist-service') && selected) $('#checklist-service').value = selected.id;
  function renderChecklist() {
    if (!$('#checklist-result')) return;
    const service = services.find(item => item.id === $('#checklist-service').value);
    const needs = [...service.needs];
    if ($('#book-status').value === 'behind') needs.push('List of incomplete periods, unresolved balances, and missing records');
    if ($('#book-status').value === 'new') needs.push('Current software, planned migration date, and available opening balances');
    const list = node('ul', null, 'checklist-items');
    needs.forEach((text, index) => {
      const item = node('li'); const label = node('label'); const input = node('input');
      input.type = 'checkbox'; input.id = 'checklist-item-' + index;
      label.append(input, document.createTextNode(text)); item.append(label); list.append(item);
    });
    $('#checklist-result').replaceChildren(node('h3', 'Your starting checklist'), list, node('p', 'Final requirements depend on your business and agreed scope. Share sensitive records only through an agreed secure channel.'));
    $('#checklist-contact').href = '/contact/?service=' + service.id;
  }
  $('#checklist-service')?.addEventListener('change', renderChecklist);
  $('#book-status')?.addEventListener('change', renderChecklist);
  renderChecklist();
  $('#download-checklist')?.addEventListener('click', () => {
    const service = services.find(item => item.id === $('#checklist-service').value);
    const text = ['SMARTBOOKS GLOBAL', 'Preparation checklist: ' + service.name, 'Books: ' + $('#book-status').selectedOptions[0].textContent, '', ...$$('.checklist-items li').map(item => (item.querySelector('input').checked ? '[x] ' : '[ ] ') + item.textContent), '', 'Indicative preparation only; final requirements are agreed after review.', 'Please do not send passwords or sensitive records through a general enquiry.', 'support@smartbooksglobal.com'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = node('a'); link.href = url; link.download = 'smartbooks-' + service.id + '-checklist.txt'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  if ($('#contact-context')) {
    const plans = { starter: 'Starter plan', growth: 'Growth plan', cfo: 'CFO Advisory plan' };
    const topic = selected?.name || plans[params.get('plan')];
    if (topic) {
      const panel = $('#contact-context'); panel.hidden = false;
      const link = node('a', 'Prefer email? Prepare an enquiry ↗', 'text-link');
      link.href = 'mailto:support@smartbooksglobal.com?subject=' + encodeURIComponent('Enquiry: ' + topic) + '&body=' + encodeURIComponent('I would like to discuss ' + topic + '.\n\nBusiness: \nCurrent accounting software: \nMy requirements: \nPreferred meeting time and time zone: ');
      panel.replaceChildren(node('b', 'Your starting point: ' + topic), node('p', 'Please mention this in your enquiry so we can focus on the right support.'), link);
    }
  }
}
setupServices();

function number(selector) { const input = $(selector); return input && input.value.trim() !== '' && input.validity.valid ? Number(input.value) : NaN; }
const usd = value => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
function calculate() {
  if (!$('#runway-result')) return;
  const cash = number('#cash'), burn = number('#burn');
  $('#runway-result').textContent = !Number.isFinite(cash + burn) ? 'Enter valid nonnegative amounts.' : burn === 0 ? 'No net outflow entered.' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(cash / burn) + ' months';
  const fixed = number('#fixed'), margin = number('#margin');
  $('#breakeven-result').textContent = !Number.isFinite(fixed + margin) ? 'Enter valid amounts and margin.' : margin === 0 ? 'Use a margin above 0%.' : usd(fixed / (margin / 100)) + ' / month';
}
$$('.calculator input').forEach(input => input.addEventListener('input', calculate));
$$('.calculator').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
calculate();

window.addEventListener('message', event => {
  if (event.origin !== 'https://tally.so') return;
  try {
    const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    if (data.event === 'Tally.FormPageHeight' && Number.isFinite(data.payload?.height)) {
      const iframe = $('iframe[src*="tally.so"]');
      if (iframe) iframe.height = String(Math.max(400, Math.min(3000, data.payload.height)));
    }
  } catch { /* Ignore unrelated provider messages. */ }
});
