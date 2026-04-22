import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Link,
  Skeleton,
  TextField,
  Tooltip,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import WhatshotRoundedIcon from '@mui/icons-material/WhatshotRounded';
import MusicNoteRoundedIcon from '@mui/icons-material/MusicNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
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

  const url = song.videoUrl ?? song.sourceUrl ?? '';
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  const videoId = match?.[1];

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

function resolveCover(song?: Song): string {
  return (
    song?.thumbnail ??
    `https://placehold.co/640x360/111111/ffffff?text=${encodeURIComponent(song?.title ?? 'Song UI')}`
  );
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

  const genres = useMemo(() => {
    const values = new Set(songs.map((song) => song.genre).filter(Boolean));
    return ['All', ...Array.from(values)];
  }, [songs]);

  const [activeGenre, setActiveGenre] = useState('All');

  const filteredSongs = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return songs.filter((song) => {
      const matchesGenre = activeGenre === 'All' || song.genre === activeGenre;
      const matchesSearch =
        query.length === 0 ||
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.genre.toLowerCase().includes(query);

      return matchesGenre && matchesSearch;
    });
  }, [activeGenre, deferredSearch, songs]);

  useEffect(() => {
    if (!selectedSong && filteredSongs.length > 0) {
      setSelectedSong(filteredSongs[0]);
    }
  }, [filteredSongs, selectedSong]);

  const recommendedSongs = filteredSongs.filter((song) => song.id !== selectedSong?.id).slice(0, 6);
  const embedUrl = getEmbedUrl(selectedSong ?? undefined);

  return (
    <div className="min-h-screen bg-ink-950 text-white">
      <div className="bg-aurora-radial min-h-screen">
        <div className="mx-auto flex min-h-screen max-w-[1600px]">
          <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-black/35 px-5 py-6 lg:block">
            <div className="mb-10">
              <p className="text-2xl font-black tracking-tight">SONG UI</p>
              <p className="mt-2 text-xs uppercase tracking-[0.35em] text-white/45">React / Tailwind / MUI</p>
            </div>

            <nav className="space-y-3">
              {menuItems.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-white/85 transition hover:bg-white/8 hover:text-white"
                >
                  <Icon fontSize="small" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm font-semibold">Project links</p>
              <div className="mt-3 space-y-2 text-sm text-white/70">
                <Link href={appLinks.apiRepo} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                  API repo
                </Link>
                <br />
                <Link href={appLinks.uiRepo} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                  UI repo
                </Link>
                <br />
                <Link href={appLinks.apiExampleUrl} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                  API example
                </Link>
              </div>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8">
            <header className="sticky top-0 z-20 mb-4 rounded-[28px] border border-white/10 bg-black/50 px-4 py-3 shadow-neon backdrop-blur-xl sm:px-6">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/45">Music library</p>
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Song browsing for the full-stack Render deploy</h1>
                </div>

                <div className="flex w-full items-center gap-3 xl:max-w-2xl">
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search songs, artists, genres"
                    fullWidth
                    size="small"
                    InputProps={{
                      startAdornment: <SearchRoundedIcon className="mr-2 text-white/50" fontSize="small" />,
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '999px',
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.04)',
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.12)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255,255,255,0.3)',
                      },
                    }}
                  />
                  <Button
                    variant="outlined"
                    href={appLinks.uiRepo}
                    target="_blank"
                    rel="noreferrer"
                    startIcon={<OpenInNewRoundedIcon />}
                    sx={{
                      borderRadius: '999px',
                      color: 'white',
                      borderColor: 'rgba(255,255,255,0.14)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Repo
                  </Button>
                </div>
              </div>
            </header>

            <section className="mb-4 flex flex-wrap gap-2">
              {genres.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  onClick={() => setActiveGenre(genre)}
                  variant={activeGenre === genre ? 'filled' : 'outlined'}
                  color={activeGenre === genre ? 'error' : 'default'}
                  sx={{
                    borderRadius: '999px',
                    color: activeGenre === genre ? 'white' : 'rgba(255,255,255,0.85)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    backgroundColor: activeGenre === genre ? '#ef4444' : 'rgba(255,255,255,0.04)',
                    '&:hover': {
                      backgroundColor: activeGenre === genre ? '#dc2626' : 'rgba(255,255,255,0.08)',
                    },
                  }}
                />
              ))}
            </section>

            {error ? (
              <Card className="mb-4 border border-red-500/30 bg-red-500/10 text-white">
                <CardContent>
                  <p className="font-semibold">Unable to load the API right now.</p>
                  <p className="mt-1 text-sm text-white/70">The UI is showing built-in fallback songs so the app still works on Render.</p>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.7fr_0.9fr]">
              <section className="space-y-4">
                <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-black/50 text-white shadow-neon">
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Featured track</p>
                        <h2 className="mt-2 text-2xl font-black">{selectedSong?.title ?? 'Loading...'}</h2>
                        <p className="mt-1 text-sm text-white/70">
                          {selectedSong ? `${selectedSong.artist} · ${selectedSong.genre}${selectedSong.year ? ` · ${selectedSong.year}` : ''}` : 'Fetching the latest songs from the API'}
                        </p>
                      </div>

                      {selectedSong ? (
                        <Tooltip title="Open song source">
                          <IconButton
                            href={selectedSong.sourceUrl || selectedSong.videoUrl || appLinks.apiUrl}
                            target="_blank"
                            rel="noreferrer"
                            sx={{
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

                    <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black">
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
                          className="aspect-video h-full w-full min-h-[360px] object-cover"
                        />
                      )}
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                      <div>
                        <p className="text-lg font-bold">{selectedSong?.title ?? 'No track selected'}</p>
                        <p className="text-sm text-white/70">
                          {selectedSong ? selectedSong.description ?? 'Search the API and click a recommendation to switch the hero video.' : 'Try another song after the load completes.'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="contained"
                          startIcon={<PlayArrowRoundedIcon />}
                          href={selectedSong?.videoUrl || appLinks.apiUrl}
                          target="_blank"
                          rel="noreferrer"
                          sx={{ borderRadius: '999px', backgroundColor: '#ef4444' }}
                        >
                          Play
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<FavoriteBorderRoundedIcon />}
                          sx={{ borderRadius: '999px', color: 'white', borderColor: 'rgba(255,255,255,0.14)' }}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-white/10 bg-white/5 text-white shadow-neon">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Library</p>
                        <h3 className="mt-1 text-xl font-bold">All matched songs</h3>
                      </div>
                      <p className="text-sm text-white/60">{filteredSongs.length} tracks</p>
                    </div>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {loading
                        ? Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} variant="rounded" height={160} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                          ))
                        : filteredSongs.map((song) => {
                            const isActive = song.id === selectedSong?.id;

                            return (
                              <button
                                key={song.id}
                                type="button"
                                onClick={() => setSelectedSong(song)}
                                className={`group overflow-hidden rounded-[24px] border text-left transition duration-300 ${
                                  isActive
                                    ? 'border-red-400/60 bg-white/10 shadow-[0_0_0_1px_rgba(239,68,68,0.35)]'
                                    : 'border-white/10 bg-black/35 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8'
                                }`}
                              >
                                <div className="relative h-40 overflow-hidden bg-black">
                                  <img
                                    src={resolveCover(song)}
                                    alt={song.title}
                                    className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                  <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80">
                                    {song.genre}
                                  </div>
                                </div>
                                <div className="space-y-1 p-4">
                                  <p className="text-base font-bold leading-tight">{song.title}</p>
                                  <div className="flex items-center gap-2 text-xs text-white/65">
                                    <Avatar sx={{ width: 20, height: 20, bgcolor: '#ef4444', fontSize: 11 }}>
                                      {song.artist.charAt(0)}
                                    </Avatar>
                                    <span>{song.artist}</span>
                                    {song.year ? <span>• {song.year}</span> : null}
                                  </div>
                                  <p className="line-clamp-2 text-sm text-white/60">
                                    {song.description ?? 'Click to make this the featured song in the hero player.'}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                    </div>
                  </CardContent>
                </Card>
              </section>

              <aside className="space-y-4">
                <Card className="rounded-[28px] border border-white/10 bg-black/50 text-white shadow-neon">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Recommended</p>
                        <h3 className="mt-1 text-xl font-bold">Teacher-style rail</h3>
                      </div>
                      <Chip label="Live" size="small" sx={{ color: 'white', backgroundColor: '#ef4444' }} />
                    </div>

                    <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.08)' }} />

                    <div className="space-y-4">
                      {loading
                        ? Array.from({ length: 3 }).map((_, index) => (
                            <Skeleton key={index} variant="rounded" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.05)' }} />
                          ))
                        : recommendedSongs.map((song) => (
                            <button
                              key={song.id}
                              type="button"
                              onClick={() => setSelectedSong(song)}
                              className="group w-full overflow-hidden rounded-[28px] border border-white/10 bg-black/35 text-left transition hover:-translate-y-1 hover:border-red-400/40 hover:bg-white/8"
                            >
                              <div className="relative h-56 overflow-hidden bg-black">
                                <img
                                  src={resolveCover(song)}
                                  alt={song.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                                <div className="absolute right-3 top-3 rounded-full border border-white/15 bg-black/65 p-2 text-red-400">
                                  <PlayArrowRoundedIcon fontSize="small" />
                                </div>
                              </div>
                              <div className="space-y-1 p-4">
                                <p className="text-lg font-bold">{song.title}</p>
                                <p className="text-sm text-white/75">{song.artist}</p>
                                <p className="text-xs text-white/55">{song.genre}{song.year ? ` • ${song.year}` : ''}</p>
                              </div>
                            </button>
                          ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border border-white/10 bg-white/5 text-white shadow-neon">
                  <CardContent className="p-4 sm:p-6">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Deploy notes</p>
                    <h3 className="mt-1 text-xl font-bold">Render-ready frontend</h3>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      This app points at the backend API by default and can be deployed as a static site on Render.
                      If the live API is unreachable, it falls back to built-in data so the UI stays usable.
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-white/70">
                      <p>
                        API URL: <Link href={appLinks.apiExampleUrl} target="_blank" rel="noreferrer" color="inherit" underline="hover">{appLinks.apiExampleUrl}</Link>
                      </p>
                      <p>
                        UI URL: <Link href={appLinks.uiUrl} target="_blank" rel="noreferrer" color="inherit" underline="hover">{appLinks.uiUrl}</Link>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
