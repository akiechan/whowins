const fs = require('fs');
const path = require('path');

let battles = null;
function getBattles() {
  if (!battles) {
    battles = JSON.parse(fs.readFileSync(path.join(__dirname, 'battles.json'), 'utf-8'));
  }
  return battles;
}

module.exports = (req, res) => {
  // Extract slug from URL path: /battle/some-slug
  const slug = req.url.split('/battle/')[1]?.split('?')[0];
  if (!slug) {
    res.status(404).send('Battle not found');
    return;
  }

  const battle = getBattles().find(b => b.slug === slug);
  if (!battle) {
    res.status(404).send('Battle not found');
    return;
  }

  const section = req.query?.section;
  if (!section) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(battle.html_content);
    return;
  }

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
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(injected);
};
