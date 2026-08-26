import { useEffect, useState, useCallback } from 'react';

const COMPETITIONS = [
  { code: 'PL', name: 'Premier League' },
  { code: 'PD', name: 'La Liga' },
  { code: 'BL1', name: 'Bundesliga' },
  { code: 'SA', name: 'Serie A' },
  { code: 'FL1', name: 'Ligue 1' },
  { code: 'CL', name: 'Champions League' },
  { code: 'DED', name: 'Eredivisie' },
  { code: 'PPL', name: 'Primeira Liga' },
  { code: 'BSA', name: 'Brasileirão' },
  { code: 'ELC', name: 'Championship' },
];

// Zonas de clasificación aproximadas por liga (posición → color/etiqueta).
// Los cupos exactos pueden variar según la temporada (ranking de coeficientes,
// repechajes, etc.) — se muestra la distribución más habitual de cada liga.
const ZONES = {
const ZONES = {
  PL: [
    { from: 1, to: 4, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 5, to: 5, color: 'var(--zone-europa)', label: 'Europa League' },
    { from: 18, to: 20, color: 'var(--whistle)', label: 'Descenso' },
  ],
  PD: [
    { from: 1, to: 4, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 5, to: 5, color: 'var(--zone-europa)', label: 'Europa League' },
    { from: 6, to: 6, color: 'var(--zone-conf)', label: 'Ronda de clasificación - Conference League' },
    { from: 18, to: 20, color: 'var(--whistle)', label: 'Descenso' },
  ],
  BL1: [
    { from: 1, to: 4, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 5, to: 5, color: 'var(--zone-europa)', label: 'Europa League' },
    { from: 6, to: 6, color: 'var(--zone-conf)', label: 'Ronda de clasificación - Conference League' },
    { from: 16, to: 16, color: 'var(--zone-playout)', label: 'Play Off de descenso' },
    { from: 17, to: 18, color: 'var(--whistle)', label: 'Descenso' },
  ],
  SA: [
    { from: 1, to: 4, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 5, to: 5, color: 'var(--zone-europa)', label: 'Europa League' },
    { from: 6, to: 6, color: 'var(--zone-conf)', label: 'Conference League' },
    { from: 18, to: 20, color: 'var(--whistle)', label: 'Descenso' },
  ],
  FL1: [
    { from: 1, to: 3, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 4, to: 4, color: 'var(--zone-ucl-quali)', label: 'Ronda de clasificación - Champions League' },
    { from: 5, to: 5, color: 'var(--zone-europa)', label: 'Europa League' },
    { from: 6, to: 6, color: 'var(--zone-conf)', label: 'Conference League' },
    { from: 16, to: 16, color: 'var(--zone-playout)', label: 'Play Off de descenso' },
    { from: 17, to: 18, color: 'var(--whistle)', label: 'Descenso' },
  ],
  DED: [
    { from: 1, to: 2, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 3, to: 3, color: 'var(--zone-ucl-quali)', label: 'Ronda de clasificación - Champions League' },
    { from: 4, to: 4, color: 'var(--zone-europa)', label: 'Ronda de clasificación - Europa League' },
    { from: 5, to: 8, color: 'var(--zone-conf)', label: 'Ronda de clasificación - Conference League' },
    { from: 16, to: 16, color: 'var(--zone-playout)', label: 'Play Off de descenso' },
    { from: 17, to: 18, color: 'var(--whistle)', label: 'Descenso' },
  ],
  PPL: [
    { from: 1, to: 1, color: 'var(--floodlight)', label: 'Champions League' },
    { from: 2, to: 2, color: 'var(--zone-ucl-quali)', label: 'Ronda de clasificación - Champions League' },
    { from: 3, to: 3, color: 'var(--zone-europa)', label: 'Ronda de clasificación - Europa League' },
    { from: 4, to: 4, color: 'var(--zone-conf)', label: 'Ronda de clasificación - Conference League' },
    { from: 16, to: 16, color: 'var(--zone-playout)', label: 'Play Off de descenso' },
    { from: 17, to: 18, color: 'var(--whistle)', label: 'Descenso' },
  ],
  BSA: [
    { from: 1, to: 6, color: 'var(--floodlight)', label: 'Copa Libertadores' },
    { from: 7, to: 12, color: 'var(--zone-europa)', label: 'Copa Sudamericana' },
    { from: 17, to: 20, color: 'var(--whistle)', label: 'Descenso' },
  ],
  ELC: [
    { from: 1, to: 2, color: 'var(--floodlight)', label: 'Ascenso directo a la Premier League' },
    { from: 3, to: 6, color: 'var(--zone-conf)', label: 'Play Off de ascenso' },
    { from: 22, to: 24, color: 'var(--whistle)', label: 'Descenso' },
  ],
};
};

function getZone(code, position) {
  return (ZONES[code] || []).find(z => position >= z.from && position <= z.to);
}

function zoneLegend(code) {
  const zones = ZONES[code] || [];
  const seen = new Set();
  return zones.filter(z => {
    if (seen.has(z.label)) return false;
    seen.add(z.label);
    return true;
  });
}
function initials(name) {
  return (name || '??').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function Crest({ team, size = 22 }) {
  const [broken, setBroken] = useState(false);
  if (team?.crest && !broken) {
    return (
      <img
        src={team.crest}
        alt={team.shortName || team.name}
        className="crest-img"
        style={{ width: size, height: size }}
        onError={() => setBroken(true)}
      />
    );
  }
  return <span className="badge" style={{ width: size, height: size }}>{initials(team?.shortName || team?.name)}</span>;
}

function formatDateLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.round((d.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / 86400000);
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Mañana';
  if (diffDays === -1) return 'Ayer';
  return new Date(dateStr).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
}

const POSITION_ORDER = { Goalkeeper: 0, Defence: 1, 'Centre-Back': 1, 'Left-Back': 1, 'Right-Back': 1, Midfield: 2, 'Defensive Midfield': 2, 'Central Midfield': 2, 'Attacking Midfield': 2, Offence: 3, 'Left Winger': 3, 'Right Winger': 3, 'Centre-Forward': 3, Attack: 3 };
function positionRank(pos) {
  return POSITION_ORDER[pos] ?? 4;
}

const POSITION_GROUPS = [
  { key: 0, label: 'Arqueros' },
  { key: 1, label: 'Defensores' },
  { key: 2, label: 'Mediocampistas' },
  { key: 3, label: 'Delanteros' },
  { key: 4, label: 'Otros' },
];

async function getJSON(path) {
  const res = await fetch(`/api/football/${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de red');
  return data;
}

export default function Home() {
  const [competition, setCompetition] = useState('PL');
  const [tab, setTab] = useState('tabla');
  const [standings, setStandings] = useState(null);
  const [matches, setMatches] = useState(null);
  const [scorers, setScorers] = useState(null);
  const [statMode, setStatMode] = useState('goals');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamMatches, setTeamMatches] = useState(null);
  const [teamSquad, setTeamSquad] = useState(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState(null);

  const loadCompetition = useCallback(async (code) => {
    setLoading(true);
    setError(null);
    try {
      const dateFrom = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
      const dateTo = new Date(Date.now() + 4 * 86400000).toISOString().slice(0, 10);

      const [standingsData, matchesData, scorersData] = await Promise.all([
        getJSON(`competitions/${code}/standings`),
        getJSON(`competitions/${code}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`),
        getJSON(`competitions/${code}/scorers?limit=10`),
      ]);

      setStandings(standingsData.standings?.[0]?.table || []);
      setMatches(matchesData.matches || []);
      setScorers(scorersData.scorers || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCompetition(competition); }, [competition, loadCompetition]);

  async function openTeam(team) {
    setSelectedTeam(team);
    setTeamMatches(null);
    setTeamSquad(null);
    setExpandedPlayerId(null);
    try {
      const [matchesData, teamData] = await Promise.all([
        getJSON(`teams/${team.id}/matches?status=FINISHED&limit=5`),
        getJSON(`teams/${team.id}`),
      ]);
      setTeamMatches(matchesData.matches || []);
      setTeamSquad(teamData.squad || []);
    } catch {
      setTeamMatches([]);
      setTeamSquad([]);
    }
  }

  const fixturesByDay = (matches || []).reduce((acc, m) => {
    const label = formatDateLabel(m.utcDate);
    (acc[label] = acc[label] || []).push(m);
    return acc;
  }, {});

  return (
    <div className="wrap">
      <header className="top">
        <div>
          <div className="brand-eyebrow">Datos en vivo · football-data.org</div>
          <h1 className="brand">MATCHDAY<span className="sub">Posiciones, partidos y estadísticas de jugadores, todo en un lugar.</span></h1>
        </div>
      </header>

      {error && (
        <div className="banner error">
          No pudimos traer los datos: {error}. Revisá que FOOTBALL_API_KEY esté configurada en el servidor.
        </div>
      )}

      <div className="league-select">
        {COMPETITIONS.map(c => (
          <div key={c.code} className={`lchip ${competition === c.code ? 'active' : ''}`}
            onClick={() => setCompetition(c.code)}>{c.name}</div>
        ))}
      </div>

      <div className="tabs">
        {['tabla', 'partidos', 'jugadores'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {loading && <div className="banner info" style={{ marginTop: 16 }}>Cargando datos de {COMPETITIONS.find(c => c.code === competition)?.name}…</div>}

      {!loading && tab === 'tabla' && standings && (
        <>
          <table className="standings">
            <thead>
              <tr><th>Club</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DIF</th><th className="pts">PTS</th></tr>
            </thead>
            <tbody>
              {standings.map((row, i) => {
                const position = i + 1;
                const zone = getZone(competition, position);
                return (
                  <tr key={row.team.id}>
                    <td className="pos" style={{ borderLeft: `4px solid ${zone ? zone.color : 'transparent'}` }}>{position}</td>
                    <td className="club" onClick={() => openTeam(row.team)}>
                      <Crest team={row.team} />
                      {row.team.shortName || row.team.name}
                    </td>
                    <td>{row.playedGames}</td><td>{row.won}</td><td>{row.draw}</td><td>{row.lost}</td>
                    <td>{row.goalsFor}</td><td>{row.goalsAgainst}</td>
                    <td>{row.goalDifference > 0 ? '+' : ''}{row.goalDifference}</td>
                    <td className="pts">{row.points}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {zoneLegend(competition).length > 0 && (
            <div className="zone-legend">
              {zoneLegend(competition).map(z => (
                <div className="zone-legend-item" key={z.label}>
                  <span className="zone-dot" style={{ background: z.color }}></span>{z.label}
                </div>
              ))}
              <div className="zone-legend-note">Cupos aproximados — pueden variar según la temporada.</div>
            </div>
          )}
        </>
      )}

      {!loading && tab === 'partidos' && (
        <div>
          {Object.keys(fixturesByDay).length === 0 && <p style={{ color: 'var(--chalk-dim)' }}>No hay partidos programados en este rango de fechas.</p>}
          {Object.entries(fixturesByDay).map(([day, list]) => (
            <div key={day}>
              <div className="day-label">{day}</div>
              {list.map(m => {
                const live = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status);
                const played = m.status === 'FINISHED';
                const statusLabel = live ? (m.minute ? `${m.minute}'` : 'En vivo')
                  : played ? 'Final'
                  : new Date(m.utcDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <div className="fixture" key={m.id}>
                    <div className="side">
                      <Crest team={m.homeTeam} size={18} />
                      {m.homeTeam.shortName || m.homeTeam.name}
                    </div>
                    <div className="mid">
                      {played || live
                        ? <>{m.score.fullTime.home ?? 0}<span className="vs"> - </span>{m.score.fullTime.away ?? 0}</>
                        : <span className="vs">vs</span>}
                    </div>
                    <div className="side right">
                      {m.awayTeam.shortName || m.awayTeam.name}
                      <Crest team={m.awayTeam} size={18} />
                    </div>
                    <div className={`status ${live ? 'live' : ''}`}>{statusLabel}</div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!loading && tab === 'jugadores' && scorers && (
        <div>
          <div className="league-select">
            <div className={`lchip ${statMode === 'goals' ? 'active' : ''}`} onClick={() => setStatMode('goals')}>Goleadores</div>
            <div className={`lchip ${statMode === 'assists' ? 'active' : ''}`} onClick={() => setStatMode('assists')}>Asistencias</div>
          </div>
          {[...scorers].sort((a, b) => (b[statMode] || 0) - (a[statMode] || 0)).map((s, i) => (
            <div className="player-row" key={s.player.id} onClick={() => setSelectedPlayer(s)}>
              <div className="player-rank">{i + 1}</div>
              <Crest team={s.team} size={30} />
              <div className="player-info">
                <div className="player-name">{s.player.name}</div>
                <div className="player-meta">{s.team.shortName || s.team.name} · {s.player.position || '—'}</div>
              </div>
              <div className="player-stat">{s[statMode] ?? 0}</div>
            </div>
          ))}
          <div className="premium-lock">
            📊 <span>Historial de enfrentamientos, mapas de tiro y comparador de jugadores — <b>disponible en el plan pago</b> (próximamente).</span>
          </div>
        </div>
      )}

      {selectedPlayer && (
        <div className="overlay" onClick={() => setSelectedPlayer(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setSelectedPlayer(null)}>×</button>
            <h2>{selectedPlayer.player.name}</h2>
            <div className="sub">{selectedPlayer.team.name} · {selectedPlayer.player.position || 'Posición no informada'}</div>
            <div className="stat-grid">
              <div className="stat-box"><div className="n">{selectedPlayer.goals ?? 0}</div><div className="l">Goles</div></div>
              <div className="stat-box"><div className="n">{selectedPlayer.assists ?? 0}</div><div className="l">Asistencias</div></div>
              <div className="stat-box"><div className="n">{selectedPlayer.playedMatches ?? '—'}</div><div className="l">Partidos</div></div>
            </div>
            <div className="premium-lock">🔒 Nacionalidad, edad y comparativa con otros jugadores — plan pago.</div>
          </div>
        </div>
      )}

      {selectedTeam && (
        <div className="overlay" onClick={() => setSelectedTeam(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setSelectedTeam(null)}>×</button>
            <h2>{selectedTeam.name}</h2>
            <div className="sub">Últimos 5 partidos</div>
            {teamMatches === null && <p style={{ color: 'var(--chalk-dim)' }}>Cargando…</p>}
            {teamMatches && teamMatches.length === 0 && <p style={{ color: 'var(--chalk-dim)' }}>Sin datos recientes.</p>}
            {teamMatches && teamMatches.map(m => (
              <div className="fixture" key={m.id}>
                <div className="side">{m.homeTeam.shortName || m.homeTeam.name}</div>
                <div className="mid">{m.score.fullTime.home}<span className="vs"> - </span>{m.score.fullTime.away}</div>
                <div className="side right">{m.awayTeam.shortName || m.awayTeam.name}</div>
              </div>
            ))}

            <div className="sub" style={{ marginTop: 20 }}>Plantel</div>
            {teamSquad === null && <p style={{ color: 'var(--chalk-dim)' }}>Cargando…</p>}
            {teamSquad && teamSquad.length === 0 && <p style={{ color: 'var(--chalk-dim)' }}>No hay datos de plantel disponibles.</p>}
            {teamSquad && teamSquad.length > 0 && (
              <div className="squad-list">
                {POSITION_GROUPS.map(group => {
                  const players = teamSquad
                    .filter(p => positionRank(p.position) === group.key)
                    .sort((a, b) => a.name.localeCompare(b.name));
                  if (players.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <div className="squad-group-label">{group.label}</div>
                      {players.map(p => {
                        const expanded = expandedPlayerId === p.id;
                        return (
                          <div
                            className="squad-player"
                            key={p.id}
                            onClick={() => setExpandedPlayerId(id => (id === p.id ? null : p.id))}
                          >
                            <span className="squad-number">{p.shirtNumber ?? '—'}</span>
                            <div className="squad-info">
                              <div className="squad-name">{p.name}</div>
                              {expanded && (
                                <div className="squad-extra">
                                  {p.position || 'Posición no informada'}
                                  {p.nationality ? ` · ${p.nationality}` : ''}
                                  {p.dateOfBirth ? ` · Nac. ${new Date(p.dateOfBirth).toLocaleDateString('es-AR')}` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="halfway"><div className="line"></div><div className="label">Datos en vivo</div><div className="line"></div></div>
      <footer>Datos provistos por football-data.org · MVP público, suscripción paga próximamente</footer>
    </div>
  );
}
