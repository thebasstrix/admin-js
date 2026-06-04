<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700;900&display=swap" rel="stylesheet">

<style>
  #portfolio-root *, #portfolio-root *::before, #portfolio-root *::after {
    box-sizing: border-box; margin: 0; padding: 0;
  }

  :root {
    --gold: #c9a84c;
    --gold-light: #e8cd82;
    --cream: #f5f0e8;
    --dark: #0a0a0a;
  }

  #portfolio-root {
    position: fixed; inset: 0;
    width: 100%; height: 100%;
    overflow: hidden;
    background: var(--dark);
    z-index: 9000;
  }

  #pf-bg-img {
    position: absolute; inset: 0;
    width: 100%; height: 100%;
    object-fit: cover;
    object-position: center 33%;
    filter: brightness(0.55) saturate(0.8);
    z-index: 0;
  }

  #pf-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(
      to bottom,
      rgba(0,0,0,0.35) 0%,
      rgba(0,0,0,0.15) 30%,
      rgba(0,0,0,0.15) 60%,
      rgba(0,0,0,0.8) 100%
    );
    z-index: 1;
  }

  #pf-grain {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    opacity: 0.045;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 160px;
  }

  #pf-vignette {
    position: absolute; inset: 0; z-index: 2; pointer-events: none;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%);
  }

  #pf-hub {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 6;
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }

  #pf-logo {
    width: clamp(150px, 25vw, 280px);
    height: auto;
    display: block;
    mix-blend-mode: screen;
    transition: opacity 0.3s ease, transform 0.3s ease;
    position: relative;
    z-index: 1;
  }

  #pf-hub:hover #pf-logo {
    transform: scale(1.03);
  }

  .pf-rule {
    width: 80px; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold), transparent);
    margin: 0.5rem auto;
    transition: opacity 0.4s ease;
    position: relative; z-index: 1;
  }

  .pf-subtitle {
    font-family: "Poppins", sans-serif;
    font-size: clamp(0.75rem, 1.4vw, 1rem);
    font-weight: 700;
    letter-spacing: 0.35em;
    color: #ffffff;
    text-transform: uppercase;
    transition: opacity 0.35s ease;
    position: relative; z-index: 1;
  }

  #portfolio-root.nav-active .pf-rule,
  #portfolio-root.nav-active .pf-subtitle {
    opacity: 0;
    pointer-events: none;
  }

  #pf-close-hint {
    position: absolute;
    bottom: 2.5rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: "Poppins", sans-serif;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(255,255,255,0);
    pointer-events: none;
    transition: color 0.5s ease;
    z-index: 7;
    white-space: nowrap;
  }

  #portfolio-root.nav-active #pf-close-hint {
    color: rgba(255,255,255,0.4);
    pointer-events: all;
    cursor: pointer;
  }

  #portfolio-root.nav-active #pf-close-hint:hover {
    color: rgba(201,168,76,0.9);
  }

  #pf-wheel {
    position: absolute; inset: 0;
    z-index: 6;
    pointer-events: none;
  }

  .pf-nav-item {
    position: absolute;
    transform: translate(-50%, -50%);
    pointer-events: none;
  }

  .pf-nav-item a {
    display: block;
    font-family: "Poppins", sans-serif;
    font-size: clamp(0.7rem, 1.2vw, 0.88rem);
    font-weight: 700;
    letter-spacing: 0.25em;
    color: rgba(245,240,232,0.0);
    text-decoration: none;
    text-transform: uppercase;
    white-space: nowrap;
    padding: 0.9rem 1.8rem;
    border: 1px solid transparent;
    background: transparent;
    transition: color 0.6s cubic-bezier(.22,1,.36,1),
                letter-spacing 0.3s ease,
                transform 0.5s cubic-bezier(.22,1,.36,1);
    cursor: pointer;
    transform: scale(0.6);
  }

  #portfolio-root.nav-active .pf-nav-item {
    pointer-events: all;
  }

  #portfolio-root.nav-active .pf-nav-item a {
    color: rgba(255,255,255,0.9);
    border-color: transparent;
    background: transparent;
    transform: scale(1);
  }

  #portfolio-root.nav-active .pf-nav-item a:hover {
    color: #ffffff;
    transform: scale(1.08);
    letter-spacing: 0.32em;
    font-weight: 900;
  }

  .pf-nav-item:nth-child(1) a { transition-delay: 0.00s; }
  .pf-nav-item:nth-child(2) a { transition-delay: 0.06s; }
  .pf-nav-item:nth-child(3) a { transition-delay: 0.12s; }
  .pf-nav-item:nth-child(4) a { transition-delay: 0.18s; }
  .pf-nav-item:nth-child(5) a { transition-delay: 0.24s; }

  .pf-panel {
    position: absolute; inset: 0;
    z-index: 20;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none;
    transition: opacity 0.5s ease;
    background: rgba(8,6,4,0.88);
    backdrop-filter: blur(12px);
  }

  .pf-panel.open { opacity: 1; pointer-events: all; }

  .pf-panel-inner {
    max-width: 680px;
    padding: 3rem;
    border: none;
    background: transparent;
    position: relative;
  }

  .pf-panel-inner h2 {
    font-family: "Poppins", sans-serif;
    font-size: 1.4rem;
    letter-spacing: 0.3em;
    color: #ffffff;
    margin-bottom: 1.5rem;
    text-transform: uppercase;
  }

  .pf-panel-inner p, .pf-panel-inner li {
    font-family: "Poppins", sans-serif;
    font-size: 1.15rem;
    line-height: 1.8;
    color: rgba(255,255,255,0.9);
  }

  .pf-panel-inner ul { list-style: none; padding: 0; }
  .pf-panel-inner li { padding: 0.4rem 0; border-bottom: 1px solid rgba(201,168,76,0.1); }
  .pf-panel-inner li:last-child { border-bottom: none; }

  .pf-panel-close {
    position: fixed;
    top: 1.5rem; right: 1.75rem;
    font-family: "Poppins", sans-serif;
    font-size: 1.5rem;
    color: rgba(255,255,255,0.5);
    cursor: pointer;
    line-height: 1;
    transition: color 0.3s;
    z-index: 30;
  }
  .pf-panel-close:hover { color: #ffffff; }

  .pf-panel-inner::-webkit-scrollbar { width: 4px; }
  .pf-panel-inner::-webkit-scrollbar-track { background: transparent; }
  .pf-panel-inner::-webkit-scrollbar-thumb {
    background: rgba(201,168,76,0.3);
    border-radius: 2px;
  }
</style>

<div id="portfolio-root">
  <video id="pf-bg-img" autoplay muted loop playsinline>
    <source src="https://od.lk/d/NzFfMzE0MzA2NzBf/siteloopsmaller2.mov" type="video/mp4">
  </video>
  <div id="pf-overlay"></div>
  <div id="pf-grain"></div>
  <div id="pf-vignette"></div>

  <div id="pf-hub">
    <img id="pf-logo" src="https://i.ibb.co/1tkPk2vt/tsa-logo-3000x3000.png" alt="Twelve Step Audio">
    <div class="pf-rule"></div>
    <p class="pf-subtitle">DJ &nbsp;·&nbsp; MC &nbsp;·&nbsp; Producer</p>
  </div>

  <span id="pf-close-hint">close</span>

  <div id="pf-wheel">
    <div class="pf-nav-item" id="pf-ni-about">
      <a href="#" data-pfpanel="pf-panel-about">About</a>
    </div>
    <div class="pf-nav-item" id="pf-ni-music">
      <a href="#" data-pfpanel="pf-panel-music">Music</a>
    </div>
    <div class="pf-nav-item" id="pf-ni-dates">
      <a href="#" data-pfpanel="pf-panel-dates">Upcoming Dates</a>
    </div>
    <div class="pf-nav-item" id="pf-ni-epk">
      <a href="#" data-pfpanel="pf-panel-epk">EPK</a>
    </div>
    <div class="pf-nav-item" id="pf-ni-bookings">
      <a href="#" data-pfpanel="pf-panel-bookings">Bookings</a>
    </div>
  </div>

  <div class="pf-panel" id="pf-panel-about">
    <div class="pf-panel-inner" style="max-width:780px; max-height:80vh; overflow-y:auto;">
      <span class="pf-panel-close" data-pfclose="pf-panel-about">×</span>
      <h2>About</h2>
      <p>Twelve Step Audio's journey into the world of dance music began almost 18 years ago. Starting out as a hard house DJ and inspired by the explosion of rave, jungle and dance music throughout the '90s, he first took to the decks at just 15. Cutting his teeth on a pair of belt-drive Homemix-branded turntables from the Argos catalogue, Twelve Step began to build his record collection and immerse himself in the world of dance music, playing a range of styles and landing his first club gig at the age of 17.</p>
      <br>
      <p>As drum and bass really started to take hold in the early 2000s, he also began to experiment with production, crafting his first tracks and carving out a signature sound for himself. Fast forward to the present day, and Twelve Step has cemented himself as an accomplished producer, with releases and forthcoming tracks on labels such as Influenza Media, Interstellar Audio, M-Ocean Records and more. His music has attracted support from DJs such as Dom Whiting (Drum & Bass On The Bike) and has received rotation on BBC Radio 1, Kool FM, Bassdrive and DNBRadio.</p>
      <br>
      <p>He has played shows across the UK as well as internationally, performing alongside some of the biggest names in the drum and bass scene, including Keeno, Etherwood, Degs, Riya, Document One, Critical Impact and more. 2025 also marks the start of a new chapter for Twelve Step, as he launches his record label, Outer Edge Audio. With a focus on (but not limited to!) deep, liquid and rolling drum and bass — and with the first release receiving huge praise — there's plenty more to come in 2025 and beyond for Twelve Step Audio!</p>
    </div>
  </div>

  <div class="pf-panel" id="pf-panel-music">
    <div class="pf-panel-inner">
      <span class="pf-panel-close" data-pfclose="pf-panel-music">×</span>
      <h2>Music</h2>
      <p>Listen on Spotify</p>
      <br>
      <a href="https://open.spotify.com/artist/2AWuwe73jSIIKRr5N6EtoK?si=CgB2demcTCSA25gtrMKoJA"
         target="_blank"
         style="font-family:'Poppins',sans-serif; font-size:0.8rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:var(--gold); text-decoration:none; border-bottom:1px solid rgba(201,168,76,0.3); padding-bottom:2px;">
        Open Spotify →
      </a>
    </div>
  </div>

  <div class="pf-panel" id="pf-panel-dates">
    <div class="pf-panel-inner">
      <span class="pf-panel-close" data-pfclose="pf-panel-dates">×</span>
      <h2>Upcoming Dates</h2>
      <ul>
        <li style="display:flex; justify-content:space-between; align-items:center; gap:2rem;">
          <span>20.06.26 &nbsp;·&nbsp; Arthouse, Hull &nbsp;·&nbsp; MC Set</span>
        </li>
        <li style="display:flex; justify-content:space-between; align-items:center; gap:2rem;">
          <span>10.07.26 &nbsp;·&nbsp; The Basstrix: Summer Sessions @ Polar Bear, Hull</span>
          <a href="https://www.skiddle.com/e/42417523" target="_blank" style="font-family:'Poppins',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:var(--gold); text-decoration:none; white-space:nowrap; border-bottom:1px solid rgba(201,168,76,0.3); padding-bottom:2px;">Tickets →</a>
        </li>
        <li style="display:flex; justify-content:space-between; align-items:center; gap:2rem;">
          <span>18.07.26 &nbsp;·&nbsp; The Bag Factory, Manchester &nbsp;·&nbsp; MC Set</span>
        </li>
        <li style="display:flex; justify-content:space-between; align-items:center; gap:2rem;">
          <span>30.08.26 &nbsp;·&nbsp; TBA</span>
        </li>
        <li style="display:flex; justify-content:space-between; align-items:center; gap:2rem;">
          <span>12.09.26 &nbsp;·&nbsp; TBA</span>
        </li>
      </ul>
    </div>
  </div>

  <div class="pf-panel" id="pf-panel-epk">
    <div class="pf-panel-inner">
      <span class="pf-panel-close" data-pfclose="pf-panel-epk">×</span>
      <h2>Electronic Press Kit</h2>
      <p>Bio, high-res photos, technical rider, press quotes, and media assets for promoters and press.</p>
    </div>
  </div>

  <div class="pf-panel" id="pf-panel-bookings">
    <div class="pf-panel-inner" style="max-width:580px; width:90vw; max-height:80vh; overflow-y:auto;">
      <span class="pf-panel-close" data-pfclose="pf-panel-bookings">×</span>
      <h2>Bookings</h2>

      <form id="booking-form" action="https://formspree.io/f/xnjyqzwe" method="POST" style="display:flex; flex-direction:column; gap:1.5rem;">

        <p style="font-family:'Poppins',sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); padding-bottom:0.5rem; border-bottom:1px solid rgba(201,168,76,0.2);">01 &nbsp;·&nbsp; Booking Details</p>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Event</label>
          <input type="text" name="event" placeholder="Event name" required
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Date</label>
          <input type="date" name="date" required
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%; color-scheme:dark;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Venue</label>
          <input type="text" name="venue" placeholder="Venue name"
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">City / Country</label>
          <input type="text" name="city" placeholder="e.g. Hull, UK"
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Performance Type</label>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <div style="position:relative; flex:1; min-width:80px;">
              <input type="radio" id="perf-dj" name="performance_type" value="DJ" style="position:absolute; opacity:0; width:0; height:0;">
              <label for="perf-dj" style="display:flex; align-items:center; justify-content:center; font-family:'Poppins',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; cursor:pointer; transition:all 0.25s;">DJ</label>
            </div>
            <div style="position:relative; flex:1; min-width:80px;">
              <input type="radio" id="perf-mc" name="performance_type" value="MC" style="position:absolute; opacity:0; width:0; height:0;">
              <label for="perf-mc" style="display:flex; align-items:center; justify-content:center; font-family:'Poppins',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; cursor:pointer; transition:all 0.25s;">MC</label>
            </div>
            <div style="position:relative; flex:1; min-width:80px;">
              <input type="radio" id="perf-djmc" name="performance_type" value="DJ & MC" style="position:absolute; opacity:0; width:0; height:0;">
              <label for="perf-djmc" style="display:flex; align-items:center; justify-content:center; font-family:'Poppins',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.5); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; cursor:pointer; transition:all 0.25s;">DJ &amp; MC</label>
            </div>
          </div>
        </div>

        <p style="font-family:'Poppins',sans-serif; font-size:0.6rem; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:var(--gold); padding-bottom:0.5rem; border-bottom:1px solid rgba(201,168,76,0.2); margin-top:0.5rem;">02 &nbsp;·&nbsp; Contact Details</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">First Name</label>
            <input type="text" name="first_name" placeholder="First name" required
              style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
              onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
          </div>
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Last Name</label>
            <input type="text" name="last_name" placeholder="Last name" required
              style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
              onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Email</label>
          <input type="email" name="email" placeholder="your@email.com" required
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <div style="display:flex; flex-direction:column; gap:0.4rem;">
          <label style="font-family:'Poppins',sans-serif; font-size:0.62rem; font-weight:700; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.45);">Phone</label>
          <input type="tel" name="phone" placeholder="+44 7700 000000"
            style="font-family:'Poppins',sans-serif; font-size:0.85rem; color:#fff; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:0.75rem 1rem; outline:none; width:100%;"
            onfocus="this.style.borderColor='rgba(201,168,76,0.6)'" onblur="this.style.borderColor='rgba(255,255,255,0.12)'">
        </div>

        <button type="submit"
          style="font-family:'Poppins',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:0.25em; text-transform:uppercase; color:#fff; background:transparent; border:1px solid rgba(201,168,76,0.4); padding:0.9rem 2.5rem; cursor:pointer; transition:border-color 0.3s, color 0.3s; align-self:flex-start;"
          onmouseover="this.style.borderColor='rgba(201,168,76,1)';this.style.color='var(--gold)'"
          onmouseout="this.style.borderColor='rgba(201,168,76,0.4)';this.style.color='#fff'">
          Send Enquiry →
        </button>

        <p id="pf-form-status" style="font-family:'Poppins',sans-serif; font-size:0.75rem; color:rgba(201,168,76,0.8); display:none;"></p>

      </form>
    </div>
  </div>

</div>

<script src="https://cdn.jsdelivr.net/gh/thebasstrix/admin-js@main/tsa-script4.js" defer></script>
