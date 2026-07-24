/* ==========================================================================
   DUNGEON HAUL — Interactive Web Application Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initLightbox();
  initCharacterSwitcher();
  initArcadeSimulator();
  initRulesFilter();
});

/* Mobile Navigation Toggle */
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('active');
    });
  }
}

/* Lightbox Modal for Screenshots & Sprite Sheets */
function initLightbox() {
  const showcaseItems = document.querySelectorAll('.showcase-item');
  
  if (showcaseItems.length === 0) return;

  // Create overlay modal dynamically
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <button class="modal-close" aria-label="Close Preview">&times;</button>
    <img class="modal-content-img" src="" alt="Dungeon Haul Preview">
  `;
  document.body.appendChild(overlay);

  const modalImg = overlay.querySelector('.modal-content-img');
  const closeBtn = overlay.querySelector('.modal-close');

  showcaseItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt || 'Dungeon Haul Screenshot';
        overlay.classList.add('active');
      }
    });
  });

  const closeModal = () => overlay.classList.remove('active');
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
}

/* Character Tab Switcher & Action Portrait Data */
const CHARACTER_DATA = {
  gnome: {
    name: 'Gnome',
    title: 'The Crafty Tinkerer',
    badgeClass: 'gnome',
    colorVar: 'var(--hauler-gnome)',
    glowVar: 'var(--hauler-gnome-glow)',
    portraitImage: 'assets/images/action_portrait_gnome.png',
    sheetImage: 'assets/images/gnome_sprite_sheet_1784605988611.jpg',
    backstory: `Originating from the lower mechanical gear-works of the ancient dungeon, the Gnome is quick-witted, agile, and obsessed with ancient relics. Standing low to the ground with an iconic pointed amber hat, they can slip right under swinging pendulum traps and snatch gold coins before larger rivals even notice!`,
    stats: {
      speed: 90,
      jump: 85,
      strength: 60,
      sabotage: 75
    },
    specialAbility: 'Low Profile — Lower collision height when crouching, perfect for dodging overhead lightning traps and sneaking into hoard vaults.'
  },
  sprite: {
    name: 'Sprite',
    title: 'The High-Flying Mischief',
    badgeClass: 'sprite',
    colorVar: 'var(--hauler-sprite)',
    glowVar: 'var(--hauler-sprite-glow)',
    portraitImage: 'assets/images/action_portrait_sprite.png',
    sheetImage: 'assets/images/sprite_character_sheet_1784606136069.jpg',
    backstory: `Born from celestial ether mist, the Sky Blue Sprite is a nimble creature with ethereal wing nubs. Sprites view dungeon crawling as a high-stakes sport. They love leap-frogging over lava pits, hovering above crumbling stone bridges, and tossing coin sacks over their friends' heads!`,
    stats: {
      speed: 95,
      jump: 95,
      strength: 50,
      sabotage: 80
    },
    specialAbility: 'Feather Lift — Exceptional airtime control allowing precision jumps across wide pit traps.'
  },
  halfling: {
    name: 'Halfling',
    title: 'The Unstoppable Collector',
    badgeClass: 'halfling',
    colorVar: 'var(--hauler-halfling)',
    glowVar: 'var(--hauler-halfling-glow)',
    portraitImage: 'assets/images/action_portrait_halfling.png',
    sheetImage: 'assets/images/halfling_character_sheet_1784606150621.jpg',
    backstory: `Driven by pure gold lust and an unquenchable desire for complete treasure sets, the Halfling is the ultimate hoarder. Recognized by their pink tunic and curly hair, they carry double-stacked chests without flinching and will argue passionately during the Fork voting chamber to secure their preferred route!`,
    stats: {
      speed: 70,
      jump: 70,
      strength: 85,
      sabotage: 85
    },
    specialAbility: 'Master Carrier — Reduced speed penalty from heavy treasure stacks; immune to minor trips.'
  },
  dwarf: {
    name: 'Dwarf',
    title: 'The Heavy Hitter',
    badgeClass: 'dwarf',
    colorVar: 'var(--hauler-dwarf)',
    glowVar: 'var(--hauler-dwarf-glow)',
    portraitImage: 'assets/images/action_portrait_dwarf.png',
    sheetImage: 'assets/images/dwarf_character_sheet_1784606165897.jpg',
    backstory: `Stout, broad-chested, and sporting a thick braided beard, the Crimson Dwarf is a powerhouse. Dwarves don't just dodge traps — they push rivals straight into them! If another hauler gets too greedy, the Dwarf delivers a devastating shoulder push to scatter their loot across the floor.`,
    stats: {
      speed: 65,
      jump: 65,
      strength: 100,
      sabotage: 95
    },
    specialAbility: 'Heavy Brawler — Maximized push and trip force, spilling rival carry stacks with ease.'
  }
};

function initCharacterSwitcher() {
  const tabs = document.querySelectorAll('.char-tab-btn');
  const nameEl = document.getElementById('char-name');
  const titleEl = document.getElementById('char-title');
  const badgeEl = document.getElementById('char-badge');
  const imgEl = document.getElementById('char-img');
  const backstoryEl = document.getElementById('char-backstory');
  const specialEl = document.getElementById('char-special');

  const speedFill = document.getElementById('stat-speed');
  const jumpFill = document.getElementById('stat-jump');
  const strengthFill = document.getElementById('stat-strength');
  const sabotageFill = document.getElementById('stat-sabotage');

  if (!tabs.length || !nameEl) return;

  function setCharacter(key) {
    const char = CHARACTER_DATA[key];
    if (!char) return;

    // Active state
    tabs.forEach(t => t.classList.remove('active'));
    document.querySelector(`.char-tab-btn[data-char="${key}"]`)?.classList.add('active');

    // Update content
    nameEl.textContent = char.name;
    titleEl.textContent = char.title;
    badgeEl.textContent = char.name;
    badgeEl.className = `char-badge ${char.badgeClass}`;
    imgEl.src = char.portraitImage;
    imgEl.alt = `${char.name} Action Character Portrait`;
    backstoryEl.textContent = char.backstory;
    specialEl.textContent = char.specialAbility;

    // Update stat bars using CSS variable tokens
    updateStatBar(speedFill, char.stats.speed, char.colorVar, char.glowVar);
    updateStatBar(jumpFill, char.stats.jump, char.colorVar, char.glowVar);
    updateStatBar(strengthFill, char.stats.strength, char.colorVar, char.glowVar);
    updateStatBar(sabotageFill, char.stats.sabotage, char.colorVar, char.glowVar);
  }

  function updateStatBar(el, val, colorVar, glowVar) {
    if (el) {
      el.style.width = `${val}%`;
      el.style.backgroundColor = colorVar;
      el.style.boxShadow = `0 0 10px ${glowVar}`;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const charKey = tab.getAttribute('data-char');
      setCharacter(charKey);
    });
  });

  // Default to Gnome
  setCharacter('gnome');
}

/* Interactive Arcade & Seat Simulator on play.html */
function initArcadeSimulator() {
  const seatBtns = document.querySelectorAll('.seat-select-btn');
  const selectedSeatText = document.getElementById('selected-seat-name');
  const generateCodeBtn = document.getElementById('btn-gen-code');
  const roomCodeInput = document.getElementById('room-code-val');
  const readyBtn = document.getElementById('btn-arcade-ready');
  const statusBadge = document.getElementById('arcade-status');

  if (seatBtns.length > 0) {
    seatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        seatBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const charName = btn.getAttribute('data-seat-char');
        if (selectedSeatText) selectedSeatText.textContent = charName;
      });
    });
  }

  if (generateCodeBtn && roomCodeInput) {
    generateCodeBtn.addEventListener('click', () => {
      const randomCode = 'DH-' + Math.floor(1000 + Math.random() * 9000);
      roomCodeInput.value = randomCode;
    });
  }

  if (readyBtn && statusBadge) {
    readyBtn.addEventListener('click', () => {
      if (readyBtn.textContent.includes('READY')) {
        readyBtn.textContent = 'TOGGLE UNREADY';
        statusBadge.textContent = 'SEAT READY • WAITING FOR HOST';
        statusBadge.style.background = 'var(--color-success)';
      } else {
        readyBtn.textContent = 'CLICK TO READY UP';
        statusBadge.textContent = 'PLACEHOLDER MODE • GAME LAUNCHING SOON';
        statusBadge.style.background = 'var(--gold-primary)';
      }
    });
  }
}

/* Rules Search / Filter on instructions.html */
function initRulesFilter() {
  const searchInput = document.getElementById('modifier-search');
  const rows = document.querySelectorAll('.modifier-table tbody tr');

  if (searchInput && rows.length > 0) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }
}
