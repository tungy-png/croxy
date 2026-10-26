# RALLY//ROGUE

A neon arcade Pong roguelite. Survive an endless ladder of opponents, draft an
upgrade after each round, and face a boss every fifth level.

The Neon Circuit has shut down Rogue's home district and locked its power
behind a ladder of champion-run arenas. Win each match, rally the city, and
take the shutdown key back from the Circuit's owner. Rivals trade taunts before
every match, with a victory exchange after each cleared level.

## Play

Serve the static game from the `public` directory:

```sh
python3 -m http.server 8000 -d public
```

Then open <http://localhost:8000> and pick a starter upgrade to begin your run.
You start each run with three hull; every unblocked miss costs one hull.
When all three are lost, a **YOU LOSE** screen returns you to level 01; unlocked
levels remain available from level select.
Move with **W/S**, **↑/↓**, or your pointer over the arena. Press **Space** or
the pause button to pause. Paddle and wall impacts trigger particle bursts,
screen shake, and synthesized arcade effects. The ball stretches with its speed.
With **Quick Hands**, double-tap **W/S** or **↑/↓** in the same direction to
flash-step a short distance with an afterimage (brief cooldown).
Build five returns to charge **Rift Break**; press **E** to arm a powered shot
that targets the rival and adds two damage to your next score. Charge carries
between points, so save the blast for a phase change or boss.
Rallies now trigger rotating, telegraphed arena events: gravity wells bend the
ball, crosswinds shift its path, and overdrive speeds up both paddles and the
ball. Grab the floating rift cores when the ball passes through them for two
Rift charges; a core collected at full charge adds bonus score damage instead.
After three consecutive paddle returns, each catch triggers anime-style impact
frames, oversized energy beams, dramatic speed lines, and a live hit-combo
counter. Impact styles rotate between hits and grow more elaborate as the rally
builds. The Kamehameha beam, Spirit Bomb, Rasengan sphere, and black-hole
accretion disk have oversized, distinct hit animations. Each chosen upgrade
also gets its own spirit companion and color-and-shape power awakening.
Choose **LEVEL SELECT** from the menu to challenge the current opponent or any
rival you have already beaten. Beating a rival unlocks the next level, and
unlocks are saved in this browser. Scored points reset play immediately. The
arena has CRT scanlines and pixel-grid detailing, and your
paddle visibly cracks as its hull takes damage.

## Run upgrades

- **Life Siphon** can restore hull when you return a shot; **Second Wind**
  repairs hull immediately.
- **Quick Hands** and **Overdrive** increase paddle movement speed.
- **Quick Hands** also unlocks a directional double-tap flash-step.
- **Heavy Hitter** and **Extra Impact** increase damage when an opponent misses.
- **Reinforced Hull** increases maximum health and repairs you; **Wide Guard**
  increases your paddle size.
- **Phase Shield** blocks a missed shot, **Tempo Drain** slows your rivals,
  **Ricochet Core** adds speed to wall rebounds, **Arc Capacitor** charges
  occasional bonus-damage shots, and **Curve Driver** bends returns.
- **Astral Warden** charges a miss-blocking ward every three returns;
  **Emberspirit Drive** adds return speed and fiery hit trails; **Reaper's
  Crescent** charges a sweeping slash every three returns for bonus score damage.
- **Phantom Curve** and **Curve Driver** bend your shots toward a rival;
  **Ghost Knuckle** makes them jink sharply and frequently in mid-flight. These
  attacks have unique spirit companions, projectile trails, and hit effects.

Your four latest upgrade spirits accompany you and flare when their power
activates, dashing from your paddle to physically strike the ball or perform
their power.

Every opponent enters a themed second phase at half health. The rival's
signature attack is telegraphed after their paddle return, with a distinct
arena color and move: turbo bursts, erratic jinks, breach shots, tracking
curves, meteor shots, precision targeting, fortress drives, glitch volleys,
and the Last Ace's predictive shot. Events and cores work alongside these
phases. Bosses now unleash an exclusive superpower on a separate telegraph:
Iron Wall's Titan Bastion blocks one score, the Glitch Emperor flips the ball
to the opposite lane through a midcourt rift, and the Last Ace briefly tracks
your movement with a visible targeting line. The rift and Ace Lock are avoidable
with a quick reposition. A boss encounter still appears every five levels.