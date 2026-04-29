# Changelog v2.5.0-compact-cards

## Goal: High-value Patterns ดู scan ง่าย ไม่ยาวเกินไป

ของเดิม: 56 cards ใหญ่ stack vertical (Structure + Sound + Tip ทั้งหมด) → ต้องเลื่อนยาวมาก
ตอนนี้: **Compact list** แบบ Anki — 1 บรรทัดต่อ word, เห็น 7-8 cards/หน้าจอ

---

## 🎨 Design ใหม่

### ก่อน (v2.4):
```
┌────────────────────────────────────────┐
│ participate         🔊        [LEARN]  │
│ BEE 4 · STRUCTURE                      │
│ Structure: part + ici + pate           │  ← ใหญ่
│ Sound: par-tic-i-pate                  │
│                                        │
│ Tip: Watch the middle chunk: -ticip-.  │
└────────────────────────────────────────┘
   เห็นได้ ~2 cards ต่อหน้าจอ
```

### หลัง (v2.5):
```
┌────────────────────────────────────────────────────────┐
│ 🔊  participate    📐 BEE 4              [LEARN]     │
│     part + ici + pate                                 │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│ 🔊  sophisticated  📐 BEE 4              [LEARN]     │
│     sophisticate → sophisticated                      │
└────────────────────────────────────────────────────────┘
   เห็นได้ ~7-8 cards ต่อหน้าจอ ✨
```

---

## 🌈 Category Icons + Colors

แต่ละหมวดมี emoji + สีต่างกัน เพื่อ scan ได้ไว:

| Code | Icon | สี | ความหมาย |
|------|------|-----|---------|
| S | 📐 | 🔵 น้ำเงิน | Structure |
| P | 🎵 | 🟣 ม่วง | Sound (Pronunciation) |
| E | 🎯 | 🔴 แดง | Error Pattern |
| L | 💡 | 🟢 เขียว | Logic |

ใช้กับทั้ง:
- Card badge (ขวาของชื่อคำ)
- Filter pills (ข้างบน)

---

## 🎛 Filter pills ปรับใหม่

### ก่อน:
```
[All] [Structure] [Sound] [Error] [Logic]
```
เหมือนกันหมด แยกไม่ออก

### หลัง:
```
[All 56] [📐 Structure 24] [🎵 Sound 12] [🎯 Error 10] [💡 Logic 10]
```
- มี **emoji icon** + **count แต่ละหมวด**
- **Active state** — pill ที่เลือกอยู่จะเป็นสีน้ำเงินเข้ม
- **Hover state** — เปลี่ยนสีตาม category color (น้ำเงิน, ม่วง, แดง, เขียว)
- **Live count** — แถบ "56 words" ขวาบนเปลี่ยนตาม filter (e.g. "12 words" เมื่อกดดู Sound)

---

## 🖼 Layout breakdown

```
[🔊 listen]  [word + badge]              [LEARN button]
[ 40x40  ]   [Structure preview      ]   [   amber     ]
   left      flex-1 (truncate)            right
```

**Smart truncation:** ถ้า structure ยาวเกินจอ → `truncate` + `...` (เช่น "investigate → investigation" จะเป็น "investigate → invest..." บนจอแคบ)

---

## 🔧 Code changes

**`js/app.js`:**

1. เพิ่ม 2 constants ใหม่:
```js
const CAT_ICON = {S:'📐', P:'🎵', E:'🎯', L:'💡'};
const CAT_COLOR = {
  S: 'bg-blue-50 text-blue-700 border-blue-200',
  P: 'bg-purple-50 text-purple-700 border-purple-200',
  E: 'bg-red-50 text-red-700 border-red-200',
  L: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};
```

2. **`renderLearnCard()`** เขียนใหม่ — flex 3-column layout (listen / word / LEARN)
3. **`filterLearnCards()`** เพิ่ม:
   - update count text แบบ live
   - update active pill visual state

4. **Filter pills** เพิ่ม `data-filter` attribute + count + emoji
5. **Header** "High-value Patterns" → มี count "56 words" ขวาบน

---

## 📊 Comparison

| Metric | v2.4 (เก่า) | v2.5 (ใหม่) |
|--------|-------------|-------------|
| Cards per screen (iPad portrait) | ~2-3 | ~7-8 |
| Cards per screen (desktop) | ~3-4 | ~10-12 |
| Card height | ~180px | ~64px (3.5× เล็กลง) |
| Visual hierarchy | flat | strong (icon + color + size) |
| Filter feedback | ไม่มี | active state + count |

---

## ✅ ทดสอบ

- [ ] เข้า Learn Mode → cards ดู compact ขึ้นชัดเจน
- [ ] เห็น 6+ cards ในจอ iPad portrait โดยไม่เลื่อน
- [ ] กด **🔊** → ฟังคำได้ (ไม่ขัดกับ click LEARN)
- [ ] กด **LEARN** → เปิด mini lesson เต็มรูป
- [ ] กด filter "📐 Structure" → list filter ถูก, count เปลี่ยน, pill highlight
- [ ] กด All → กลับมาทั้งหมด
- [ ] บนจอแคบ → structure preview truncate ไม่ break layout

---

## 🚫 ที่ไม่แตะ

- LEARN_CARDS data (56 คำ) — ไม่เปลี่ยน
- mini lesson (openLearnCard) — เนื้อหาเต็มอยู่ที่นั่น
- Drill modes (Pattern/Error/Brainstorm/Mixed/Speed)
- Mistake Bank
- ปุ่ม Back/Exit pill design (จาก v2.4)

---

## 🔄 Version history

- **v2.5.0-compact-cards** — Compact list with icons & colors (this update)
- **v2.4.0-friendly-buttons** — Pill buttons with text labels
- **v2.3.0-fit-to-screen** — Fit-to-screen layout
- **v2.2.0-ipad-responsive** — iPad responsive fixes
- **v2.1.0-learn-mode** — Learn Mode + S.P.E.L.L. system
