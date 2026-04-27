import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_SOURCE_URL =
  'https://live.centrosportivoitaliano.it/25/Calcio-a-7/Lombardia/Bergamo/S1049/?j=NEU9REZIJjRGPVBOSyY0Rz1FREomNEg9RCY0ST1WJjRKPUVESE0mNDI9Zg==';
const SOURCE_URL = process.env.CSI_SOURCE_URL ?? DEFAULT_SOURCE_URL;
const TEAM_NAME = 'Ius A';
const DEFAULT_SCHEDULE_DAY = 'Sunday';
const DEFAULT_SCHEDULE_TIME = '22:00';
const DEFAULT_SCHEDULE_TIMEZONE = 'Europe/Rome';
const rootDir = process.cwd();
const outputFile = path.join(rootDir, 'src', 'data', 'ius-a-csi.ts');
const tempOutputFile = `${outputFile}.tmp`;
const isScheduledRun = process.argv.includes('--scheduled');

const unavailableData = {
  team: TEAM_NAME,
  source_url: SOURCE_URL,
  updated_at: null,
  last_error_at: null,
  stale: false,
  overview: [],
  next_match: null,
  last_match: null,
  standings: [],
  available: false,
};

const decodeEntities = (value) =>
  value
    .replace(/&agrave;/gi, 'a')
    .replace(/&egrave;/gi, 'e')
    .replace(/&eacute;/gi, 'e')
    .replace(/&igrave;/gi, 'i')
    .replace(/&ograve;/gi, 'o')
    .replace(/&ugrave;/gi, 'u')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const textContent = (html) =>
  decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();

const numberFromText = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeTeam = (value) => textContent(value).replace(/\s+/g, ' ').trim();
const truncateResponseBody = (value) => value.replace(/\s+/g, ' ').trim().slice(0, 300);

class CsiFetchError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'CsiFetchError';
    this.details = details;
  }
}

const parseItalianDate = (date, time) => {
  const [day, month, shortYear] = date.split('/').map(Number);
  const [hours, minutes] = time.split(':').map(Number);
  const fullYear = shortYear >= 70 ? 1900 + shortYear : 2000 + shortYear;
  return new Date(fullYear, month - 1, day, hours, minutes);
};

const formatIsoDate = (date) => {
  const [day, month, shortYear] = date.split('/');
  const fullYear = Number(shortYear) >= 70 ? `19${shortYear}` : `20${shortYear}`;
  return `${fullYear}-${month}-${day}`;
};

const readExistingData = async () => {
  try {
    const content = await readFile(outputFile, 'utf8');
    const json = content.match(/export const iusACsiData = ([\s\S]*?) satisfies CsiTeamData;/)?.[1];
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
};

const getRomeScheduleParts = (date, timeZone) =>
  Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );

const isScheduledTime = () => {
  const day = process.env.CSI_UPDATE_DAY ?? DEFAULT_SCHEDULE_DAY;
  const time = process.env.CSI_UPDATE_TIME ?? DEFAULT_SCHEDULE_TIME;
  const timeZone = process.env.CSI_UPDATE_TIMEZONE ?? DEFAULT_SCHEDULE_TIMEZONE;
  const now = getRomeScheduleParts(new Date(), timeZone);
  const [scheduledHour, scheduledMinute] = time.split(':').map(Number);
  const currentHour = Number(now.hour);
  const currentMinute = Number(now.minute);

  return (
    now.weekday.toLowerCase() === day.toLowerCase() &&
    currentHour === scheduledHour &&
    currentMinute >= scheduledMinute
  );
};

async function fetchSourceHtml() {
  let response;

  try {
    const referer = new URL(SOURCE_URL).origin;

    response = await fetch(SOURCE_URL, {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7',
        referer,
      },
    });
  } catch (error) {
    throw new CsiFetchError(`CSI source request failed: ${error.message}`, {
      url: SOURCE_URL,
      cause: error,
    });
  }

  if (!response.ok) {
    const responseBody = await response.text().catch(() => '');

    throw new CsiFetchError(`CSI source responded with ${response.status}`, {
      status: response.status,
      url: SOURCE_URL,
      responseBody: truncateResponseBody(responseBody),
    });
  }

  return response.text();
}

function extractOverview(html) {
  const overviewBlock =
    html.match(/Panoramica squadra[\s\S]*?<\/div>\s*<\/div>\s*<div class="col-lg-6 mt-4">/i)?.[0] ?? '';
  const rows = [
    ...overviewBlock.matchAll(
      /<div class="col-8[^>]*><span>(.*?)<\/span><\/div>\s*<div class="col-4[^>]*><span>(.*?)<\/span><\/div>/gi,
    ),
  ];

  return rows.map((row) => ({
    label: textContent(row[1]),
    value: textContent(row[2]),
  }));
}

function extractStandings(html) {
  const tableBlock = html.match(/<div class="card" id="cardclassifica">[\s\S]*?<\/tbody>/i)?.[0] ?? '';
  const rows = tableBlock.split(/<tr\b/i).slice(1);

  return rows
    .map((row) => {
      const rank = numberFromText(row.match(/pos-col position[^>]*>\s*(\d+)/i)?.[1] ?? '');
      const teamSpans = [...row.matchAll(/<span>([^<]+)<\/span>/gi)].map((match) => normalizeTeam(match[1]));
      const team = teamSpans.at(-1) ?? '';
      const statsText = textContent(row.slice(row.lastIndexOf('</a>') + 4));
      const stats = statsText.match(/-?\d+/g)?.map(numberFromText) ?? [];

      if (!rank || !team || stats.length < 8) {
        return null;
      }

      return {
        rank,
        team,
        points: stats[0],
        played: stats[1],
        wins: stats[2],
        draws: stats[3],
        losses: stats[4],
        goals_for: stats[5],
        goals_against: stats[6],
        goal_diff: stats[7],
      };
    })
    .filter(Boolean);
}

function extractMatches(html) {
  const matchesBlock = html.match(/<div class="card" id="cardgare">[\s\S]*?<\/script>/i)?.[0] ?? '';
  const matchCards = [...matchesBlock.matchAll(/<a\b[^>]*class="btn btn-gara"[\s\S]*?<\/a>/gi)].map(
    (match) => match[0],
  );

  return matchCards
    .map((card) => {
      const date = card.match(
        /<span>\s*(\d{2}\/\d{2}\/\d{2})\s*<\/span>\s*<span[^>]*>\s*(\d{1,2}:\d{2})\s*<\/span>/i,
      );
      const teams = [...card.matchAll(/<span class="nome-squadra">([^<]+)<\/span>/gi)].map((match) =>
        normalizeTeam(match[1]),
      );
      const scoreSegment = card.slice(card.lastIndexOf('<div class="vr"></div>'));
      const scoreTokens = textContent(scoreSegment).match(/-?\d+|-/g) ?? [];

      if (!date || teams.length < 2) {
        return null;
      }

      const [homeScoreRaw, awayScoreRaw] = scoreTokens.slice(0, 2);
      const hasScore = homeScoreRaw !== '-' && awayScoreRaw !== '-' && homeScoreRaw !== undefined && awayScoreRaw !== undefined;

      return {
        date: formatIsoDate(date[1]),
        time: date[2],
        home_team: teams[0],
        away_team: teams[1],
        home_score: hasScore ? numberFromText(homeScoreRaw) : null,
        away_score: hasScore ? numberFromText(awayScoreRaw) : null,
        status: hasScore ? 'played' : 'scheduled',
        starts_at: parseItalianDate(date[1], date[2]).toISOString(),
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

function addResultForIus(match) {
  if (!match || match.home_score === null || match.away_score === null) {
    return match;
  }

  const iusScore = match.home_team === TEAM_NAME ? match.home_score : match.away_score;
  const opponentScore = match.home_team === TEAM_NAME ? match.away_score : match.home_score;
  const result = iusScore > opponentScore ? 'W' : iusScore === opponentScore ? 'D' : 'L';

  return {
    ...match,
    result_for_ius_a: result,
  };
}

function parseCsiData(html) {
  const matches = extractMatches(html);
  const now = new Date();
  const playedMatches = matches.filter((match) => match.home_score !== null && match.away_score !== null);
  const nextMatch =
    matches.find(
      (match) => new Date(match.starts_at).getTime() >= now.getTime() || match.home_score === null || match.away_score === null,
    ) ?? null;
  const lastMatch = playedMatches.at(-1) ?? null;

  return {
    team: TEAM_NAME,
    source_url: SOURCE_URL,
    updated_at: new Date().toISOString(),
    last_error_at: null,
    stale: false,
    overview: extractOverview(html),
    next_match: nextMatch,
    last_match: addResultForIus(lastMatch),
    standings: extractStandings(html),
    available: true,
  };
}

async function writeData(data) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  const fileContent = `import type { CsiTeamData } from '../types';\n\nexport const iusACsiData = ${JSON.stringify(data, null, 2)} satisfies CsiTeamData;\n`;

  await writeFile(
    tempOutputFile,
    fileContent,
    'utf8',
  );

  await rename(tempOutputFile, outputFile);
}

function logCsiError(error) {
  console.warn(`CSI data update failed: ${error.message}`);

  if (error instanceof CsiFetchError) {
    if (typeof error.details.status === 'number') {
      console.warn(`CSI response status: ${error.details.status}`);
    }

    if (error.details.url) {
      console.warn(`CSI request URL: ${error.details.url}`);
    }

    if (typeof error.details.responseBody === 'string') {
      console.warn(`CSI response body preview: ${error.details.responseBody}`);
    }
  }
}

async function main() {
  if (isScheduledRun && !isScheduledTime()) {
    console.log('CSI update skipped: outside configured Europe/Rome schedule window.');
    return;
  }

  try {
    const html = await fetchSourceHtml();
    const data = parseCsiData(html);

    if (!data.next_match && !data.last_match && data.standings.length === 0) {
      throw new Error('CSI source parsing produced no data');
    }

    await writeData(data);
    console.log(`CSI data updated successfully at ${data.updated_at}`);
  } catch (error) {
    const existingData = await readExistingData();
    const fallbackData =
      existingData ??
      {
        ...unavailableData,
        stale: true,
        last_error_at: new Date().toISOString(),
      };

    logCsiError(error);

    if (existingData) {
      console.warn('CSI fallback: keeping the last valid local snapshot unchanged.');
      return;
    }

    console.warn('CSI fallback: no existing snapshot found, writing unavailable placeholder data.');
    await writeData(fallbackData);
  }
}

await main();
