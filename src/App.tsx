import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  TextField,
  Tooltip,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { appLinks, loadSongs } from './data';
import type { Song } from './types';

const menuItems = [
  { label: 'Home', icon: HomeRoundedIcon },
  { label: 'Trending', icon: WhatshotRoundedIcon },
  { label: 'Music', icon: MusicNoteRoundedIcon },
];

function getEmbedUrl(song?: Song): string | null {
  if (!song) {
    return null;
  }

  const videoId = extractYouTubeId(song.videoUrl ?? song.sourceUrl ?? '');

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match?.[1] ?? null;
}

function placeholderForSong(song?: Song): string {
  return `https://placehold.co/640x360/111111/ffffff?text=${encodeURIComponent(song?.title ?? 'Song UI')}`;
}

function resolveCover(song?: Song): string {
  if (!song) {
    return placeholderForSong(undefined);
  }

  const videoId = extractYouTubeId(song.videoUrl ?? song.sourceUrl ?? '');
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  if (song.thumbnail && song.thumbnail.trim().length > 0) {
    return song.thumbnail;
  }

  return placeholderForSong(song);
}

function handleCoverError(event: React.SyntheticEvent<HTMLImageElement>, song?: Song) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied === '1') {
    image.src = placeholderForSong(song);
    return;
  }

  image.dataset.fallbackApplied = '1';

  if (song?.thumbnail && song.thumbnail.trim().length > 0 && image.src !== song.thumbnail) {
    image.src = song.thumbnail;
    return;
  }

  const videoId = extractYouTubeId(song?.videoUrl ?? song?.sourceUrl ?? '');
  if (videoId) {
    image.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
    return;
  }

  image.src = placeholderForSong(song);
}

function formatSongMeta(song?: Song): string {
  if (!song) {
    return '';
  }

  const parts = [song.artist];
  const album = song.album?.trim();
  const genre = song.genre?.trim();

  if (album && album.toLowerCase() !== genre?.toLowerCase()) {
    parts.push(album);
  }

  if (genre) {
    parts.push(genre);
  }

  return parts.join(' • ');
}

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        const loadedSongs = await loadSongs();

        if (!active) {
          return;
        }

        setSongs(loadedSongs);
        setSelectedSong((current) => current ?? loadedSongs[0] ?? null);
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : 'Unable to load songs.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, []);

  const filteredSongs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesSearch =
        query.length === 0 ||
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.genre.toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [deferredSearch, songs]);

  useEffect(() => {
    if (!selectedSong && filteredSongs.length > 0) {
      setSelectedSong(filteredSongs[0]);
    }
  }, [filteredSongs, selectedSong]);

  const recommendedSongs = filteredSongs.filter((song) => song.id !== selectedSong?.id).slice(0, 6);
  const embedUrl = getEmbedUrl(selectedSong ?? undefined);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="min-h-screen bg-aurora-radial">
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          <aside className="hidden w-[168px] shrink-0 border-r border-white/10 bg-black/45 px-4 py-5 lg:flex lg:flex-col">
            <div className="mb-10">
              <p className="text-[18px] font-black tracking-tight">SONG UI</p>
            </div>

            <nav className="space-y-4">
              {menuItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-1 py-2 text-left text-sm font-semibold text-white/90 transition hover:text-white"
                >
                  <Icon fontSize="small" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col px-3 pb-4 pt-3 sm:px-5 lg:px-6">
            <div className="sticky top-0 z-20 mb-4 flex justify-center bg-ink-950/45 py-1 backdrop-blur-md">
              <div className="flex w-full max-w-[520px] items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                <SearchRoundedIcon className="mr-3 text-white/70" fontSize="small" />
                <TextField
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  fullWidth
                  variant="standard"
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    '& .MuiInputBase-input': {
                      padding: 0,
                      color: 'white',
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: 'rgba(255,255,255,0.55)',
                      opacity: 1,
                    },
                  }}
                />
              </div>
            </div>

            {error ? (
              <Card className="mb-4 border border-red-500/30 bg-red-500/10 text-white">
                <CardContent>
                  <p className="font-semibold">Unable to load the API right now.</p>
                  <p className="mt-1 text-sm text-white/70">The UI is showing built-in fallback songs so the app still works on Render.</p>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.8fr)_360px]">
              <section className="space-y-4">
                <Card className="overflow-hidden rounded-[16px] border border-white/10 bg-[#151515] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
                  <CardContent className="space-y-3 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[18px] font-black leading-tight">{selectedSong?.title ?? 'Loading...'}</h2>
                        <p className="mt-1 text-xs text-white/65">
                          {selectedSong ? formatSongMeta(selectedSong) : 'Fetching the latest songs from the API'}
                        </p>
                      </div>

                      {selectedSong ? (
                        <Tooltip title="Open song source">
                          <IconButton
                            href={selectedSong.sourceUrl || selectedSong.videoUrl || appLinks.apiUrl}
                            target="_blank"
                            rel="noreferrer"
                            sx={{
                              height: 34,
                              width: 34,
                              borderRadius: '999px',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#ef4444',
                              backgroundColor: 'rgba(255,255,255,0.03)',
                            }}
                          >
                            <OpenInNewRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                    </div>

                    <div className="overflow-hidden rounded-[14px] border border-white/10 bg-black">
                      {loading ? (
                        <Skeleton variant="rectangular" height={420} animation="wave" sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                      ) : embedUrl ? (
                        <iframe
                          title={selectedSong?.title ?? 'Featured song'}
                          src={embedUrl}
                          className="aspect-video h-full w-full min-h-[360px]"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <img
                          src={resolveCover(selectedSong ?? undefined)}
                          alt={selectedSong?.title ?? 'Featured song'}
                          onError={(event) => handleCoverError(event, selectedSong ?? undefined)}
                          className="aspect-video h-full w-full min-h-[360px] object-cover"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="border-b border-white/10 pb-2">
                  <p className="text-[18px] font-black leading-none">{selectedSong?.title ?? 'No track selected'}</p>
                  <p className="mt-2 text-sm text-white/80">
                    {selectedSong ? formatSongMeta(selectedSong) : 'Search like YouTube, then click a card in Recommended to play.'}
                  </p>
                  <p className="mt-3 text-[13px] text-white/70">
                    {selectedSong ? selectedSong.description ?? 'Click a recommendation to switch the featured player.' : 'Search like YouTube, then click a card in Recommended to play.'}
                  </p>
                </div>
              </section>

              <aside className="space-y-3">
                <div className="text-[20px] font-black leading-none text-white/95">Recommended</div>

                {loading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} variant="rounded" height={240} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                    ))
                  : recommendedSongs.map((song) => (
                      <button
                        key={song.id}
                        type="button"
                        onClick={() => setSelectedSong(song)}
                        className="group w-full overflow-hidden rounded-[26px] text-left transition duration-300 hover:-translate-y-1"
                      >
                        <div className="relative overflow-hidden rounded-[26px] bg-black">
                          <img
                            src={resolveCover(song)}
                            alt={song.title}
                            onError={(event) => handleCoverError(event, song)}
                            className="h-[236px] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                          <div className="absolute inset-0 rounded-[26px] ring-1 ring-white/10" />
                        </div>

                        <div className="px-1 pb-2 pt-3">
                          <p className="text-[15px] font-black leading-tight">{song.title}</p>
                          <p className="mt-1 text-[13px] text-white/80">{song.artist}</p>
                          <p className="mt-1 text-[12px] text-white/55">
                            {formatSongMeta(song).replace(`${song.artist} • `, '')}
                          </p>
                        </div>
                      </button>
                    ))}

                <div className="pt-2 text-xs text-white/50">
                  API: <a href={appLinks.apiExampleUrl} target="_blank" rel="noreferrer">{appLinks.apiExampleUrl}</a>
                </div>
              </aside>
            </div>

            <div className="mt-2 hidden xl:block" />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
