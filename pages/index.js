import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import AdSlot from '../components/AdSlot';

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

const COMPETITION_FLAGS = {
  PL: 'gb',
  PD: 'es',
  BL1: 'de',
  SA: 'it',
  FL1: 'fr',
  DED: 'nl',
  PPL: 'pt',
  BSA: 'br',
  ELC: 'gb',
};

// Mapea el nombre de nacionalidad tal como lo devuelve la API a un código ISO
// de 2 letras, para poder mostrar la banderita correspondiente.
const NATIONALITY_CODES = {
  Argentina: 'ar', Brazil: 'br', Uruguay: 'uy', Chile: 'cl', Colombia: 'co',
  Peru: 'pe', Ecuador: 'ec', Paraguay: 'py', Venezuela: 've', Bolivia: 'bo',
  Spain: 'es', France: 'fr', Germany: 'de', Italy: 'it', Portugal: 'pt',
  Netherlands: 'nl', Belgium: 'be', Croatia: 'hr', Serbia: 'rs', Poland: 'pl',
  England: 'gb', Scotland: 'gb', Wales: 'gb', 'Northern Ireland': 'gb',
  'Republic of Ireland': 'ie', Ireland: 'ie', Switzerland: 'ch', Austria: 'at',
  Norway: 'no', Sweden: 'se', Denmark: 'dk', Finland: 'fi', Iceland: 'is',
  Turkey: 'tr', Greece: 'gr', Russia: 'ru', Ukraine: 'ua',
  'Czech Republic': 'cz', Slovakia: 'sk', Hungary: 'hu', Romania: 'ro',
  Bulgaria: 'bg', 'Bosnia and Herzegovina': 'ba', 'North Macedonia': 'mk',
  Albania: 'al', Montenegro: 'me', Slovenia: 'si', Kosovo: 'xk', Georgia: 'ge',
  Armenia: 'am', Israel: 'il', Iran: 'ir', 'Saudi Arabia': 'sa', Qatar: 'qa',
  'United Arab Emirates': 'ae', Japan: 'jp', 'South Korea': 'kr', China: 'cn',
  Australia: 'au', 'New Zealand': 'nz', 'United States': 'us', Canada: 'ca',
  Mexico: 'mx', Jamaica: 'jm', Morocco: 'ma', Algeria: 'dz', Tunisia: 'tn',
  Egypt: 'eg', Senegal: 'sn', 'Ivory Coast': 'ci', Ghana: 'gh', Cameroon: 'cm',
  Nigeria: 'ng', Mali: 'ml', Guinea: 'gn', 'DR Congo': 'cd', Congo: 'cg',
  Gabon: 'ga', Angola: 'ao', 'South Africa': 'za', 'Cape Verde': 'cv',
  'Guinea-Bissau': 'gw', Gambia: 'gm', 'Equatorial Guinea': 'gq', Comoros: 'km',
  Curaçao: 'cw', Suriname: 'sr',
};

function Flag({ code, size = 16 }) {
  if (!code) return <span style={{ fontSize: size }}>⚽</span>;
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      style={{ width: size, height: size * 0.75, objectFit: 'cover', borderRadius: 2, flex: '0 0 auto' }}
    />
  );
}

function MatchRow({ m, onClick }) {
  const live = ['LIVE', 'IN_PLAY', 'PAUSED'].includes(m.status);
  const played = m.status === 'FINISHED';
  const statusLabel = live ? (m.minute ? `${m.minute}'` : 'En vivo')
    : played ? 'Final'
    : new Date(m.utcDate).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="fixture" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
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
}
function matchResult(m, teamId) {
  const isHome = m.homeTeam.id === teamId;
  const gf = isHome ? m.score.fullTime.home : m.score.fullTime.away;
  const ga = isHome ? m.score.fullTime.away : m.score.fullTime.home;
  if (gf == null || ga == null) return null;
  if (gf > ga) return 'W';
  if (gf < ga) return 'L';
  return 'D';
}
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
  const [todayMatches, setTodayMatches] = useState(null);
  const [todayLoading, setTodayLoading] = useState(false);
  const [todayError, setTodayError] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchDetail, setMatchDetail] = useState(null);

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

  const loadToday = useCallback(async () => {
    setTodayLoading(true);
    setTodayError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const results = await Promise.all(
        COMPETITIONS.map(c =>
          getJSON(`competitions/${c.code}/matches?dateFrom=${today}&dateTo=${today}`)
            .then(d => ({ code: c.code, name: c.name, matches: d.matches || [] }))
            .catch(() => ({ code: c.code, name: c.name, matches: [] }))
        )
      );
      setTodayMatches(results);
    } catch (e) {
      setTodayError(e.message);
    } finally {
      setTodayLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'hoy' && todayMatches === null && !todayLoading) loadToday();
  }, [tab, todayMatches, todayLoading, loadToday]);

  async function openMatch(match) {
    setSelectedMatch(match);
    setMatchDetail(null);
    try {
      const data = await getJSON(`matches/${match.id}`);
      setMatchDetail(data);
    } catch {
      setMatchDetail({ error: true });
    }
  }

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
      <Head>
        <title>Paso X Paso — Fútbol en vivo</title>
        <meta name="description" content="Posiciones, partidos y estadísticas de jugadores de las principales ligas de fútbol." />
      </Head>
      <header className="top">
        <div>
          <div className="brand-eyebrow">Datos en vivo · football-data.org</div>
          <h1 className="brand">PASO X PASO<span className="sub">Posiciones, partidos y estadísticas de jugadores, todo en un lugar.</span></h1>
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
            onClick={() => setCompetition(c.code)}>
            {COMPETITION_FLAGS[c.code] ? <Flag code={COMPETITION_FLAGS[c.code]} size={14} /> : <span>🏆</span>} {c.name}
          </div>
        ))}
      </div>

      <div className="tabs">
        {['hoy', 'tabla', 'partidos', 'jugadores'].map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <AdSlot slot="1111111111" label="Banner superior" />

      {tab === 'hoy' && (
        <div>
          {todayLoading && <div className="banner info" style={{ marginTop: 16 }}>Cargando partidos de todas las ligas…</div>}
          {todayError && <div className="banner error">No pudimos traer los partidos de hoy: {todayError}</div>}
          {todayMatches && todayMatches.every(g => g.matches.length === 0) && (
            <p style={{ color: 'var(--chalk-dim)' }}>No hay partidos programados para hoy en ninguna de las ligas.</p>
          )}
          {todayMatches && todayMatches.filter(g => g.matches.length > 0).map(g => (
            <div key={g.code}>
              <div className="day-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Flag code={COMPETITION_FLAGS[g.code]} size={13} /> {g.name}
              </div>
              {g.matches.map(m => <MatchRow m={m} key={m.id} onClick={() => openMatch(m)} />)}
            </div>
          ))}
        </div>
      )}

      {loading && tab !== 'hoy' && <div className="banner info" style={{ marginTop: 16 }}>Cargando datos de {COMPETITIONS.find(c => c.code === competition)?.name}…</div>}

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
              {list.map(m => <MatchRow m={m} key={m.id} onClick={() => openMatch(m)} />)}
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
                            <span className="squad-flag"><Flag code={NATIONALITY_CODES[p.nationality]} size={18} /></span>
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

      {selectedMatch && (
        <div className="overlay" onClick={() => setSelectedMatch(null)}>
          <div className="sheet" onClick={e => e.stopPropagation()}>
            <button className="sheet-close" onClick={() => setSelectedMatch(null)}>×</button>
            <h2>{selectedMatch.homeTeam.shortName || selectedMatch.homeTeam.name} {selectedMatch.score.fullTime.home ?? 0} - {selectedMatch.score.fullTime.away ?? 0} {selectedMatch.awayTeam.shortName || selectedMatch.awayTeam.name}</h2>
            <div className="sub">Detalle del partido</div>

            {matchDetail === null && <p style={{ color: 'var(--chalk-dim)' }}>Cargando…</p>}
            {matchDetail?.error && <p style={{ color: 'var(--chalk-dim)' }}>No pudimos traer el detalle de este partido.</p>}

            {matchDetail && !matchDetail.error && (
              <>
                <div className="match-detail-section">⚽ Goles</div>
                {(!matchDetail.goals || matchDetail.goals.length === 0) && (
                  <p style={{ color: 'var(--chalk-dim)', fontSize: 13 }}>Sin datos de goleadores para este partido.</p>
                )}
                {matchDetail.goals && matchDetail.goals.map((g, i) => (
                  <div className="match-event" key={i}>
                    <span className="match-event-minute">{g.minute}'</span>
                    <span className="match-event-desc">
                      {g.scorer?.name || 'Jugador no informado'}
                      {g.type === 'PENALTY' ? ' (penal)' : g.type === 'OWN' ? ' (en contra)' : ''}
                    </span>
                    <span className="match-event-team">{g.team?.shortName || g.team?.name}</span>
                  </div>
                ))}

                <div className="match-detail-section" style={{ marginTop: 18 }}>🟥 Expulsados</div>
                {(() => {
                  const reds = (matchDetail.bookings || []).filter(b => b.card === 'RED' || b.card === 'YELLOW_RED');
                  if (reds.length === 0) return <p style={{ color: 'var(--chalk-dim)', fontSize: 13 }}>Sin expulsados en este partido.</p>;
                  return reds.map((b, i) => (
                    <div className="match-event" key={i}>
                      <span className="match-event-minute">{b.minute}'</span>
                      <span className="match-event-desc">{b.player?.name || 'Jugador no informado'}</span>
                      <span className="match-event-team">{b.team?.shortName || b.team?.name}</span>
                    </div>
                  ));
                })()}
              </>
            )}
          </div>
        </div>
      )}

      <AdSlot slot="2222222222" label="Banner inferior" />

      <div className="halfway"><div className="line"></div><div className="label">Datos en vivo</div><div className="line"></div></div>
      <footer>Datos provistos por football-data.org · MVP público, suscripción paga próximamente</footer>
    </div>
  );
}
