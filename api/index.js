const fs = require('fs');
const path = require('path');

let battles = null;
function getBattles() {
  if (!battles) {
    battles = JSON.parse(fs.readFileSync(path.join(__dirname, 'battles.json'), 'utf-8'));
  }
  return battles;
}

function buildRows(list) {
  if (list.length === 0) {
    return '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No battles yet.</td></tr>';
  }
  return list.map(b => {
    const d = new Date(b.created_at + 'Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `
      <tr>
        <td class="matchup"><a href="/battle/${b.slug}">${b.animal1} vs ${b.animal2}</a></td>
        <td><a href="/battle/${b.slug}?section=facts" class="btn btn-facts">Facts</a></td>
        <td><a href="/battle/${b.slug}?section=age-5" class="btn btn-age5">4-5yo</a></td>
        <td><a href="/battle/${b.slug}?section=age-6" class="btn btn-age6">5-6yo</a></td>
        <td><a href="/battle/${b.slug}?section=age-8" class="btn btn-age8">7-8yo</a></td>
        <td><a href="/battle/${b.slug}?section=age-jp" class="btn btn-jp">JP 4-5</a></td>
        <td class="date">${d}</td>
      </tr>`;
  }).join('\n');
}

module.exports = (req, res) => {
  const list = getBattles();
  const template = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf-8');
  const html = template.replace('<!--ROWS-->', buildRows(list));
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
};
