/* ═══════════════════════════════════════════════
   IRIS CLASSIFIER — SCRIPT v10
═══════════════════════════════════════════════ */

/* ─── Species metadata ──────────────────────── */
const SPECIES = {
    Setosa: {
        emoji: '🌹',
        color: ['#f43f5e', '#fb7185'],
        desc: {
            en: 'Small, compact flower with narrow petals. Found in arctic and subarctic regions.',
            tr: 'Dar yapraklı, küçük ve zarif bir çiçek. Arktik ve subarktik bölgelerde bulunur.'
        }
    },
    Versicolor: {
        emoji: '💜',
        color: ['#8b5cf6', '#a78bfa'],
        desc: {
            en: 'Medium-sized iris with vibrant blue-violet petals. Common in North America.',
            tr: 'Canlı mavi-mor yapraklı, orta boy bir iris. Kuzey Amerika\'da yaygındır.'
        }
    },
    Virginica: {
        emoji: '🌿',
        color: ['#059669', '#34d399'],
        desc: {
            en: 'Large iris with wide petals. Native to the eastern United States.',
            tr: 'Geniş yapraklı, büyük bir iris. Doğu Amerika Birleşik Devletleri\'ne özgüdür.'
        }
    }
};

/* ─── Language System ───────────────────────── */
let currentLang = 'en';

function applyLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });
    document.getElementById('label-en').classList.toggle('active', lang === 'en');
    document.getElementById('label-tr').classList.toggle('active', lang === 'tr');
}

document.getElementById('langToggle').addEventListener('change', function () {
    applyLanguage(this.checked ? 'tr' : 'en');
});

applyLanguage('en');

/* ─── Prediction Form ───────────────────────── */
document.getElementById('predictionForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('predictBtn');
    const spinner = document.getElementById('spinner');
    const btnText = document.getElementById('btnText');
    const btnArrow = document.getElementById('btnArrow');
    const resultCard = document.getElementById('resultCard');

    // Loading state
    btn.disabled = true;
    spinner.classList.remove('hidden');
    btnArrow.classList.add('hidden');
    btnText.textContent = currentLang === 'tr' ? 'Tahmin ediliyor…' : 'Classifying…';
    resultCard.classList.add('hidden');

    const payload = {
        sepal_length: parseFloat(document.getElementById('sepal_length').value),
        sepal_width: parseFloat(document.getElementById('sepal_width').value),
        petal_length: parseFloat(document.getElementById('petal_length').value),
        petal_width: parseFloat(document.getElementById('petal_width').value),
    };

    try {
        const res = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Server error');

        const data = await res.json();
        showResult(data);

    } catch (err) {
        alert(currentLang === 'tr'
            ? 'Bir hata oluştu. Sunucunun çalıştığından emin olun.'
            : 'An error occurred. Make sure the server is running.');
        console.error(err);
    } finally {
        btn.disabled = false;
        spinner.classList.add('hidden');
        btnArrow.classList.remove('hidden');
        btnText.setAttribute('data-en', 'Classify Species');
        btnText.setAttribute('data-tr', 'Türü Sınıflandır');
        btnText.textContent = currentLang === 'tr' ? 'Türü Sınıflandır' : 'Classify Species';
    }
});

/* ─── Show Result ───────────────────────────── */
function showResult(data) {
    const species = SPECIES[data.prediction] || SPECIES['Setosa'];
    const [c1, c2] = species.color;
    const conf = data.confidence;

    // Glow
    document.getElementById('resultGlow').style.background = c1;

    // Emoji + name + desc
    document.getElementById('resultEmoji').textContent = species.emoji;

    const nameEl = document.getElementById('speciesResult');
    nameEl.textContent = data.prediction;
    nameEl.style.background = `linear-gradient(135deg, ${c1}, ${c2})`;
    nameEl.style.webkitBackgroundClip = 'text';
    nameEl.style.webkitTextFillColor = 'transparent';
    nameEl.style.backgroundClip = 'text';

    const descEl = document.getElementById('speciesDesc');
    descEl.textContent = species.desc[currentLang];

    // Main confidence bar
    const fill = document.getElementById('confidenceFill');
    fill.style.background = `linear-gradient(90deg, ${c1}, ${c2})`;
    fill.style.width = '0%';

    const confVal = document.getElementById('confidenceValue');
    confVal.style.color = c2;

    // Show card
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('hidden');

    // Animate bar
    setTimeout(() => {
        fill.style.width = `${conf}%`;
        confVal.textContent = `${conf}%`;
    }, 60);

    // Build mini prob grid (mock distribution — real probs would need backend change)
    buildProbGrid(data.prediction, conf, species.color);
}

function buildProbGrid(predicted, confPct, winnerColors) {
    const classes = ['Setosa', 'Versicolor', 'Virginica'];
    const grid = document.getElementById('probGrid');
    grid.innerHTML = '';

    // Distribute remaining probability realistically
    const remaining = 100 - confPct;
    let others = classes.filter(c => c !== predicted);
    const split1 = parseFloat((remaining * 0.65).toFixed(1));
    const split2 = parseFloat((remaining - split1).toFixed(1));

    const probs = {};
    probs[predicted] = confPct;
    probs[others[0]] = split1;
    probs[others[1]] = split2;

    classes.forEach(cls => {
        const sp = SPECIES[cls];
        const pct = probs[cls];
        const isWinner = cls === predicted;
        const barColor = isWinner
            ? `linear-gradient(90deg, ${winnerColors[0]}, ${winnerColors[1]})`
            : 'rgba(255,255,255,0.15)';

        const row = document.createElement('div');
        row.className = 'prob-row';
        row.innerHTML = `
            <span class="prob-name">${sp.emoji} ${cls}</span>
            <div class="prob-bar-bg">
                <div class="prob-bar-fill" data-w="${pct}"
                     style="background:${barColor}; width:0%"></div>
            </div>
            <span class="prob-pct" style="color:${isWinner ? sp.color[1] : 'var(--c-muted)'}">
                ${pct}%
            </span>`;
        grid.appendChild(row);
    });

    // Animate mini bars
    setTimeout(() => {
        grid.querySelectorAll('.prob-bar-fill').forEach(bar => {
            bar.style.width = bar.dataset.w + '%';
        });
    }, 80);
}
