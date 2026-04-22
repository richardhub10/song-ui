export type Song = {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre: string;
  year?: string;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
  sourceUrl?: string;
};

export type SongApiResponse = Song[] | { results?: Song[]; data?: Song[]; songs?: Song[] };
