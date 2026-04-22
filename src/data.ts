import type { Song, SongApiResponse } from './types';

const fallbackSongs: Song[] = [
  {
    id: 'one',
    title: 'One',
    artist: 'U2',
    album: 'Achtung Baby',
    genre: 'Rock',
    year: '1992',
    description: 'The featured track in the teacher-style layout with a strong hero card and curated recommendations.',
    thumbnail: 'https://i.ytimg.com/vi/ftjEcrrf7r0/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
    sourceUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
  },
  {
    id: 'sometimes',
    title: 'Sometimes',
    artist: 'Britney Spears',
    album: '...Baby One More Time',
    genre: 'Pop',
    year: '1999',
    description: 'A bright recommendation card with a soft cover image and concise metadata.',
    thumbnail: 'https://i.ytimg.com/vi/t0bPrt69rag/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=t0bPrt69rag',
    sourceUrl: 'https://www.youtube.com/watch?v=t0bPrt69rag',
  },
  {
    id: 'ligaya',
    title: 'Ligaya',
    artist: 'Eraserheads',
    album: 'Ultraelectromagneticpop!',
    genre: 'OPM',
    year: '1993',
    description: 'Built to keep the right rail visually dense, similar to the teacher reference.',
    thumbnail: 'https://i.ytimg.com/vi/XibB-5BPdrY/hqdefault.jpg',
    videoUrl: 'https://www.youtube.com/watch?v=XibB-5BPdrY',
    sourceUrl: 'https://www.youtube.com/watch?v=XibB-5BPdrY',
  },
];

const defaultApiUrl = 'https://song-api-rde1.onrender.com';

function extractSongs(payload: SongApiResponse | unknown): Song[] {
  if (Array.isArray(payload)) {
    return payload as Song[];
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as { results?: Song[]; data?: Song[]; songs?: Song[] };
    return candidate.results ?? candidate.data ?? candidate.songs ?? [];
  }

  return [];
}

function normalizeSong(song: Partial<Song> & Record<string, unknown>, index: number): Song {
  const id = String(song.id ?? song._id ?? song.slug ?? `${index}-${song.title ?? 'song'}`);
  const title = String(song.title ?? song.name ?? song.songTitle ?? 'Untitled Song');
  const artist = String(song.artist ?? song.singer ?? song.band ?? 'Unknown Artist');
  const genre = String(song.genre ?? song.category ?? song.style ?? 'Music');
  const album = String(song.album ?? song.record ?? song.collection ?? '').trim();
  const year = song.year ? String(song.year) : song.releaseYear ? String(song.releaseYear) : undefined;
  const description = String(song.description ?? song.summary ?? song.lyrics ?? '');
  const thumbnail = String(song.thumbnail ?? song.image ?? song.cover ?? song.artwork ?? '');
  const videoUrl = String(song.videoUrl ?? song.video ?? song.youtubeUrl ?? song.url ?? '');
  const sourceUrl = String(song.sourceUrl ?? song.link ?? song.externalUrl ?? videoUrl ?? '');

  return {
    id,
    title,
    artist,
    album: album || undefined,
    genre,
    year,
    description: description || undefined,
    thumbnail: thumbnail || undefined,
    videoUrl: videoUrl || undefined,
    sourceUrl: sourceUrl || undefined,
  };
}

function applyKnownSongFixes(song: Song): Song {
  const title = song.title.trim().toLowerCase();
  const artist = song.artist.trim().toLowerCase();

  if (title === 'one' && artist === 'u2') {
    return {
      ...song,
      album: song.album ?? 'Achtung Baby',
      thumbnail: 'https://i.ytimg.com/vi/ftjEcrrf7r0/hqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
      sourceUrl: 'https://www.youtube.com/watch?v=ftjEcrrf7r0',
    };
  }

  if (title === 'sometimes' && artist.includes('britney')) {
    return {
      ...song,
      album: song.album ?? '...Baby One More Time',
      thumbnail: 'https://i.ytimg.com/vi/t0bPrt69rag/hqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=t0bPrt69rag',
      sourceUrl: 'https://www.youtube.com/watch?v=t0bPrt69rag',
    };
  }

  if (title === 'ligaya' && artist.includes('eraserheads')) {
    return {
      ...song,
      album: song.album ?? 'Ultraelectromagneticpop!',
      thumbnail: 'https://i.ytimg.com/vi/XibB-5BPdrY/hqdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=XibB-5BPdrY',
      sourceUrl: 'https://www.youtube.com/watch?v=XibB-5BPdrY',
    };
  }

  return song;
}

function shouldExcludeSong(song: Song): boolean {
  const title = song.title.trim().toLowerCase();
  const artist = song.artist.trim().toLowerCase();
  return title === 'halo' && artist === 'beyonce';
}

export async function loadSongs(): Promise<Song[]> {
  const apiUrl = import.meta.env.VITE_API_URL || defaultApiUrl;

  try {
    const response = await fetch(apiUrl, { headers: { Accept: 'application/json' } });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as SongApiResponse;
    const songs = extractSongs(payload)
      .map((song, index) => normalizeSong(song, index))
      .map((song) => applyKnownSongFixes(song))
      .filter((song) => !shouldExcludeSong(song));

    return songs.length > 0 ? songs : fallbackSongs;
  } catch {
    return fallbackSongs;
  }
}

export const appLinks = {
  apiRepo: 'https://github.com/richardhub10/song-api',
  uiRepo: 'https://github.com/richardhub10/song-ui',
  apiUrl: defaultApiUrl,
  uiUrl: 'https://song-ui.onrender.com/',
  apiExampleUrl: 'https://song-api-rde1.onrender.com',
};
