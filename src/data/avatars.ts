import { AvatarItem, CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'all', name: 'Semua Watak', iconName: 'Sparkles', color: 'bg-indigo-500' },
  { id: 'superhero', name: 'Wira Super 3D', iconName: 'Zap', color: 'bg-amber-500' },
  { id: 'royal', name: 'Putera & Puteri 3D', iconName: 'Crown', color: 'bg-purple-500' },
  { id: 'astronaut', name: 'Angkasawan 3D', iconName: 'Rocket', color: 'bg-cyan-500' },
  { id: 'scientist', name: 'Saintis 3D', iconName: 'FlaskConical', color: 'bg-emerald-500' },
  { id: 'teacher', name: 'Guru 3D', iconName: 'GraduationCap', color: 'bg-blue-500' },
  { id: 'doctor', name: 'Doktor 3D', iconName: 'Stethoscope', color: 'bg-rose-500' },
  { id: 'athlete', name: 'Ahli Sukan 3D', iconName: 'Award', color: 'bg-orange-500' },
  { id: 'footballer', name: 'Pemain Bola 3D', iconName: 'Trophy', color: 'bg-yellow-500' },
  { id: 'firefighter', name: 'Anggota Bomba 3D', iconName: 'Flame', color: 'bg-red-500' },
  { id: 'traditional', name: 'Tradisional Melayu 3D', iconName: 'HeartHandshake', color: 'bg-teal-500' },
  { id: 'explorer', name: 'Pengembara 3D', iconName: 'Compass', color: 'bg-lime-600' },
  { id: 'fantasy', name: 'Watak Fantasi 3D', iconName: 'Wand2', color: 'bg-fuchsia-500' }
];

export const AVATARS: AvatarItem[] = [
  // 1. Wira Super 3D (Lelaki)
  {
    id: 'superhero_boy',
    name: 'Wira Kilat Perkasa 3D',
    category: 'superhero',
    gender: 'lelaki',
    roleTitle: 'Wira Penyelamat Bumi 3D',
    badgeText: '⚡ Wira Kilat 3D',
    themeColor: '#2563eb',
    description: 'Baju zirah wira 3D dengan pencahayaan neon, jubah beralun tebal dan lambang kilat timbul emas.',
    faceHole: { cx: 300, cy: 300, rx: 94, ry: 120 },
    svgForeground: `
      <defs>
        <!-- 3D Gradients -->
        <linearGradient id="sh3d_body" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="40%" stop-color="#1d4ed8" />
          <stop offset="85%" stop-color="#172554" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
        <radialGradient id="sh3d_chest" cx="50%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#60a5fa" />
          <stop offset="60%" stop-color="#2563eb" />
          <stop offset="100%" stop-color="#1e3a8a" />
        </radialGradient>
        <linearGradient id="sh3d_gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="35%" stop-color="#facc15" />
          <stop offset="70%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#854d0e" />
        </linearGradient>
        <linearGradient id="sh3d_cape" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#ef4444" />
          <stop offset="40%" stop-color="#dc2626" />
          <stop offset="80%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </linearGradient>
        <linearGradient id="sh3d_bevel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#1e3a8a" stop-opacity="0.2" />
        </linearGradient>
        <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <!-- 3D Flowing Cape Folds -->
      <path d="M 110 420 Q 70 650 90 890 L 195 890 Q 170 630 195 435 Z" fill="url(#sh3d_cape)" />
      <path d="M 490 420 Q 530 650 510 890 L 405 890 Q 430 630 405 435 Z" fill="url(#sh3d_cape)" />
      <!-- Cape Inner Shadow Folds -->
      <path d="M 125 460 Q 115 670 140 890 L 165 890 Q 145 660 155 450 Z" fill="#7f1d1d" opacity="0.6" />
      <path d="M 475 460 Q 485 670 460 890 L 435 890 Q 455 660 445 450 Z" fill="#7f1d1d" opacity="0.6" />

      <!-- 3D Superhero Torso Armor -->
      <path d="M 155 420 Q 300 460 445 420 L 470 820 Q 300 840 130 820 Z" fill="url(#sh3d_body)" />
      
      <!-- 3D Curved Chest Muscle Plates -->
      <path d="M 170 430 Q 300 480 430 430 L 415 570 Q 300 630 185 570 Z" fill="url(#sh3d_chest)" stroke="#93c5fd" stroke-width="3" />
      
      <!-- Ambient Occlusion Shadow Under Neck Collar -->
      <ellipse cx="300" cy="425" rx="140" ry="24" fill="#090d16" opacity="0.75" />

      <!-- High-Tech Neon Accent Lines -->
      <path d="M 220 480 Q 250 540 220 620" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" filter="url(#glow3d)" />
      <path d="M 380 480 Q 350 540 380 620" fill="none" stroke="#60a5fa" stroke-width="4" stroke-linecap="round" filter="url(#glow3d)" />

      <!-- 3D Embossed Gold Lightning Chest Emblem -->
      <g filter="url(#glow3d)">
        <!-- Shadow Behind Lightning -->
        <polygon points="307,472 332,522 297,527 322,592 272,542 297,537" fill="#451a03" opacity="0.7" />
        <!-- Gold Bevel -->
        <polygon points="305,470 330,520 295,525 320,590 270,540 295,535" fill="url(#sh3d_gold)" stroke="#fef08a" stroke-width="3" />
      </g>

      <!-- 3D Padded High-Collar Framing the Face -->
      <path d="M 175 410 Q 235 435 300 435 Q 365 435 425 410 L 440 450 Q 300 480 160 450 Z" fill="#1e3a8a" stroke="#60a5fa" stroke-width="4" />
      <path d="M 180 415 Q 300 442 420 415" fill="none" stroke="#93c5fd" stroke-width="2" />

      <!-- 3D Metallic Hero Headband / Crown on Forehead -->
      <path d="M 195 240 Q 300 200 405 240 Q 385 160 300 150 Q 215 160 195 240 Z" fill="url(#sh3d_body)" stroke="url(#sh3d_gold)" stroke-width="6" />
      <!-- Specular Crown Highlight -->
      <path d="M 230 180 Q 300 160 370 180" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round" />
      <!-- Center Gold Crest -->
      <polygon points="300,165 315,192 345,195 322,215 328,245 300,228 272,245 278,215 255,195 285,192" fill="url(#sh3d_gold)" stroke="#ffffff" stroke-width="2" />

      <!-- 3D Power Belt with Glowing Reactor Buckle -->
      <rect x="175" y="660" width="250" height="48" rx="14" fill="url(#sh3d_gold)" stroke="#fef08a" stroke-width="3" />
      <circle cx="300" cy="684" r="32" fill="#0f172a" stroke="#facc15" stroke-width="5" />
      <circle cx="300" cy="684" r="22" fill="#38bdf8" filter="url(#glow3d)" />
      <circle cx="300" cy="684" r="10" fill="#ffffff" />
    `
  },

  // 2. Srikandi Bintang Angkasa 3D (Perempuan)
  {
    id: 'superhero_girl',
    name: 'Wira Bintang Angkasa 3D',
    category: 'superhero',
    gender: 'perempuan',
    roleTitle: 'Pelindung Galaksi 3D',
    badgeText: '⭐ Bintang Gemilang 3D',
    themeColor: '#d946ef',
    description: 'Sut wira galaksi 3D dengan tiara permata bercahaya dan jubah baldu ungu metalik.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <linearGradient id="sg3d_body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="45%" stop-color="#d946ef" />
          <stop offset="85%" stop-color="#7e22ce" />
          <stop offset="100%" stop-color="#3b0764" />
        </linearGradient>
        <linearGradient id="sg3d_gold" x1="0" y1="0" x2="1" y2="0.8">
          <stop offset="0%" stop-color="#fffbeb" />
          <stop offset="30%" stop-color="#fde047" />
          <stop offset="70%" stop-color="#eab308" />
          <stop offset="100%" stop-color="#a16207" />
        </linearGradient>
      </defs>

      <!-- 3D Velvet Purple Flowing Cape -->
      <path d="M 110 430 Q 70 660 85 890 L 190 890 Q 170 630 190 440 Z" fill="#581c87" />
      <path d="M 490 430 Q 530 660 515 890 L 410 890 Q 430 630 410 440 Z" fill="#581c87" />
      
      <!-- 3D Form-Fitting Torso Suit -->
      <path d="M 160 420 Q 300 455 440 420 L 460 820 Q 300 840 140 820 Z" fill="url(#sg3d_body)" />
      
      <!-- 3D Metallic Breastplate with Curved Highlight -->
      <path d="M 180 430 Q 300 480 420 430 L 390 570 Q 300 630 210 570 Z" fill="#c026d3" stroke="#f0abfc" stroke-width="4" />
      <path d="M 210 460 Q 300 500 390 460" fill="none" stroke="#ffffff" stroke-width="3" opacity="0.5" stroke-linecap="round" />

      <!-- Neck Ambient Shadow -->
      <ellipse cx="300" cy="425" rx="130" ry="22" fill="#2e1065" opacity="0.75" />

      <!-- 3D Star Crest in Center -->
      <polygon points="300,480 316,515 354,518 324,543 333,580 300,559 267,580 276,543 246,518 284,515" fill="url(#sg3d_gold)" stroke="#ffffff" stroke-width="2.5" />
      <circle cx="300" cy="535" r="8" fill="#ffffff" opacity="0.9" />

      <!-- 3D Tiara Headpiece on Forehead -->
      <path d="M 185 245 Q 300 170 415 245 Q 385 155 300 145 Q 215 155 185 245 Z" fill="#9333ea" stroke="url(#sg3d_gold)" stroke-width="6" />
      <polygon points="300,160 312,182 335,185 317,200 323,222 300,209 277,222 283,200 265,185 288,182" fill="url(#sg3d_gold)" />
      <circle cx="300" cy="195" r="5" fill="#f43f5e" />

      <!-- Gold Shoulder Pauldrons & Curved Neck Trim -->
      <path d="M 175 415 Q 235 440 300 440 Q 365 440 425 415 L 435 448 Q 300 475 165 448 Z" fill="url(#sg3d_gold)" stroke="#fef08a" stroke-width="3" />
      <rect x="180" y="660" width="240" height="42" rx="21" fill="url(#sg3d_gold)" />
      <circle cx="300" cy="681" r="26" fill="#ec4899" stroke="#ffffff" stroke-width="4" />
    `
  },

  // 3. Putera Mahkota Gemilang 3D (Lelaki)
  {
    id: 'royal_prince',
    name: 'Putera Mahkota Gemilang 3D',
    category: 'royal',
    gender: 'lelaki',
    roleTitle: 'Pewaris Takhta Emas 3D',
    badgeText: '👑 Putera Mahkota 3D',
    themeColor: '#b91c1c',
    description: 'Mahkota emas bertahta batu permata delima 3D, jubah baldu diraja dan kolar ermine mewah.',
    faceHole: { cx: 300, cy: 300, rx: 94, ry: 120 },
    svgForeground: `
      <defs>
        <linearGradient id="rp3d_crown" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="25%" stop-color="#facc15" />
          <stop offset="60%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#713f12" />
        </linearGradient>
        <radialGradient id="rp3d_ruby" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fca5a5" />
          <stop offset="40%" stop-color="#ef4444" />
          <stop offset="85%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </radialGradient>
        <radialGradient id="rp3d_sapphire" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#93c5fd" />
          <stop offset="45%" stop-color="#3b82f6" />
          <stop offset="90%" stop-color="#1e3a8a" />
        </radialGradient>
        <linearGradient id="rp3d_velvet" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#dc2626" />
          <stop offset="50%" stop-color="#991b1b" />
          <stop offset="100%" stop-color="#450a0a" />
        </linearGradient>
      </defs>

      <!-- 3D Ornate Golden Royal Crown with Spikes & Gemstones -->
      <g>
        <!-- Shadow Under Crown -->
        <path d="M 195 215 L 205 125 L 250 165 L 300 100 L 350 165 L 395 125 L 405 215 Z" fill="#000000" opacity="0.3" transform="translate(4, 6)" />
        <!-- Crown Body -->
        <path d="M 195 210 L 205 120 L 250 160 L 300 95 L 350 160 L 395 120 L 405 210 Q 300 225 195 210 Z" fill="url(#rp3d_crown)" stroke="#854d0e" stroke-width="4" />
        
        <!-- Crown Headband Base -->
        <rect x="190" y="195" width="220" height="30" rx="8" fill="url(#rp3d_crown)" stroke="#713f12" stroke-width="3" />
        
        <!-- Specular Highlights on Gold -->
        <path d="M 210 135 L 245 168" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
        <path d="M 300 108 L 300 155" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.8" />
        
        <!-- 3D Polished Gemstones -->
        <circle cx="300" cy="100" r="12" fill="url(#rp3d_ruby)" stroke="#ffffff" stroke-width="2" />
        <circle cx="205" cy="125" r="9" fill="url(#rp3d_sapphire)" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="395" cy="125" r="9" fill="url(#rp3d_sapphire)" stroke="#ffffff" stroke-width="1.5" />
        
        <!-- Band Inset Jewels -->
        <circle cx="240" cy="210" r="7" fill="url(#rp3d_ruby)" />
        <circle cx="300" cy="210" r="9" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
        <circle cx="360" cy="210" r="7" fill="url(#rp3d_ruby)" />
      </g>

      <!-- 3D Velvet Crimson Royal Robe -->
      <path d="M 135 415 Q 300 455 465 415 L 480 820 L 120 820 Z" fill="url(#rp3d_velvet)" />

      <!-- Neck Cavity Shadow -->
      <ellipse cx="300" cy="420" rx="135" ry="22" fill="#2d0606" opacity="0.8" />

      <!-- 3D White Ermine Fur Collar with Texture & Spots -->
      <path d="M 145 405 Q 300 475 455 405 L 445 475 Q 300 535 155 475 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4" />
      <path d="M 148 410 Q 300 480 452 410" fill="none" stroke="#ffffff" stroke-width="5" />
      <!-- Ermine Black Tuft Spots -->
      <polygon points="210,448 214,460 210,458 206,460" fill="#0f172a" />
      <polygon points="260,465 264,477 260,475 256,477" fill="#0f172a" />
      <polygon points="300,474 304,486 300,484 296,486" fill="#0f172a" />
      <polygon points="340,465 344,477 340,475 336,477" fill="#0f172a" />
      <polygon points="390,448 394,460 390,458 386,460" fill="#0f172a" />

      <!-- 3D Golden Royal Sash Across Chest -->
      <polygon points="160,430 220,430 440,730 380,730" fill="url(#rp3d_crown)" stroke="#ca8a04" stroke-width="3" />
      <path d="M 180 435 L 400 735" stroke="#ffffff" stroke-width="3" opacity="0.6" />

      <!-- 3D Embossed Gold Buttons Down Robe -->
      <circle cx="300" cy="540" r="14" fill="url(#rp3d_crown)" stroke="#78350f" stroke-width="3" />
      <circle cx="300" cy="540" r="8" fill="#fef08a" />
      <circle cx="300" cy="595" r="14" fill="url(#rp3d_crown)" stroke="#78350f" stroke-width="3" />
      <circle cx="300" cy="595" r="8" fill="#fef08a" />
      <circle cx="300" cy="650" r="14" fill="url(#rp3d_crown)" stroke="#78350f" stroke-width="3" />
      <circle cx="300" cy="650" r="8" fill="#fef08a" />
    `
  },

  // 4. Puteri Mutiara Anggun 3D (Perempuan)
  {
    id: 'royal_princess',
    name: 'Puteri Mutiara Anggun 3D',
    category: 'royal',
    gender: 'perempuan',
    roleTitle: 'Puteri Mahkota Istana 3D',
    badgeText: '✨ Puteri Mutiara 3D',
    themeColor: '#a855f7',
    description: 'Tiara berlian 3D bersinar, gaun kembang ungu pastel lembut dengan kalung mutiara berkilau.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <radialGradient id="pearlGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="60%" stop-color="#f1f5f9" />
          <stop offset="100%" stop-color="#94a3b8" />
        </radialGradient>
        <linearGradient id="tiaraGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="50%" stop-color="#facc15" />
          <stop offset="100%" stop-color="#ca8a04" />
        </linearGradient>
        <linearGradient id="gown3d" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e9d5ff" />
          <stop offset="40%" stop-color="#c084fc" />
          <stop offset="85%" stop-color="#7e22ce" />
          <stop offset="100%" stop-color="#3b0764" />
        </linearGradient>
      </defs>

      <!-- 3D Sparkling Diamond Tiara on Forehead -->
      <g>
        <path d="M 210 220 Q 250 135 300 120 Q 350 135 390 220 Q 300 230 210 220 Z" fill="url(#tiaraGold)" stroke="#ca8a04" stroke-width="4" />
        <path d="M 220 220 Q 300 238 380 220" stroke="#f59e0b" stroke-width="6" fill="none" />
        <path d="M 240 180 Q 300 145 360 180" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
        <!-- Tiara Gems -->
        <circle cx="300" cy="130" r="12" fill="#ec4899" stroke="#ffffff" stroke-width="2.5" />
        <circle cx="260" cy="165" r="8" fill="#818cf8" stroke="#ffffff" stroke-width="2" />
        <circle cx="340" cy="165" r="8" fill="#818cf8" stroke="#ffffff" stroke-width="2" />
      </g>

      <!-- 3D Ballgown Puffed Shoulders & Folds -->
      <path d="M 115 430 Q 150 395 195 420 L 205 450 Q 300 470 395 450 L 405 420 Q 450 395 485 430 L 515 820 L 85 820 Z" fill="url(#gown3d)" />

      <!-- Neck Cavity Shadow -->
      <ellipse cx="300" cy="425" rx="125" ry="22" fill="#2d1045" opacity="0.75" />

      <!-- Ruffle Lace Collar with Soft Pearl Trim -->
      <path d="M 180 420 Q 300 475 420 420 Q 300 525 180 420 Z" fill="#faf5ff" stroke="#d8b4fe" stroke-width="4" />

      <!-- 3D Shimmering Pearl Necklace -->
      <g stroke="#cbd5e1" stroke-width="1.5">
        <circle cx="230" cy="430" r="8" fill="url(#pearlGrad)" />
        <circle cx="250" cy="442" r="8.5" fill="url(#pearlGrad)" />
        <circle cx="275" cy="452" r="9.5" fill="url(#pearlGrad)" />
        <circle cx="300" cy="458" r="12" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
        <circle cx="325" cy="452" r="9.5" fill="url(#pearlGrad)" />
        <circle cx="350" cy="442" r="8.5" fill="url(#pearlGrad)" />
        <circle cx="370" cy="430" r="8" fill="url(#pearlGrad)" />
      </g>

      <!-- 3D Puffed Princess Sleeves with Highlights -->
      <ellipse cx="145" cy="480" rx="48" ry="58" fill="#d8b4fe" stroke="#a855f7" stroke-width="4" />
      <path d="M 125 450 Q 145 440 165 455" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.7" />
      <ellipse cx="455" cy="480" rx="48" ry="58" fill="#d8b4fe" stroke="#a855f7" stroke-width="4" />
      <path d="M 435 450 Q 455 440 475 455" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.7" />

      <!-- Golden Waist Ribbon & Rose Corsage -->
      <path d="M 215 620 Q 300 645 385 620 L 385 660 Q 300 685 215 660 Z" fill="url(#tiaraGold)" stroke="#ca8a04" stroke-width="3" />
      <circle cx="300" cy="642" r="16" fill="#f43f5e" stroke="#ffffff" stroke-width="3" />
    `
  },

  // 5. Angkasawan Cilik 3D (Unisex)
  {
    id: 'astronaut',
    name: 'Angkasawan Cilik Marikh 3D',
    category: 'astronaut',
    gender: 'unisex',
    roleTitle: 'Peneroka Angkasa Lepas 3D',
    badgeText: '🚀 Misi Marikh 3D',
    themeColor: '#0ea5e9',
    description: 'Sut angkasa 3D realistik dengan visor kubah berkilau kaca, paip oksigen dan pek instrumen.',
    faceHole: { cx: 300, cy: 300, rx: 94, ry: 120 },
    svgForeground: `
      <defs>
        <linearGradient id="astroHelmet3d" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="45%" stop-color="#e2e8f0" />
          <stop offset="85%" stop-color="#94a3b8" />
          <stop offset="100%" stop-color="#475569" />
        </linearGradient>
        <linearGradient id="visorGlassReflect" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
          <stop offset="40%" stop-color="#0284c7" stop-opacity="0.4" />
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0.1" />
        </linearGradient>
      </defs>

      <!-- 3D Astronaut Space Helmet Outer Ring with Realistic Bevel -->
      <path d="M 175 300 C 175 155 425 155 425 300 C 425 440 175 440 175 300 Z" fill="none" stroke="url(#astroHelmet3d)" stroke-width="38" />
      <!-- Metallic Cyan Neon Visor Seal Ring -->
      <path d="M 183 300 C 183 170 417 170 417 300 C 417 430 183 430 183 300 Z" fill="none" stroke="#0ea5e9" stroke-width="8" />

      <!-- Curved Glass Reflection Arcs (Pixar-style glossy 3D visor) -->
      <path d="M 205 210 Q 260 180 340 185 Q 280 230 215 255 Z" fill="#ffffff" opacity="0.5" />
      <path d="M 360 210 Q 390 230 405 270" stroke="#bae6fd" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.6" />

      <!-- High-Tech Comm Antennas -->
      <rect x="148" y="270" width="22" height="65" rx="8" fill="#475569" stroke="#94a3b8" stroke-width="2" />
      <circle cx="159" cy="258" r="9" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <rect x="430" y="270" width="22" height="65" rx="8" fill="#475569" stroke="#94a3b8" stroke-width="2" />
      <circle cx="441" cy="258" r="9" fill="#10b981" stroke="#ffffff" stroke-width="2" />

      <!-- 3D Pressurized Space Suit Body with Volume & Shading -->
      <path d="M 135 425 Q 300 455 465 425 L 485 820 L 115 820 Z" fill="url(#astroHelmet3d)" stroke="#94a3b8" stroke-width="5" />

      <!-- Helmet Lock Collar Shadow -->
      <ellipse cx="300" cy="425" rx="140" ry="24" fill="#0f172a" opacity="0.8" />
      <rect x="185" y="415" width="230" height="32" rx="14" fill="#0369a1" stroke="#38bdf8" stroke-width="4" />

      <!-- 3D Chest Control Module (Computer Panel) -->
      <rect x="225" y="490" width="150" height="120" rx="16" fill="#1e293b" stroke="#64748b" stroke-width="5" />
      <circle cx="255" cy="525" r="11" fill="#22c55e" stroke="#86efac" stroke-width="2" />
      <circle cx="300" cy="525" r="11" fill="#eab308" stroke="#fef08a" stroke-width="2" />
      <circle cx="345" cy="525" r="11" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
      <rect x="245" y="555" width="110" height="36" rx="8" fill="#020617" stroke="#38bdf8" stroke-width="2" />
      <text x="300" y="578" font-size="16" font-family="sans-serif" font-weight="900" fill="#38bdf8" text-anchor="middle">MY-SPACE</text>

      <!-- 3D Oxygen Tubes (Segmented Ridges) -->
      <path d="M 185 490 Q 140 550 190 640" fill="none" stroke="#64748b" stroke-width="18" stroke-linecap="round" />
      <path d="M 185 490 Q 140 550 190 640" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-dasharray="10 8" stroke-linecap="round" />
      <path d="M 415 490 Q 460 550 410 640" fill="none" stroke="#64748b" stroke-width="18" stroke-linecap="round" />
      <path d="M 415 490 Q 460 550 410 640" fill="none" stroke="#e2e8f0" stroke-width="8" stroke-dasharray="10 8" stroke-linecap="round" />
    `
  },

  // 6. Saintis Genius Cilik 3D (Unisex)
  {
    id: 'scientist',
    name: 'Saintis Genius Cilik 3D',
    category: 'scientist',
    gender: 'unisex',
    roleTitle: 'Penyelidik Masa Depan 3D',
    badgeText: '🧪 Saintis 3D',
    themeColor: '#059669',
    description: 'Kot makmal 3D berlapel kemas dengan gogal hijau bercahaya dan tabung uji kimia berbuih ajaib.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <linearGradient id="labCoat3d" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#f1f5f9" />
          <stop offset="100%" stop-color="#cbd5e1" />
        </linearGradient>
      </defs>

      <!-- 3D Green Safety Goggles on Forehead -->
      <g>
        <path d="M 185 220 Q 300 205 415 220" stroke="#166534" stroke-width="18" fill="none" stroke-linecap="round" />
        <rect x="210" y="190" width="80" height="52" rx="16" fill="#86efac" opacity="0.88" stroke="#15803d" stroke-width="6" />
        <path d="M 220 200 L 250 200" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <rect x="310" y="190" width="80" height="52" rx="16" fill="#86efac" opacity="0.88" stroke="#15803d" stroke-width="6" />
        <path d="M 320 200 L 350 200" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
        <rect x="288" y="206" width="24" height="14" rx="4" fill="#14532d" />
      </g>

      <!-- 3D White Lab Coat Body with Shading -->
      <path d="M 145 420 Q 300 450 455 420 L 475 820 L 125 820 Z" fill="url(#labCoat3d)" stroke="#94a3b8" stroke-width="4" />

      <!-- Collar Shadow Under Chin -->
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#0f172a" opacity="0.6" />

      <!-- Teal Inner Shirt & Red Bowtie/Tie -->
      <polygon points="300,430 255,540 345,540" fill="#0284c7" />
      <polygon points="300,445 300,535 280,525" fill="#dc2626" />
      <circle cx="300" cy="450" r="8" fill="#b91c1c" />

      <!-- 3D Lapels with Realistic Cast Shadows -->
      <path d="M 205 420 L 255 540 L 175 540 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="4" />
      <path d="M 395 420 L 345 540 L 425 540 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="4" />

      <!-- Pocket with Multi-color Pens -->
      <rect x="360" y="565" width="75" height="90" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" />
      <rect x="375" y="540" width="9" height="32" rx="3" fill="#2563eb" />
      <rect x="395" y="535" width="9" height="37" rx="3" fill="#dc2626" />
      <rect x="415" y="545" width="9" height="27" rx="3" fill="#f59e0b" />

      <!-- Bubbling Glowing Flask in Hand -->
      <g transform="translate(130, 620)">
        <path d="M 30 0 L 30 65 Q 30 90 48 90 Q 66 90 66 65 L 66 0 Z" fill="#a7f3d0" stroke="#059669" stroke-width="5" />
        <path d="M 32 35 L 32 65 Q 32 88 48 88 Q 64 88 64 65 L 64 35 Z" fill="#10b981" />
        <circle cx="48" cy="48" r="6" fill="#ffffff" opacity="0.8" />
        <circle cx="56" cy="65" r="4" fill="#ffffff" opacity="0.8" />
        <circle cx="42" cy="74" r="4" fill="#ffffff" opacity="0.8" />
      </g>
    `
  },

  // 7. Cikgu Inspirasi 3D (Unisex)
  {
    id: 'teacher',
    name: 'Cikgu Inspirasi Ceria 3D',
    category: 'teacher',
    gender: 'unisex',
    roleTitle: 'Pendidik Anak Bangsa 3D',
    badgeText: '📚 Cikgu Teladan 3D',
    themeColor: '#2563eb',
    description: 'Blazer biru diraja 3D dengan lanyard lanyard kad guru dan susunan buku bertekstur emas.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <linearGradient id="blazer3d" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#2563eb" />
          <stop offset="45%" stop-color="#1d4ed8" />
          <stop offset="85%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>

      <!-- 3D Tailored School Blazer -->
      <path d="M 145 420 Q 300 450 455 420 L 475 820 L 125 820 Z" fill="url(#blazer3d)" stroke="#1e3a8a" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#0a192f" opacity="0.75" />

      <!-- Crisp White Shirt Inside & Red Tie -->
      <polygon points="300,430 250,530 350,530" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
      <polygon points="300,450 285,530 315,530" fill="#dc2626" />

      <!-- Blazer Lapels with Depth -->
      <path d="M 195 420 L 260 550 L 165 540 Z" fill="#1e40af" stroke="#172554" stroke-width="4" />
      <path d="M 405 420 L 340 550 L 435 540 Z" fill="#1e40af" stroke="#172554" stroke-width="4" />

      <!-- Golden Lanyard & Official School ID Card Badge -->
      <path d="M 265 430 L 285 590" stroke="#f59e0b" stroke-width="7" />
      <path d="M 335 430 L 315 590" stroke="#f59e0b" stroke-width="7" />
      <rect x="270" y="585" width="60" height="78" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="4" />
      <rect x="280" y="595" width="40" height="26" fill="#3b82f6" rx="4" />
      <line x1="280" y1="632" x2="320" y2="632" stroke="#64748b" stroke-width="4" />
      <line x1="280" y1="645" x2="310" y2="645" stroke="#64748b" stroke-width="3" />

      <!-- Golden Apple Badge Pin -->
      <circle cx="205" cy="495" r="14" fill="#ef4444" stroke="#ffffff" stroke-width="2" />
      <path d="M 205 482 Q 210 475 215 480" stroke="#16a34a" stroke-width="3" fill="none" />

      <!-- 3D Stack of Hardcover Books -->
      <g transform="translate(365, 640)">
        <rect x="0" y="0" width="85" height="25" rx="5" fill="#dc2626" stroke="#991b1b" stroke-width="3" />
        <rect x="4" y="25" width="80" height="25" rx="5" fill="#059669" stroke="#065f46" stroke-width="3" />
        <rect x="2" y="50" width="86" height="25" rx="5" fill="#d97706" stroke="#92400e" stroke-width="3" />
      </g>
    `
  },

  // 8. Doktor Pakar 3D (Unisex)
  {
    id: 'doctor',
    name: 'Doktor Pakar Penyayang 3D',
    category: 'doctor',
    gender: 'unisex',
    roleTitle: 'Pakar Kesihatan Hospital 3D',
    badgeText: '🩺 Doktor Cilik 3D',
    themeColor: '#e11d48',
    description: 'Kot perubatan 3D dengan stetoskop logam berbayang realistik dan lambang palang merah timbul.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <radialGradient id="stethChrome" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="50%" stop-color="#cbd5e1" />
          <stop offset="90%" stop-color="#475569" />
          <stop offset="100%" stop-color="#1e293b" />
        </radialGradient>
      </defs>

      <!-- 3D White Medical Coat -->
      <path d="M 145 420 Q 300 450 455 420 L 475 820 L 125 820 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#0f172a" opacity="0.65" />

      <!-- Surgical Scrub V-Neck Inside -->
      <polygon points="300,430 255,520 345,520" fill="#0d9488" stroke="#0f766e" stroke-width="2" />
      <polygon points="300,442 270,510 330,510" fill="#14b8a6" />

      <!-- 3D Molded Matte Black Stethoscope with Chrome Highlights -->
      <path d="M 235 430 Q 200 520 245 605 Q 280 660 300 670 Q 320 660 355 605 Q 400 520 365 430" fill="none" stroke="#1e293b" stroke-width="15" stroke-linecap="round" />
      <path d="M 238 435 Q 205 520 248 600" fill="none" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      
      <!-- Stethoscope Chrome Bell Chestpiece with Realistic Specular Sheen -->
      <circle cx="300" cy="675" r="26" fill="url(#stethChrome)" stroke="#0f172a" stroke-width="4" />
      <circle cx="300" cy="675" r="14" fill="#64748b" stroke="#ffffff" stroke-width="2" />

      <!-- Red Cross Badge in Pocket -->
      <rect x="365" y="550" width="68" height="85" rx="10" fill="#ffffff" stroke="#e2e8f0" stroke-width="4" />
      <rect x="393" y="568" width="12" height="38" fill="#ef4444" rx="3" />
      <rect x="380" y="581" width="38" height="12" fill="#ef4444" rx="3" />
    `
  },

  // 9. Juara Olahraga Emas 3D (Unisex)
  {
    id: 'athlete',
    name: 'Juara Olahraga Emas 3D',
    category: 'athlete',
    gender: 'unisex',
    roleTitle: 'Jaguh Sukan Negara 3D',
    badgeText: '🥇 Juara Emas 3D',
    themeColor: '#ea580c',
    description: 'Jaket sukan Malaysia moden 3D dengan pingat emas berkepak bintang dan tali riben berjalur.',
    faceHole: { cx: 300, cy: 300, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <radialGradient id="goldMedal3d" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="40%" stop-color="#facc15" />
          <stop offset="85%" stop-color="#ca8a04" />
          <stop offset="100%" stop-color="#78350f" />
        </radialGradient>
      </defs>

      <!-- 3D Athletic Tracksuit Jacket -->
      <path d="M 145 420 Q 300 450 455 420 L 465 820 L 135 820 Z" fill="#0f172a" stroke="#1e293b" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#000000" opacity="0.8" />

      <!-- Harimau Yellow Tiger Racing Stripes on Shoulders -->
      <path d="M 145 420 L 190 420 L 165 570 L 140 570 Z" fill="#facc15" />
      <path d="M 455 420 L 410 420 L 435 570 L 460 570 Z" fill="#facc15" />

      <!-- Sport Jacket Collar with Red Inner Accent -->
      <polygon points="300,430 260,510 340,510" fill="#dc2626" />
      <path d="M 205 420 L 265 510 L 245 510 Z" fill="#facc15" />
      <path d="M 395 420 L 335 510 L 355 510 Z" fill="#facc15" />

      <!-- 3D Olympic Ribbon Lanyard -->
      <path d="M 240 430 L 290 600" stroke="#dc2626" stroke-width="14" />
      <path d="M 245 430 L 295 600" stroke="#ffffff" stroke-width="5" />
      <path d="M 360 430 L 310 600" stroke="#dc2626" stroke-width="14" />
      <path d="M 355 430 L 305 600" stroke="#ffffff" stroke-width="5" />

      <!-- 3D Embossed Heavy Gold Medal with Bevel & Stars -->
      <circle cx="300" cy="630" r="38" fill="url(#goldMedal3d)" stroke="#78350f" stroke-width="6" />
      <circle cx="300" cy="630" r="28" fill="#fef08a" stroke="#eab308" stroke-width="3" />
      <polygon points="300,608 307,624 324,625 311,636 316,652 300,643 284,652 289,636 276,625 293,624" fill="#ca8a04" />
      <path d="M 280 610 Q 300 600 320 610" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.8" />
    `
  },

  // 10. Pemain Bola Sepak 3D (Unisex)
  {
    id: 'footballer',
    name: 'Pemain Bola Harimau 3D',
    category: 'footballer',
    gender: 'unisex',
    roleTitle: 'Bintang Padang Bola 3D',
    badgeText: '⚽ Penjaring Gol 3D',
    themeColor: '#eab308',
    description: 'Jersi kuning belang hitam skuad Harimau 3D dengan lilitan kapten dan bola sepak realistik.',
    faceHole: { cx: 300, cy: 300, rx: 90, ry: 116 },
    svgForeground: `
      <!-- 3D Football Jersey -->
      <path d="M 145 420 Q 300 450 455 420 L 465 820 L 135 820 Z" fill="#facc15" stroke="#ca8a04" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#713f12" opacity="0.65" />

      <!-- Black Jersey Stripes with Shading -->
      <rect x="195" y="440" width="32" height="380" fill="#0f172a" />
      <rect x="284" y="450" width="32" height="370" fill="#0f172a" />
      <rect x="373" y="440" width="32" height="380" fill="#0f172a" />

      <!-- V-Neck Collar with Depth -->
      <polygon points="300,470 240,420 360,420" fill="#0f172a" stroke="#ffffff" stroke-width="2" />

      <!-- Embossed Number 10 Gold & White -->
      <text x="300" y="585" font-size="68" font-family="'Fredoka', sans-serif" font-weight="900" fill="#ffffff" stroke="#000000" stroke-width="6" text-anchor="middle">10</text>

      <!-- Captain Armband on Sleeve -->
      <rect x="425" y="515" width="36" height="42" rx="6" fill="#2563eb" stroke="#ffffff" stroke-width="2" />
      <text x="443" y="546" font-size="28" font-weight="900" fill="#ffffff" text-anchor="middle">C</text>

      <!-- 3D Realistic Soccer Ball at Bottom -->
      <g transform="translate(135, 630)">
        <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#0f172a" stroke-width="6" />
        <polygon points="50,28 66,40 60,60 40,60 34,40" fill="#0f172a" />
        <line x1="50" y1="28" x2="50" y2="8" stroke="#0f172a" stroke-width="4" />
        <line x1="66" y1="40" x2="88" y2="32" stroke="#0f172a" stroke-width="4" />
        <line x1="60" y1="60" x2="78" y2="80" stroke="#0f172a" stroke-width="4" />
        <line x1="40" y1="60" x2="22" y2="80" stroke="#0f172a" stroke-width="4" />
        <line x1="34" y1="40" x2="12" y2="32" stroke="#0f172a" stroke-width="4" />
        <path d="M 30 25 Q 50 15 70 25" stroke="#ffffff" stroke-width="4" fill="none" opacity="0.8" />
      </g>
    `
  },

  // 11. Wira Bomba Perkasa 3D (Unisex)
  {
    id: 'firefighter',
    name: 'Wira Bomba Perkasa 3D',
    category: 'firefighter',
    gender: 'unisex',
    roleTitle: 'Penyelamat Berani 3D',
    badgeText: '🚒 Wira Bomba 3D',
    themeColor: '#dc2626',
    description: 'Topi keledar bomba merah berkilat 3D dengan jaket pemadam api tahan haba dan jalur pemantul neon.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <!-- 3D Firefighter Helmet with Glossy Ridge & Shield -->
      <g>
        <path d="M 170 260 Q 300 210 430 260 L 440 330 Q 300 290 160 330 Z" fill="#7f1d1d" />
        <path d="M 175 230 C 175 125 425 125 425 230 Q 300 195 175 230 Z" fill="#dc2626" stroke="#991b1b" stroke-width="6" />
        <path d="M 210 180 Q 300 155 390 180" stroke="#fca5a5" stroke-width="5" fill="none" stroke-linecap="round" />
        
        <!-- Front Helmet Rim -->
        <path d="M 155 235 Q 300 205 445 235 Q 300 260 155 235 Z" fill="#991b1b" stroke="#facc15" stroke-width="4" />
        
        <!-- Gold Firefighter Shield Badge -->
        <polygon points="300,155 328,180 318,220 300,232 282,220 272,180" fill="#facc15" stroke="#ca8a04" stroke-width="3" />
        <path d="M 300 170 Q 310 192 300 212 Q 290 192 300 170 Z" fill="#ef4444" />
      </g>

      <!-- 3D Heavy Turnout Gear Jacket -->
      <path d="M 135 425 Q 300 455 465 425 L 480 820 L 120 820 Z" fill="#78350f" stroke="#451a03" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="135" ry="22" fill="#2d1303" opacity="0.8" />

      <!-- Fluorescent Safety Reflective Strips (Neon Lime & Silver) -->
      <rect x="140" y="520" width="320" height="42" fill="#facc15" stroke="#ca8a04" stroke-width="3" />
      <rect x="140" y="530" width="320" height="22" fill="#ffffff" />
      <rect x="130" y="660" width="340" height="42" fill="#facc15" stroke="#ca8a04" stroke-width="3" />
      <rect x="130" y="670" width="340" height="22" fill="#ffffff" />

      <!-- Thick Padded Collar -->
      <path d="M 185 420 Q 300 460 415 420 L 425 465 Q 300 495 175 465 Z" fill="#9a3412" stroke="#facc15" stroke-width="4" />

      <!-- Heavy Duty Water Hose Nozzle -->
      <path d="M 125 720 Q 180 670 245 760" fill="none" stroke="#e2e8f0" stroke-width="30" stroke-linecap="round" />
      <rect x="225" y="740" width="38" height="52" rx="8" fill="#f59e0b" stroke="#b45309" stroke-width="4" />
    `
  },

  // 12. Pendekar Melayu Bertanjak 3D (Lelaki)
  {
    id: 'traditional_boy',
    name: 'Pendekar Melayu Bertanjak 3D',
    category: 'traditional',
    gender: 'lelaki',
    roleTitle: 'Pendekar Warisan Bangsa 3D',
    badgeText: '🗡️ Pendekar 3D',
    themeColor: '#0f766e',
    description: 'Baju Melayu Cekak Musang hijau zamrud 3D dengan Tanjak daun menjulang dan sampin songket tenun emas.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <defs>
        <linearGradient id="songketGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fef9c3" />
          <stop offset="40%" stop-color="#f59e0b" />
          <stop offset="85%" stop-color="#b45309" />
          <stop offset="100%" stop-color="#78350f" />
        </linearGradient>
      </defs>

      <!-- 3D Tanjak Melayu Warisan Megah -->
      <g>
        <!-- Daun Tanjak Menjulang Gagah -->
        <path d="M 225 220 L 290 75 L 365 165 L 415 230 Q 300 240 225 220 Z" fill="#047857" stroke="url(#songketGold)" stroke-width="6" />
        <path d="M 255 175 L 320 115 L 375 185 Z" fill="#065f46" stroke="#facc15" stroke-width="3" />
        <!-- Solok Lipatan Tanjak Emas -->
        <rect x="190" y="210" width="220" height="34" rx="10" fill="url(#songketGold)" stroke="#78350f" stroke-width="3" />
        <circle cx="300" cy="227" r="8" fill="#dc2626" stroke="#ffffff" stroke-width="2" />
        <path d="M 240 130 L 280 85" stroke="#ffffff" stroke-width="3" opacity="0.6" stroke-linecap="round" />
      </g>

      <!-- 3D Baju Melayu Cekak Musang Hijau Zamrud -->
      <path d="M 145 420 Q 300 450 455 420 L 470 820 L 130 820 Z" fill="#065f46" stroke="#064e3b" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#022c22" opacity="0.8" />

      <!-- Kolar Cekak Musang Kemas Berbutang Emas Suasa -->
      <path d="M 225 420 Q 300 450 375 420 L 365 460 Q 300 480 235 460 Z" fill="#047857" stroke="url(#songketGold)" stroke-width="4" />
      <circle cx="300" cy="470" r="7" fill="url(#songketGold)" stroke="#78350f" stroke-width="2" />
      <circle cx="300" cy="502" r="7" fill="url(#songketGold)" stroke="#78350f" stroke-width="2" />
      <circle cx="300" cy="534" r="7" fill="url(#songketGold)" stroke="#78350f" stroke-width="2" />

      <!-- Kain Sampin Songket Tenun Emas Berkepala -->
      <path d="M 145 625 L 455 625 L 460 820 L 140 820 Z" fill="url(#songketGold)" stroke="#78350f" stroke-width="5" />
      <!-- Corak Pucuk Rebung Songket Merah -->
      <polygon points="180,635 200,670 160,670" fill="#dc2626" />
      <polygon points="240,635 260,670 220,670" fill="#dc2626" />
      <polygon points="300,635 320,670 280,670" fill="#dc2626" />
      <polygon points="360,635 380,670 340,670" fill="#dc2626" />
      <polygon points="420,635 440,670 400,670" fill="#dc2626" />

      <!-- Hulu Keris Diraja Melayu -->
      <g transform="translate(195, 595)">
        <path d="M 22 22 Q 10 -12 32 -22 Q 44 -16 38 16 Z" fill="#78350f" stroke="url(#songketGold)" stroke-width="3" />
        <circle cx="30" cy="-6" r="7" fill="url(#songketGold)" />
      </g>
    `
  },

  // 13. Gadis Melayu Berselendang 3D (Perempuan)
  {
    id: 'traditional_girl',
    name: 'Gadis Melayu Berselendang 3D',
    category: 'traditional',
    gender: 'perempuan',
    roleTitle: 'Puteri Warisan Anggun 3D',
    badgeText: '🌺 Busana Melayu 3D',
    themeColor: '#0d9488',
    description: 'Baju Kurung labuh sutera pirus 3D dengan selendang anggun dan kerongsang dokoh 3 tingkat bertatah permata.',
    faceHole: { cx: 300, cy: 305, rx: 88, ry: 115 },
    svgForeground: `
      <!-- 3D Flowing Hijab / Selendang Framing the Face -->
      <path d="M 185 280 C 185 155 415 155 415 280 C 415 415 390 445 370 445 Q 300 465 230 445 C 210 445 185 415 185 280 Z" fill="none" stroke="#2dd4bf" stroke-width="26" stroke-linejoin="round" />
      <!-- Anak Tudung Lembut di Dahi -->
      <path d="M 205 220 Q 300 198 395 220 Q 300 236 205 220 Z" fill="#0f766e" />

      <!-- Baju Kurung Sutera Pirus -->
      <path d="M 140 430 Q 300 455 460 430 L 475 820 L 125 820 Z" fill="#0d9488" stroke="#115e59" stroke-width="5" />
      <ellipse cx="300" cy="430" rx="130" ry="20" fill="#042f2e" opacity="0.8" />

      <!-- Sulaman Biku Songket di Leher -->
      <path d="M 205 435 Q 300 470 395 435" stroke="#facc15" stroke-width="9" fill="none" />

      <!-- Kerongsang Dokoh 3 Tingkat Emas Berkilau -->
      <polygon points="300,470 320,486 300,502 280,486" fill="#facc15" stroke="#b45309" stroke-width="3" />
      <circle cx="300" cy="486" r="5" fill="#ef4444" />
      <polygon points="300,508 326,528 300,548 274,528" fill="#facc15" stroke="#b45309" stroke-width="3" />
      <circle cx="300" cy="528" r="6" fill="#10b981" />
      <polygon points="300,554 322,572 300,590 278,572" fill="#facc15" stroke="#b45309" stroke-width="3" />
      <circle cx="300" cy="572" r="5" fill="#ef4444" />

      <!-- Selendang Beralun di Bahu Kiri -->
      <path d="M 180 430 Q 145 560 165 750 L 220 750 Q 195 580 230 440 Z" fill="#5eead4" stroke="#0f766e" stroke-width="4" />
      <circle cx="210" cy="740" r="5" fill="#facc15" />
      <circle cx="180" cy="740" r="5" fill="#facc15" />
    `
  },

  // 14. Pengembara Rimba Khatulistiwa 3D (Unisex)
  {
    id: 'explorer',
    name: 'Pengembara Rimba 3D',
    category: 'explorer',
    gender: 'unisex',
    roleTitle: 'Peneroka Alam Semula Jadi 3D',
    badgeText: '🧭 Pengembara 3D',
    themeColor: '#65a30d',
    description: 'Topi safari rimba 3D dengan jaket kembara poket banyak, teropong binokular dan kompas emas.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <!-- 3D Explorer Safari Slouch Hat -->
      <g>
        <ellipse cx="300" cy="230" rx="150" ry="36" fill="#d97706" stroke="#92400e" stroke-width="5" />
        <path d="M 200 220 C 200 120 400 120 400 220 Z" fill="#fef3c7" stroke="#d97706" stroke-width="5" />
        <rect x="205" y="210" width="190" height="22" rx="5" fill="#65a30d" />
        <circle cx="300" cy="221" r="7" fill="#facc15" />
        <path d="M 230 160 Q 300 140 370 160" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.6" />
      </g>

      <!-- 3D Khaki Multi-pocket Explorer Jacket -->
      <path d="M 140 420 Q 300 450 460 420 L 475 820 L 125 820 Z" fill="#fef3c7" stroke="#d97706" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#78350f" opacity="0.65" />

      <!-- Olive Collar Inside -->
      <polygon points="300,430 250,510 350,510" fill="#65a30d" />

      <!-- 3D Binoculars Hanging Around Neck -->
      <path d="M 235 430 L 275 580" stroke="#0f172a" stroke-width="7" />
      <path d="M 365 430 L 325 580" stroke="#0f172a" stroke-width="7" />
      <g transform="translate(265, 570)">
        <rect x="0" y="0" width="32" height="48" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="3" />
        <rect x="40" y="0" width="32" height="48" rx="10" fill="#1e293b" stroke="#64748b" stroke-width="3" />
        <rect x="26" y="16" width="20" height="14" fill="#475569" />
        <circle cx="16" cy="42" r="11" fill="#38bdf8" />
        <circle cx="56" cy="42" r="11" fill="#38bdf8" />
      </g>

      <!-- Pocket with Vintage Compass -->
      <rect x="360" y="640" width="80" height="90" rx="10" fill="#fde68a" stroke="#d97706" stroke-width="4" />
      <circle cx="400" cy="685" r="24" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
      <polygon points="400,668 406,685 400,702 394,685" fill="#ef4444" />
    `
  },

  // 15. Penyihir Bintang Ajaib 3D (Unisex)
  {
    id: 'fantasy_wizard',
    name: 'Penyihir Bintang Ajaib 3D',
    category: 'fantasy',
    gender: 'unisex',
    roleTitle: 'Pakar Sihir Galaksi 3D',
    badgeText: '✨ Ahli Sihir 3D',
    themeColor: '#7c3aed',
    description: 'Topi penyihir tirus 3D dengan bulan sabit perak, jubah biru malam berbintang dan tongkat sakti bercahaya.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <!-- 3D Wizard Hat with Glowing Crescent Moon -->
      <g>
        <ellipse cx="300" cy="235" rx="150" ry="34" fill="#4c1d95" stroke="#7c3aed" stroke-width="5" />
        <path d="M 200 230 Q 265 85 330 55 Q 345 155 400 230 Z" fill="#312e81" stroke="#6366f1" stroke-width="5" />
        <path d="M 210 220 Q 300 240 390 220 L 385 240 Q 300 258 215 240 Z" fill="#facc15" />
        <!-- Glowing Crescent Moon -->
        <path d="M 330 110 A 18 18 0 1 0 350 132 A 14 14 0 1 1 330 110 Z" fill="#fef08a" stroke="#ffffff" stroke-width="1.5" />
        <polygon points="255,170 258,178 266,179 260,185 262,193 255,188 248,193 250,185 244,179 252,178" fill="#fde047" />
      </g>

      <!-- 3D Starry Midnight Wizard Robe -->
      <path d="M 140 420 Q 300 450 460 420 L 475 820 L 125 820 Z" fill="#1e1b4b" stroke="#312e81" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="130" ry="20" fill="#090520" opacity="0.8" />

      <!-- Wide Star-Embroidered Collar -->
      <path d="M 175 420 Q 300 480 425 420 L 435 480 Q 300 545 165 480 Z" fill="#4338ca" stroke="#818cf8" stroke-width="4" />

      <!-- Crystal Gemstone Amulet -->
      <polygon points="300,530 320,558 300,586 280,558" fill="#a855f7" stroke="#ffffff" stroke-width="3" />

      <!-- Glowing Magic Staff with Floating Crystal Orb -->
      <g transform="translate(125, 510)">
        <line x1="20" y1="20" x2="55" y2="300" stroke="#78350f" stroke-width="14" stroke-linecap="round" />
        <circle cx="20" cy="20" r="26" fill="#38bdf8" stroke="#ffffff" stroke-width="4" opacity="0.9" />
        <circle cx="20" cy="20" r="16" fill="#bae6fd" />
        <!-- Magic Spark Rays -->
        <line x1="20" y1="-18" x2="20" y2="-6" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
        <line x1="-18" y1="20" x2="-6" y2="20" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
        <line x1="46" y1="20" x2="58" y2="20" stroke="#facc15" stroke-width="4" stroke-linecap="round" />
      </g>
    `
  },

  // 16. Kesatria Pedang Perak 3D (Unisex)
  {
    id: 'fantasy_knight',
    name: 'Kesatria Pedang Perak 3D',
    category: 'fantasy',
    gender: 'unisex',
    roleTitle: 'Pendekar Perisai Besi 3D',
    badgeText: '🛡️ Kesatria 3D',
    themeColor: '#475569',
    description: 'Baju zirah besi perak 3D dengan corak singa diraja keemasan, pelindung bahu bertingkat dan pemegang pedang gah.',
    faceHole: { cx: 300, cy: 305, rx: 90, ry: 116 },
    svgForeground: `
      <!-- 3D Steel Coif / Helm Frame Around Face -->
      <path d="M 185 280 C 185 155 415 155 415 280 C 415 395 390 435 370 435 Q 300 455 230 435 C 210 435 185 395 185 280 Z" fill="none" stroke="#64748b" stroke-width="28" />
      <path d="M 200 220 Q 300 195 400 220 L 395 240 Q 300 215 205 240 Z" fill="#f59e0b" stroke="#78350f" stroke-width="3" />

      <!-- 3D Shining Steel Plate Breastplate -->
      <path d="M 135 420 Q 300 450 465 420 L 480 820 L 120 820 Z" fill="#94a3b8" stroke="#475569" stroke-width="5" />
      <ellipse cx="300" cy="425" rx="135" ry="22" fill="#1e293b" opacity="0.8" />

      <!-- Royal Blue Tabard with Gold Lion Rampant Crest -->
      <path d="M 215 440 L 385 440 L 375 820 L 225 820 Z" fill="#1d4ed8" stroke="#facc15" stroke-width="4" />
      <polygon points="300,500 326,532 300,574 274,532" fill="#facc15" stroke="#b45309" stroke-width="3" />
      <circle cx="300" cy="538" r="9" fill="#ef4444" />

      <!-- 3D Layered Steel Pauldrons (Shoulders) -->
      <ellipse cx="155" cy="450" rx="48" ry="38" fill="#cbd5e1" stroke="#475569" stroke-width="5" />
      <ellipse cx="445" cy="450" rx="48" ry="38" fill="#cbd5e1" stroke="#475569" stroke-width="5" />

      <!-- Knight Sword Hilt with Gold Pommel -->
      <g transform="translate(390, 550)">
        <polygon points="30,0 46,0 43,250 33,250" fill="#e2e8f0" stroke="#475569" stroke-width="3" />
        <rect x="14" y="40" width="48" height="14" rx="4" fill="#facc15" stroke="#b45309" stroke-width="2" />
        <rect x="33" y="10" width="10" height="30" fill="#78350f" />
        <circle cx="38" cy="5" r="10" fill="#facc15" stroke="#b45309" stroke-width="2" />
      </g>
    `
  }
];

export const BACKGROUND_OPTIONS: import('../types').BackgroundOption[] = [
  { id: 'bg_white', name: 'Putih Studio 3D', bgColor: '#ffffff', pattern: 'solid' },
  { id: 'bg_sky_blue', name: 'Biru Ceria 3D', bgColor: '#38bdf8', pattern: 'clouds', patternColor: '#ffffff' },
  { id: 'bg_stars_purple', name: 'Ungu Bintang 3D', bgColor: '#7c3aed', pattern: 'stars', patternColor: '#facc15' },
  { id: 'bg_pink_dots', name: 'Merah Jambu 3D', bgColor: '#f472b6', pattern: 'dots', patternColor: '#ffffff' },
  { id: 'bg_sun_yellow', name: 'Kuning Mentari 3D', bgColor: '#fbbf24', pattern: 'sunburst', patternColor: '#f59e0b' },
  { id: 'bg_emerald_stripes', name: 'Hijau Zamrud 3D', bgColor: '#10b981', pattern: 'stripes', patternColor: '#059669' },
  { id: 'bg_rainbow', name: 'Pelangi 3D Gemilang', bgColor: '#6366f1', pattern: 'sparkles', patternColor: '#fde047', gradient: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f59e0b 100%)' }
];

export const FRAME_OPTIONS: import('../types').FrameOption[] = [
  { id: 'none', name: 'Tiada Bingkai', color: '#94a3b8', previewClass: 'border-dashed border-2 border-slate-300' },
  { id: 'gold', name: 'Emas Mewah 3D', color: '#eab308', previewClass: 'border-4 border-yellow-400 shadow-amber-300' },
  { id: 'rainbow', name: 'Pelangi Ceria 3D', color: '#ec4899', previewClass: 'border-4 border-pink-500' },
  { id: 'polaroid', name: 'Polaroid Studio 3D', color: '#f8fafc', previewClass: 'border-8 border-white shadow-md' },
  { id: 'comic', name: 'Komik Ceria 3D', color: '#0284c7', previewClass: 'border-4 border-sky-500' },
  { id: 'stars', name: 'Bintang Gemilang 3D', color: '#8b5cf6', previewClass: 'border-4 border-purple-500' }
];

export const QUICK_SLOGANS = [
  'Saya Hebat! 🌟',
  'Bintang Kelas ⭐',
  'Jom Belajar! 📚',
  'Cita-Cita Saya 🚀',
  'Juara Masa Depan 🏆',
  'Rajin & Berjaya 💡',
  'Harapan Bangsa 🇲🇾',
  'Celik & Pintar ✨'
];
