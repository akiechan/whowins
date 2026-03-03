const express = require('express');
const fs = require('fs');
const path = require('path');
const { getAllBattles, getBattleBySlug } = require('./db');

const app = express();
const PORT = 5002;

// Landing page
app.get('/', (req, res) => {
  const battles = getAllBattles();
  const template = fs.readFileSync(path.join(__dirname, 'views', 'index.html'), 'utf-8');
  const html = template.replace('<!--ROWS-->', buildRows(battles));
  res.send(html);
});

// Serve stored battle HTML
app.get('/battle/:slug', (req, res) => {
  const battle = getBattleBySlug(req.params.slug);
  if (!battle) return res.status(404).send('Battle not found');

  const section = req.query.section;
  if (!section) return res.send(battle.html_content);

  // Inject a scroll script at the end of </body>
  const scrollScript = `
<script>
(function() {
  var section = ${JSON.stringify(section)};
  var target;
  if (section === 'facts') {
    target = document.querySelector('.fact-grid') || document.querySelector('h2');
  } else {
    target = document.querySelector('.story-section.' + section);
  }
  if (target) target.scrollIntoView({ behavior: 'smooth' });
})();
</script>`;

  const injected = battle.html_content.replace('</body>', scrollScript + '\n</body>');
  res.send(injected);
});

function buildRows(battles) {
  if (battles.length === 0) {
    return '<tr><td colspan="7" style="text-align:center;color:#999;padding:40px;">No battles yet. Import one with: <code>node import.js "Animal 1" "Animal 2" /path/to/file.html</code></td></tr>';
  }
  return battles.map(b => {
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

app.listen(PORT, () => {
  console.log(`WhoWins running at http://localhost:${PORT}`);
});
