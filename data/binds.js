// Curated, CS2-correct binds & configs. Replace KEY-ish bindings with your own keys.
export const BIND_GROUPS = [
  {
    name: "Essentials",
    blurb: "The handful of binds almost every player runs.",
    items: [
      {
        title: "Jump-throw bind",
        desc: "Jumps and releases the nade on the same tick for frame-perfect lineups. Hold the grenade, line it up, press the key. Releases both left and right click so it works for any throw. Legal in MM / Premier / FACEIT; a few tournaments restrict multi-action binds.",
        code: 'alias "+jumpthrow" "+jump;-attack;-attack2"\nalias "-jumpthrow" "-jump"\nbind "alt" "+jumpthrow"',
      },
      {
        title: "Clear decals",
        desc: "Clears smoke residue, blood and bullet marks so your view stays clean while lining up or peeking.",
        code: 'bind "h" "r_cleardecals"',
      },
      {
        title: "Switch weapon hand",
        desc: "Flips your weapon to the other hand on a toggle — useful for clearing certain angles where the gun blocks your view.",
        code: 'bind "x" "toggle cl_righthand 0 1"',
      },
    ],
  },
  {
    name: "Buy binds",
    blurb: "One-press buys. They only purchase what your team and money allow, so the same key works on T and CT.",
    items: [
      {
        title: "Full buy — rifle + armour + kit",
        desc: "Buys the team rifle, full armour and (CT) defuse kit in one press.",
        code: 'bind "kp_end" "buy vesthelm;buy ak47;buy m4a1;buy defuser;"',
      },
      {
        title: "Full nades",
        desc: "Buys smoke, flash, HE and molotov/incendiary — whatever you can afford.",
        code: 'bind "kp_downarrow" "buy smokegrenade;buy flashbang;buy hegrenade;buy molotov;buy incgrenade;"',
      },
      {
        title: "Armour only",
        desc: "Kevlar + helmet for force/eco rounds.",
        code: 'bind "kp_leftarrow" "buy vesthelm;buy vest;"',
      },
      {
        title: "AWP",
        desc: "Quick AWP buy.",
        code: 'bind "kp_pgup" "buy awp;"',
      },
    ],
  },
  {
    name: "Grenade quick-select",
    blurb: "Pull a specific nade with one key instead of cycling — faster and mistake-proof mid-fight.",
    items: [
      { title: "Smoke", desc: "Selects the smoke grenade directly.", code: 'bind "c" "use weapon_smokegrenade"' },
      { title: "Flash", desc: "Selects a flashbang directly.", code: 'bind "f" "use weapon_flashbang"' },
      { title: "HE grenade", desc: "Selects the HE grenade directly.", code: 'bind "v" "use weapon_hegrenade"' },
      { title: "Molotov / Incendiary", desc: "Works on both teams — selects molotov (T) or incendiary (CT).", code: 'bind "z" "use weapon_molotov;use weapon_incgrenade"' },
    ],
  },
  {
    name: "Practice & lineups",
    blurb: "Drop these in a private server to rehearse throws.",
    items: [
      {
        title: "Practice config",
        desc: "Infinite nades, no buy restrictions, grenade trajectory + preview, show impacts. Paste in console on a private server with bots kicked.",
        code: "sv_cheats 1;sv_infinite_ammo 1;ammo_grenade_limit_total 5;mp_warmup_end;mp_freezetime 0;mp_roundtime 60;mp_roundtime_defuse 60;sv_grenade_trajectory 1;sv_grenade_trajectory_time 10;cl_grenadepreview 1;bot_kick;mp_limitteams 0;mp_autoteambalance 0;sv_showimpacts 1",
      },
      {
        title: "Show position (for getpos)",
        desc: "Prints your exact position + angles. Type getpos in console while standing on a throw spot, then save it to a lineup so others can teleport there.",
        code: "getpos",
      },
    ],
  },
];
