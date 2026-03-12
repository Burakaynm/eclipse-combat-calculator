import React, { useState } from "react";

const ITERATIONS = 100000;

const FIELD_DEFS = [
  {
    key: "yellowDice",
    label: "●",
    bg: "#d4c714",
    color: "#111111",
    tooltip: "Ion Cannon",
  },
  {
    key: "orangeDice",
    label: "●●",
    bg: "#c96a1a",
    color: "#111111",
    tooltip: "Plasma Cannon",
  },
  {
    key: "blueDice",
    label: "●●●",
    bg: "#2e5fa7",
    color: "#f5f5f5",
    tooltip: "Soliton Cannon",
  },
  {
    key: "redDice",
    label: "●●●●",
    bg: "#9f2f2f",
    color: "#f5f5f5",
    tooltip: "Antimatter Cannon",
  },
  {
    key: "riftDice",
    label: "◆",
    bg: "#c731bac4",
    color: "#ffffff",
    tooltip: "Rift Cannon",
  },
  {
    key: "yellowMissile",
    label: "● 🚀︎",
    bg: "#d4c714",
    color: "#111111",
    tooltip: "Flux Missile",
  },
  {
    key: "orangeMissile",
    label: "●● 🚀︎",
    bg: "#c96a1a",
    color: "#111111",
    tooltip: "Plasma Missile",
  },
  {
    key: "blueMissile",
    label: "●●● 🚀︎",
    bg: "#2e5fa7",
    color: "#f5f5f5",
    tooltip: "Solution Missile",
  },
  {
    key: "computer",
    label: "✚",
    bg: "#d6d1c4",
    color: "#111111",
    tooltip: "Computer",
  },
  {
    key: "shield",
    label: "−",
    bg: "rgb(122, 122, 122)",
    color: "#f5f5f5",
    tooltip: "Shield",
  },
  {
    key: "shipCount",
    label: "▶▶",
    bg: "#d6d1c4",
    color: "#111111",
    tooltip: "Ship Count",
  },
  { key: "hull", label: "◉", bg: "#4a4f57", color: "#f5f5f5", tooltip: "Hull" },
  {
    key: "initiative",
    label: "^",
    bg: "#44413d",
    color: "#f5f5f5",
    tooltip: "Initiative",
  },
];

const EMPTY_SHIP = {
  id: "",
  shipCount: 1,
  yellowDice: 0,
  orangeDice: 0,
  blueDice: 0,
  redDice: 0,
  riftDice: 0,
  yellowMissile: 0,
  orangeMissile: 0,
  blueMissile: 0,
  computer: 0,
  shield: 0,
  hull: 0,
  initiative: 0,
  morphShield: false,
};

const NPC_PRESETS = {
  custom: null,
  "ancient-1": [
    { ...EMPTY_SHIP, yellowDice: 2, computer: 1, hull: 1, initiative: 2 },
  ],
  "ancient-2": [
    { ...EMPTY_SHIP, orangeDice: 1, computer: 1, hull: 2, initiative: 1 },
  ],
  "ancient-3": [
    { ...EMPTY_SHIP, yellowDice: 1, computer: 2, hull: 1, initiative: 3 },
  ],
  "guardian-1": [
    { ...EMPTY_SHIP, yellowDice: 3, computer: 2, hull: 2, initiative: 3 },
  ],
  "guardian-2": [
    {
      ...EMPTY_SHIP,
      orangeMissile: 2,
      redDice: 1,
      computer: 1,
      hull: 3,
      initiative: 1,
    },
  ],
  "guardian-3": [
    {
      ...EMPTY_SHIP,
      orangeDice: 2,
      computer: 1,
      shield: 1,
      hull: 3,
      initiative: 2,
    },
  ],
  "gcds-1": [
    { ...EMPTY_SHIP, yellowDice: 4, computer: 2, hull: 7, initiative: 0 },
  ],
  "gcds-2": [
    {
      ...EMPTY_SHIP,
      yellowMissile: 4,
      redDice: 1,
      computer: 2,
      hull: 3,
      initiative: 2,
    },
  ],
  "gcds-3": [
    {
      ...EMPTY_SHIP,
      orangeDice: 2,
      computer: 2,
      shield: 2,
      hull: 4,
      initiative: 3,
    },
  ],
};

const PRESET_OPTIONS = [
  { value: "custom", label: "Custom" },
  { value: "ancient-1", label: "Ancient 1" },
  { value: "ancient-2", label: "Ancient 2" },
  { value: "ancient-3", label: "Ancient 3" },
  { value: "guardian-1", label: "Guardian 1" },
  { value: "guardian-2", label: "Guardian 2" },
  { value: "guardian-3", label: "Guardian 3" },
  { value: "gcds-1", label: "GCDS 1" },
  { value: "gcds-2", label: "GCDS 2" },
  { value: "gcds-3", label: "GCDS 3" },
];

function createShip(partial = {}) {
  return {
    ...EMPTY_SHIP,
    id: `ship-${Math.random().toString(36).slice(2, 9)}`,
    ...partial,
  };
}

function cloneShips(ships) {
  return ships.map((ship) => createShip({ ...ship }));
}

function totalHpPerShip(ship) {
  return 1 + Number(ship.hull || 0);
}

function clampNonNegative(value) {
  return Math.max(0, value);
}

function rollWeaponDamage(damage, computer, targetShield) {
  const roll = Math.floor(Math.random() * 6) + 1;
  if (roll === 1) return 0;
  if (roll === 6) return damage;
  return roll + computer - targetShield >= 6 ? damage : 0;
}

function hasCannons(ship) {
  return (
    ship.yellowDice +
      ship.orangeDice +
      ship.blueDice +
      ship.redDice +
      ship.riftDice >
    0
  );
}

function hasMissiles(ship) {
  return ship.yellowMissile + ship.orangeMissile + ship.blueMissile > 0;
}

function chooseTarget(enemyShips, damage) {
  const alive = enemyShips.filter((ship) => ship.hp > 0);
  if (alive.length === 0) return null;

  const killable = alive
    .filter((ship) => ship.hp <= damage)
    .sort((a, b) => a.hp - b.hp || a.shield - b.shield);

  if (killable.length > 0) return killable[0];
  return alive.sort((a, b) => a.hp - b.hp || a.shield - b.shield)[0];
}

function applySplitAntimatterDamage(enemyShips, totalDamage) {
  let remaining = totalDamage;

  while (remaining > 0) {
    const alive = enemyShips.filter((ship) => ship.hp > 0);
    if (alive.length === 0) break;

    const target = chooseTarget(alive, remaining);
    if (!target) break;

    const dealt = Math.min(target.hp, remaining);
    target.hp -= dealt;
    remaining -= dealt;
  }
}

function fireShip(attacker, enemyShips, phase, antimatterSplitter) {
  if (attacker.hp <= 0) return;
  if (phase === "missile" && !hasMissiles(attacker)) return;
  if (phase === "cannon" && !hasCannons(attacker)) return;

  if (phase === "missile") {
    const missileAttempts = [
      ...Array.from({ length: attacker.yellowMissile }, () => 1),
      ...Array.from({ length: attacker.orangeMissile }, () => 2),
      ...Array.from({ length: attacker.blueMissile }, () => 3),
    ];

    missileAttempts.forEach((damage) => {
      const target = chooseTarget(enemyShips, damage);
      if (!target) return;

      const appliedDamage = rollWeaponDamage(
        damage,
        attacker.computer,
        target.shield,
      );
      if (appliedDamage <= 0) return;

      target.hp = Math.max(0, target.hp - appliedDamage);
    });

    return;
  }

  // Yellow / Orange / Blue normal davranır
  const normalCannonAttempts = [
    ...Array.from({ length: attacker.yellowDice }, () => 1),
    ...Array.from({ length: attacker.orangeDice }, () => 2),
    ...Array.from({ length: attacker.blueDice }, () => 3),
  ];

  normalCannonAttempts.forEach((damage) => {
    const target = chooseTarget(enemyShips, damage);
    if (!target) return;

    const appliedDamage = rollWeaponDamage(
      damage,
      attacker.computer,
      target.shield,
    );
    if (appliedDamage <= 0) return;

    target.hp = Math.max(0, target.hp - appliedDamage);
  });

  // Red dice: Antimatter Cannon
  for (let i = 0; i < attacker.redDice; i++) {
    const target = chooseTarget(enemyShips, 4);
    if (!target) break;

    const appliedDamage = rollWeaponDamage(4, attacker.computer, target.shield);
    if (appliedDamage <= 0) continue;

    if (antimatterSplitter) {
      applySplitAntimatterDamage(enemyShips, appliedDamage);
    } else {
      target.hp = Math.max(0, target.hp - appliedDamage);
    }
  }

  // Rift Cannon
  for (let i = 0; i < attacker.riftDice; i++) {
    const result = rollRiftCannon();

    if (result.damage > 0) {
      const target = chooseTarget(enemyShips, result.damage);
      if (target) {
        target.hp = Math.max(0, target.hp - result.damage);
      }
    }

    if (result.self > 0) {
      attacker.hp = Math.max(0, attacker.hp - result.self);
    }
  }
}

function rollRiftCannon() {
  const roll = Math.floor(Math.random() * 6) + 1;

  if (roll === 1) return { damage: 3, self: 1 };
  if (roll === 2) return { damage: 2, self: 0 };
  if (roll === 3) return { damage: 1, self: 0 };
  if (roll === 4) return { damage: 0, self: 1 };
  return { damage: 0, self: 0 };
}

function buildBattleShips(sideName, ships) {
  return ships.flatMap((ship) =>
    Array.from({ length: Number(ship.shipCount || 0) }, (_, index) => ({
      ...ship,
      id: `${ship.id}-${index}`,
      side: sideName,
      maxHp: totalHpPerShip(ship),
      hp: totalHpPerShip(ship),
    })),
  );
}

function applyMorphShieldHealing(allShips) {
  allShips.forEach((ship) => {
    if (ship.hp > 0 && ship.morphShield) {
      ship.hp = Math.min(ship.maxHp, ship.hp + 1);
    }
  });
}

function getAliveShips(ships, side) {
  return ships.filter((ship) => ship.side === side && ship.hp > 0);
}

function simulateSingleBattle(attackerShips, defenderShips, techs) {
  const allShips = [
    ...buildBattleShips("attacker", attackerShips),
    ...buildBattleShips("defender", defenderShips),
  ];

  const fireOrder = (phase) => {
    const shooters = allShips
      .filter((ship) => ship.hp > 0)
      .filter((ship) =>
        phase === "missile" ? hasMissiles(ship) : hasCannons(ship),
      )
      .sort(
        (a, b) =>
          b.initiative - a.initiative || (a.side === "defender" ? -1 : 1),
      );

    shooters.forEach((ship) => {
      const enemies = getAliveShips(
        allShips,
        ship.side === "attacker" ? "defender" : "attacker",
      );
      if (enemies.length === 0) return;
      fireShip(
        ship,
        enemies,
        phase,
        ship.side === "attacker" ? techs.attacker : techs.defender,
      );
    });
  };

  if (allShips.some(hasMissiles)) fireOrder("missile");

  let rounds = 0;
  let stagnant = 0;
  let previousState = allShips.map((ship) => ship.hp).join("|");

  while (
    getAliveShips(allShips, "attacker").length > 0 &&
    getAliveShips(allShips, "defender").length > 0 &&
    rounds < ITERATIONS
  ) {
    rounds += 1;
    fireOrder("cannon");
    applyMorphShieldHealing(allShips);
    const state = allShips.map((ship) => ship.hp).join("|");
    if (state === previousState) stagnant += 1;
    else {
      stagnant = 0;
      previousState = state;
    }

    if (stagnant >= 10) {
      return {
        winner: "draw",
        attackerSurvivors: {},
        defenderSurvivors: {},
      };
    }
  }

  const attackerAliveShips = getAliveShips(allShips, "attacker");
  const defenderAliveShips = getAliveShips(allShips, "defender");

  let winner = "draw";
  if (attackerAliveShips.length > 0 && defenderAliveShips.length === 0)
    winner = "attacker";
  if (defenderAliveShips.length > 0 && attackerAliveShips.length === 0)
    winner = "defender";

  const attackerSurvivors = {};
  const defenderSurvivors = {};

  attackerShips.forEach((ship) => {
    attackerSurvivors[ship.id] = attackerAliveShips.some((alive) =>
      alive.id.startsWith(ship.id),
    );
  });

  defenderShips.forEach((ship) => {
    defenderSurvivors[ship.id] = defenderAliveShips.some((alive) =>
      alive.id.startsWith(ship.id),
    );
  });

  return {
    winner,
    attackerSurvivors,
    defenderSurvivors,
  };
}

function simulateManyBattles(
  attackerShips,
  defenderShips,
  iterations = ITERATIONS,
  techs,
) {
  let attackerWins = 0;
  let defenderWins = 0;
  let draws = 0;

  const attackerVictorySurvivalCounts = {};
  const defenderVictorySurvivalCounts = {};

  attackerShips.forEach((ship) => {
    attackerVictorySurvivalCounts[ship.id] = 0;
  });

  defenderShips.forEach((ship) => {
    defenderVictorySurvivalCounts[ship.id] = 0;
  });

  for (let i = 0; i < iterations; i += 1) {
    const result = simulateSingleBattle(attackerShips, defenderShips, techs);

    if (result.winner === "attacker") {
      attackerWins += 1;
      attackerShips.forEach((ship) => {
        if (result.attackerSurvivors[ship.id]) {
          attackerVictorySurvivalCounts[ship.id] += 1;
        }
      });
    } else if (result.winner === "defender") {
      defenderWins += 1;
      defenderShips.forEach((ship) => {
        if (result.defenderSurvivors[ship.id]) {
          defenderVictorySurvivalCounts[ship.id] += 1;
        }
      });
    } else {
      draws += 1;
    }
  }

  const attackerVictorySurvivalRates = {};
  const defenderVictorySurvivalRates = {};

  attackerShips.forEach((ship) => {
    attackerVictorySurvivalRates[ship.id] =
      attackerWins === 0
        ? 0
        : (attackerVictorySurvivalCounts[ship.id] / attackerWins) * 100;
  });

  defenderShips.forEach((ship) => {
    defenderVictorySurvivalRates[ship.id] =
      defenderWins === 0
        ? 0
        : (defenderVictorySurvivalCounts[ship.id] / defenderWins) * 100;
  });

  return {
    attackerWinRate: (attackerWins / iterations) * 100,
    defenderWinRate: (defenderWins / iterations) * 100,
    drawRate: (draws / iterations) * 100,
    attackerVictorySurvivalRates,
    defenderVictorySurvivalRates,
  };
}

function Tile({ label, value, bg, color, tooltip, onIncrement, onDecrement }) {
  const handleContextMenu = (event) => {
    event.preventDefault();
    onDecrement();
  };

  return (
    <button
      type="button"
      onClick={onIncrement}
      onContextMenu={handleContextMenu}
      title={tooltip}
      style={{
        backgroundColor: bg,
        color,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: 14,
        cursor: "pointer",
        minHeight: 94,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: "0.5px",
          opacity: 0.98,
        }}
      >
        {label}
      </div>
      <div
        style={{ marginTop: 10, fontSize: 34, fontWeight: 700, lineHeight: 1 }}
      >
        {value}
      </div>
    </button>
  );
}

function ShipCard({
  ship,
  onUpdate,
  onRemove,
  onToggleMorph,
  removable,
  title,
}) {
  const updateField = (key, delta) => {
    onUpdate(ship.id, key, delta);
  };

  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: 14,
        background: "#1d2430",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        {/* LEFT SIDE */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#f9fafb",
            letterSpacing: "0.2px",
          }}
        >
          {title}
        </div>

        {/* RIGHT SIDE */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "#cbd5e1",
              fontWeight: 700,
              fontSize: 12,
              padding: "6px 8px",
              borderRadius: 10,
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            title="Morph Shield"
          >
            <input
              type="checkbox"
              checked={ship.morphShield}
              onChange={(e) => onToggleMorph(ship.id, e.target.checked)}
            />
            Morph Shield
          </label>

          {removable && (
            <button
              onClick={() => onRemove(ship.id)}
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "linear-gradient(180deg, #374151 0%, #111827 100%)",
                color: "#f9fafb",
                cursor: "pointer",
                fontWeight: 800,
                boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
              }}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {FIELD_DEFS.map((field) => {
          if (field.key === "__spacer__") {
            return <div key="__spacer__" />;
          }

          return (
            <Tile
              key={`${ship.id}-${field.key}`}
              label={field.label}
              value={
                field.key === "shipCount"
                  ? `x${ship[field.key]}`
                  : ship[field.key]
              }
              bg={field.bg}
              color={field.color}
              tooltip={field.tooltip}
              onIncrement={() => updateField(field.key, 1)}
              onDecrement={() => updateField(field.key, -1)}
            />
          );
        })}
      </div>
    </div>
  );
}

function Panel({
  title,
  ships,
  setShips,
  presetKey,
  setPresetKey,
  antimatterSplitter,
  setAntimatterSplitter,
}) {
  const updateShip = (id, key, delta) => {
    setPresetKey("custom");
    setShips((current) =>
      current.map((ship) => {
        if (ship.id !== id) return ship;
        return {
          ...ship,
          [key]: clampNonNegative(Number(ship[key] || 0) + delta),
        };
      }),
    );
  };

  const addShip = () => {
    setPresetKey("custom");
    setShips((current) => [...current, createShip()]);
  };

  const removeShip = (id) => {
    setPresetKey("custom");
    setShips((current) => current.filter((ship) => ship.id !== id));
  };

  const applyPreset = (value) => {
    setPresetKey(value);
    if (value === "custom") {
      setShips([createShip()]);
      return;
    }
    setShips(cloneShips(NPC_PRESETS[value]));
  };

  const toggleMorphShield = (id, checked) => {
    setPresetKey("custom");
    setShips((current) =>
      current.map((ship) =>
        ship.id === id ? { ...ship, morphShield: checked } : ship,
      ),
    );
  };

  return (
    <div
      style={{
        background: "#161b22",
        borderRadius: 22,
        padding: 18,
        boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#f9fafb",
            letterSpacing: "0.2px",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "#f9fafb",
              fontWeight: 700,
              fontSize: 14,
              padding: "10px 12px",
              borderRadius: 12,
              background: "#111827",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <input
              type="checkbox"
              checked={antimatterSplitter}
              onChange={(e) => setAntimatterSplitter(e.target.checked)}
            />
            Antimatter Splitter
          </label>

          <select
            value={presetKey}
            onChange={(e) => applyPreset(e.target.value)}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              fontSize: 14,
              background: "#111827",
              color: "#f9fafb",
              fontWeight: 700,
            }}
          >
            {PRESET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            onClick={addShip}
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "linear-gradient(180deg, #334155 0%, #1f2937 100%)",
              color: "#f9fafb",
              cursor: "pointer",
              fontWeight: 800,
              boxShadow: "0 8px 18px rgba(0,0,0,0.28)",
            }}
          >
            Add Ship
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {ships.map((ship, index) => (
          <ShipCard
            key={ship.id}
            ship={ship}
            onUpdate={updateShip}
            onRemove={removeShip}
            onToggleMorph={toggleMorphShield}
            removable={ships.length > 1}
            title={`${title} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ResultBox({ label, value, background }) {
  return (
    <div
      style={{
        background: background || "#161b22",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
        borderTop: `4px solid ${background || "#161b22"}`,
        borderLeft: "1px solid rgba(255,255,255,0.06)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          fontSize: 20,
          color: "#f9fafb",
          fontWeight: 600,
          letterSpacing: "0.3px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 25,
          fontWeight: 600,
          color: "#f9fafb",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatWinRate(rate) {
  if (rate > 99.9) return ">99.9%";
  if (rate < 0.1) return "<0.1%";
  return rate.toFixed(1) + "%";
}

function formatDrawRate(rate) {
  if (rate === 0) return "0.0%";
  return rate.toFixed(1) + "%";
}
export default function App() {
  const [attacker, setAttacker] = useState([createShip()]);
  const [defender, setDefender] = useState(
    cloneShips(NPC_PRESETS["ancient-1"]),
  );
  const [attackerPreset, setAttackerPreset] = useState("custom");
  const [defenderPreset, setDefenderPreset] = useState("ancient-1");
  const [attackerAntimatterSplitter, setAttackerAntimatterSplitter] =
    useState(false);
  const [defenderAntimatterSplitter, setDefenderAntimatterSplitter] =
    useState(false);
  const [result, setResult] = useState(null);

  const attackerWins =
    result && result.attackerWinRate > result.defenderWinRate;
  const defenderWins =
    result && result.defenderWinRate > result.attackerWinRate;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #1f2937 0%, #0b1020 45%, #070b14 100%)",
        color: "#e5e7eb",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 1580,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center", paddingTop: 4 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.2px",
              color: "#f9fafb",
            }}
          >
            Eclipse: Second Dawn for the Galaxy Combat Calculator
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            paddingTop: 24,
          }}
        >
          <button
            onClick={() =>
              setResult(
                simulateManyBattles(attacker, defender, ITERATIONS, {
                  attacker: attackerAntimatterSplitter,
                  defender: defenderAntimatterSplitter,
                }),
              )
            }
            style={{
              padding: "18px 28px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "linear-gradient(180deg, #4f46e5 0%, #312e81 100%)",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.3px",
              boxShadow: "0 12px 30px rgba(49,46,129,0.45)",
              whiteSpace: "nowrap",
            }}
          >
            Calculate
          </button>
        </div>

        {result && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              <ResultBox
                label="Attacker"
                value={formatWinRate(result.attackerWinRate)}
                background={attackerWins ? "#1e3a2f" : "#3a1e1e"}
              />

              <ResultBox
                label="Defender"
                value={formatWinRate(result.defenderWinRate)}
                background={defenderWins ? "#1e3a2f" : "#3a1e1e"}
              />

              <ResultBox
                label="Draw"
                value={formatDrawRate(result.drawRate)}
                background="#1f2937"
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div
                style={{
                  background: "#161b22",
                  borderRadius: 18,
                  padding: 18,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#f9fafb",
                    marginBottom: 12,
                  }}
                >
                  Attacker survival in event of victory
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {attacker.map((ship, index) => (
                    <div
                      key={ship.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#cbd5e1",
                        fontSize: 14,
                      }}
                    >
                      <span>{`Attacker ${index + 1}`}</span>
                      <span>{`${(result.attackerVictorySurvivalRates[ship.id] || 0).toFixed(1)}%`}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  background: "#161b22",
                  borderRadius: 18,
                  padding: 18,
                  boxShadow: "0 12px 28px rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: "#f9fafb",
                    marginBottom: 12,
                  }}
                >
                  Defender survival in event of victory
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  {defender.map((ship, index) => (
                    <div
                      key={ship.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#cbd5e1",
                        fontSize: 14,
                      }}
                    >
                      <span>{`Defender ${index + 1}`}</span>
                      <span>{`${(result.defenderVictorySurvivalRates[ship.id] || 0).toFixed(1)}%`}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          <Panel
            title="Attacker"
            ships={attacker}
            setShips={setAttacker}
            presetKey={attackerPreset}
            setPresetKey={setAttackerPreset}
            antimatterSplitter={attackerAntimatterSplitter}
            setAntimatterSplitter={setAttackerAntimatterSplitter}
          />

          <Panel
            title="Defender"
            ships={defender}
            setShips={setDefender}
            presetKey={defenderPreset}
            setPresetKey={setDefenderPreset}
            antimatterSplitter={defenderAntimatterSplitter}
            setAntimatterSplitter={setDefenderAntimatterSplitter}
          />
        </div>
      </div>
    </div>
  );
}
