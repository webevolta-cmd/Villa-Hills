# Villa Hills — Website Script
## "One Evening at Villa Hills"

---

## THE BIG IDEA

The whole website plays out as **one evening at the Open Hall**.

When the site opens it is late afternoon in Ptghni. As the visitor scrolls, the sun goes down over the garden, the string lights turn on, dinner is served, the band starts, and at the bottom of the page fireworks go off at midnight. A small clock in the corner of the screen moves from **17:00 to 00:00** as you scroll.

Each section is one moment of a real celebration: arrival, ceremony, dinner, first dance, the show, the finale. Visitors don't just read about Villa Hills. They spend an evening there before they book.

Why this works:
- The Open Hall's selling points are light and atmosphere: the garden, the sunset, the night. A scroll-driven day-to-night story shows that better than any text.
- Every animation on the site follows the clock, so the effects feel like one connected piece instead of random tricks.
- It's easy to remember: "the site where the sun sets as you scroll."

---

## GROUND RULES

- **Real photos only.** Every photo is a real Villa Hills photo, shown as it is. We never paint in skies, lights, snow, fireworks or steam, and we never recolour a photo to fake a time of day or a season. If a moment has no real photo yet, it gets filmed or photographed. Until then, it waits as a clearly marked placeholder.
- **The logo is used whole.** The brand always appears as the complete original logo. We never pull out parts of it (such as the hill lines). Wherever "Villa Hills" appears as text, it must be set in the logo's own typeface. *That font file is still needed from the logo designer;* until it arrives, we show the logo image instead of typing the name.

## BRAND LOOK & FEEL

- **Tagline:** "Natural & Luxurious" / «Բնական և շքեղ»
- **Line:** "A perfect combination of nature and luxury"
- **Palette (it shifts with the clock):**
  - Ptghni Stone `#EDE6DA`: warm ivory (day)
  - Garden Green `#1E2B22`: deep green (day and garden)
  - Sunset Apricot `#E3A07A` (golden hour)
  - Champagne Gold `#C8A76B`: accents, lines, cursor
  - Night Ink `#0C1014` (night)
- **Typography:** an elegant high-contrast serif for headlines plus a clean sans for body text. Both need full Armenian glyph support: Noto Serif Armenian and Noto Sans Armenian as the base, or a licensed Armenian display face for headlines.
- **Texture:** subtle film grain and a soft vignette, so it looks cinematic. Only real footage of Villa Hills, no stock photos.
- **Languages:** Հայերեն / English / Русский. Switching language doesn't reload the page; the text re-types itself letter by letter in the new language.

---

## SCENE 00 — PRELOADER: "The Sun Rises"

- Black screen. The full Villa Hills logo fades in, softly lit, while a counter runs from 0 to 100.
- At 100 the dark panels slide apart like a curtain, and the hero video appears through the gap.
- Returning visitors get a 1-second version.

---

## SCENE 01 — HERO: "Natural. Luxurious."

- **Visual:** full-screen drone video gliding over the garden and into the Open Hall at golden hour.
- **Headline:** the letters rise one by one from behind a mask, and the Armenian line fades in underneath.
- **Depth parallax:** the hero frame is turned into 2.5D with a depth map in WebGL. Moving the mouse, or tilting the phone, shifts the trees, hall and sky at different depths, like looking through a window.
- **Cursor:** a tiny gold firefly with a soft light trail. Near a button it grows, and the button is pulled toward it magnetically.
- **CTAs:** "Explore the Open Hall" and "Reserve your date".
- **Clock HUD** appears in the corner: `17:00 · Ptghni`, with live local weather.
- **Sound toggle:** "Turn on the evening" plays ambient garden sound with soft live strings. Sound is off by default.

---

## SCENE 02 — THE OPEN HALL ★ (the heart of the site)

This is the longest and most important section: a pinned scroll scene about 4–5 screens tall.

### Part A — "Day to Night" scroll sequence
- One fixed camera angle on the Open Hall. As you scroll, the frame moves from **day → golden hour → blue hour → night**: **real timelapse footage** (to be filmed) scrubbed by scroll, the way Apple product pages work.
- Until that timelapse is filmed, the section crossfades between real Open Hall photos taken at different times of day (afternoon, sunset, night).
- The clock HUD runs 17:00 → 21:00.
- Text cards slide in beside the image:
  - **Up to 350 guests** (the number counts up from 0)
  - **An amazing garden**
  - **Live music from the best musicians**
  - **A ceremony under the open sky**

### Part B — "Walk through the hall" (3D)
- One button dissolves the screen into a **photoreal 3D scan of the Open Hall** (Gaussian splatting, captured with a drone and camera, running in the browser).
- Drag to look around; scroll to walk forward.
- Gold hotspots: Ceremony spot · Dance floor · Stage · Garden paths · Fireworks area · Photo spots. Each opens a small card with a photo or video.
- Older phones get a 360° panorama tour instead.

### Part C — "Design your evening": interactive floor plan
- A top-down illustrated plan of the Open Hall.
- **Guest slider (20 → 350):** tables drop onto the plan with a soft spring as the number grows, and chairs pop in around them.
- **Layout:** Round tables / Imperial long tables / Cocktail. The tables glide to their new positions.
- **Toggles:** Dance floor · Stage · Ceremony arch · Buffet.
- **"Send this layout to us"** carries the choices straight into the booking form.

### Part D — Moods
- Three buttons: **Garden Ceremony** (day) · **Sunset Dinner** · **Night Party**.
- The whole section re-lights with a color-grade transition and plays a 5-second loop for that mood.

---

## SCENE 03 — THE GLAZED HALL: "Summer, kept under glass"

Built on your own line: *the feeling of summer stays here in every season.*

- **Panorama:** the section scrolls sideways through real photos of the Glazed Hall: evening, side view, daytime.
- **Seasons slider (needs real photos):** once the hall has been photographed from one fixed spot in each season, a slider moves between those real photos to show summer kept inside while the seasons change outside.
- **Up to 120 guests**, intimate and year-round.

---

## SCENE 04 — THE CLOSED HALL: "Coming soon"

- A dark wall with one tall door. Light leaks through the gaps and pulses slowly.
- The cursor becomes a flashlight. Until real photos of the new hall exist, it reveals only the words "Opening soon"; later it can reveal real progress photos.
- **"Be the first to see it"** joins a WhatsApp or email waitlist.

---

## SCENE 05 — CELEBRATIONS: "Your dream celebration at Villa Hills"

The four occasions from your current site: **Weddings · Engagements · Birthdays · Holy Baptism.**

- Four tall cards fanned out like invitation cards. On hover a card lifts and tilts in 3D toward the cursor, and its gold-foil edge catches the light.
- Each card shows a real photo from that type of celebration at Villa Hills. *Real engagement, birthday and baptism photos are still needed;* until then those cards show the logo as a placeholder.
- **Click:** the card expands to fill the screen and becomes that occasion's page, with real event photos, what's included and the recommended hall.

---

## SCENE 06 — THE KITCHEN: "A rich menu"

- A dark, moody macro food film with dishes in slow motion.
- Real dish photos, whole and unedited, come to the table as you scroll.
- **Hover a dish:** its real name and description fade in. *(Needs your real menu.)*
- **360° plate:** drag a dish to rotate it. *(Needs a real 360° turntable shoot of each dish.)*

---

## SCENE 07 — THE SHOW: services

The seven services from your current site, shown as a stage under spotlights. Hovering a service swings the spotlight to it.

| Service | Its effect |
|---|---|
| Hosts | Spotlight snaps on, with a microphone silhouette and a short host quote |
| Band, DJ & singers | Audio-reactive gold equalizer; hovering plays 3 seconds of your live band |
| Cake fireworks | Sparklers fizz around an illustrated cake |
| Decoration & buffet | Flowers and tableware grow into place |
| Show programs | A velvet curtain opens |
| Aerial fireworks | Rockets launch and burst across the whole screen |
| Photo & video | A camera flash whites out the screen and freezes a "polaroid" that drops onto the page |

- **"Build your evening":** clicking a service adds it to your booking. It flies into a small floating "My evening" icon.

---

## SCENE 08 — GALLERY: "Real moments"

- **Infinite drag canvas:** hundreds of photos and clips floating in a grid that extends in every direction. Drag it or throw it; images bend slightly with speed (WebGL distortion) and settle with inertia.
- **Filters:** Open Hall · Glazed Hall · Weddings · Engagements · Birthdays · Baptism · Night · Fireworks. Picking a filter makes the images fly apart and regroup.
- **Click a photo** and it expands smoothly to full screen.
- A strip of live Reels from **@villahills_restaurant**.

---

## SCENE 09 — MIDNIGHT: the finale

- The clock reaches **00:00** on a real photo or video of Villa Hills' aerial fireworks.
- **Tap anywhere to launch your own firework.** This is a light effect drawn on the screen, never painted into a photo. On Android phones each burst gives a light vibration.
- Line: *"Every story deserves a finale."*
- CTA: **Reserve your date**

---

## SCENE 10 — LOCATION: "5 km from Yerevan. A world away."

- **Real map:** a gold line draws the real road route on an OpenStreetMap/Mapbox map, from Republic Square to Ptghni (about 16 km, ~22 min), and lands on Villa Hills' exact pin. *(Exact pin still needed.)*
- Buttons: Google Maps · Yandex Go · Waze.
- *Optional story:* Ptghni's heritage. The early-medieval Ptghnavank basilica in the village makes a beautiful photo backdrop for couples.

---

## SCENE 11 — RESERVE YOUR DATE: the booking concierge

Not a plain form: five steps, one question per screen, with a live summary card that builds up on the side.

1. **What are we celebrating?** (the four occasion cards)
2. **How many guests?** A slider. Above 120 guests it recommends the Open Hall automatically.
3. **Which date?** A calendar with the **Golden Hour feature:** pick any date and it shows the real sunset time in Ptghni for that day, e.g. *"On your date the sun sets at 20:41, so plan the ceremony for about 19:45."* Sunset times are calculated by an astronomy library, not guessed.
4. **Hall and add-ons:** the hall plus services from Scene 07, and the floor plan from Scene 02 if one was made.
5. **Your contacts:** sent by WhatsApp, Viber, Telegram, phone call or email.

- **On submit:** a seal carrying the full logo stamps onto an envelope, and the envelope flies away. *"Thank you. Our team will contact you."*

---

## SCENE 12 — FOOTER

- The full Villa Hills logo, large and centred.
- **+374 33 34 34 32 · +374 41 34 34 32 · villahillscomplex@gmail.com · Ptghni, 5 km from Yerevan**
- Instagram · Facebook · YouTube
- **"Watch the sunrise":** the back-to-top button scrolls up while the sky goes from night to dawn.

---

## GLOBAL ANIMATION SYSTEM (everywhere)

- Smooth inertial scroll (Lenis) with GSAP ScrollTrigger choreography
- Text reveals line by line from masks; headings get a slow gold-foil shimmer
- Images open with a curtain clip-path; on hover a liquid ripple shader runs over them
- **Page transitions:** a hills-silhouette curtain sweeps up between pages, with no white flash and no feeling of a page reload
- Cursor states: firefly / "Drag" / "Play" / "Open"
- Magnetic buttons and underlines that draw themselves on hover
- The clock HUD and the color palette follow the time of the evening across the whole site
- **Motion rule:** slow and confident. Premium means fewer, better animations with perfect timing (ease-out, 0.8–1.2 s) and nothing bouncing for no reason.

---

## MOBILE FIRST (most clients will arrive from Instagram on a phone)

- Designed for phones first, not a shrunk desktop
- Tilting the phone looks around the Open Hall (gyroscope parallax)
- Occasions and gallery swipe like Instagram stories
- Sticky bottom bar: **Call · WhatsApp · Reserve**
- Light haptic taps on fireworks and booking steps (Android)

---

## PERFORMANCE, ACCESSIBILITY, SEO

- Every effect has a calm fallback for "reduce motion" users and slow phones
- Target: under 2.5 s to first view on 4G; adaptive video streaming; AVIF/WebP images
- Three languages with proper hreflang tags
- schema.org **EventVenue** markup, so Google can show the halls, capacities and phone numbers
- Lighthouse 90+ target

---

## TECH STACK (recommended)

- **Next.js + TypeScript**, hosted on **Vercel**
- **GSAP** (ScrollTrigger, SplitText) + **Lenis** smooth scroll
- **Three.js / React Three Fiber** for depth parallax, shaders, particles and fireworks
- **Gaussian-splat viewer** for the 3D hall walk-through
- **Mapbox GL** for the 3D route map
- **SunCalc** for sunset times
- **Headless CMS (Sanity)** so your team can update photos, menu and texts in all three languages without a developer

---

## WHAT WE NEED TO SHOOT AND COLLECT (this makes or breaks the site)

1. **Locked-off timelapse** of the Open Hall from one angle, 16:00 → midnight, during a real event or a staged setup. This powers the signature scroll scene.
2. **Drone flythrough** at golden hour (hero video)
3. **3D capture** of the Open Hall (drone plus photos for the Gaussian splat) and 360° photos
4. **Glazed Hall** photographed from one fixed spot in every season (winter, spring, summer, autumn)
5. **Macro food footage** of 5–8 signature dishes, plus the real menu
6. **30–60 seconds of audio** of your live band
7. **Real event photos and videos** (with clients' permission) and real reviews
8. **Closed Hall** renders or progress photos, and the planned opening date
9. Exact map pin, working hours, and any packages or prices you want to show
10. **The logo's font file** (from the logo designer), so every "Villa Hills" text matches the logo exactly

---

## THE 5 SIGNATURE MOMENTS (what people will remember and share)

1. **Scrolling turns day into night over the Open Hall**
2. **Walking through a photoreal 3D Open Hall in the browser**
3. **The seasons changing outside the Glazed Hall's glass** (from real seasonal photos)
4. **A floor plan that fills with tables as you choose your guest count**
5. **The Golden Hour date picker, and midnight fireworks you launch yourself**

---

## SITEMAP

Home (the evening story) · Open Hall · Glazed Hall · Closed Hall (soon) · Celebrations (Wedding / Engagement / Birthday / Baptism) · Kitchen · The Show (services) · Gallery · About · Reserve
