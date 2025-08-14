import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Song {
  id: number;
  title: string;
  artistName: string;
  albumTitle?: string;
  albumId?: number;
  mp3Url?: string;
  mp4Url?: string; // Video support
  wavUrl?: string; // High-quality audio
  flacUrl?: string; // Lossless audio
  coverArtUrl?: string;
  price?: number;
  isFree: boolean;
  durationSeconds?: number;
  previewStartSeconds: number;
  previewDuration: number;
  isPaid?: boolean;
  trackNumber?: number;
  merchandiseIds?: number[]; // Associated merchandise for upselling
  fileType?: 'audio' | 'video' | 'document';
}

interface MediaPlayerContextType {
  currentSong: Song | null;
  playlist: Song[];
  currentAlbum: Album | null;
  isVisible: boolean;
  isAlbumMode: boolean;
  currentTrackIndex: number;
  playbackMode: 'single' | 'album' | 'playlist';
  repeatMode: 'none' | 'one' | 'all';
  shuffleEnabled: boolean;
  setCurrentSong: (song: Song | null) => void;
  setPlaylist: (songs: Song[]) => void;
  setCurrentAlbum: (album: Album | null) => void;
  playAlbum: (album: Album, startTrackIndex?: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToPlaylist: (song: Song) => void;
  removeFromPlaylist: (songId: number) => void;
  clearPlaylist: () => void;
  showPlayer: () => void;
  hidePlayer: () => void;
  togglePlayerVisibility: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  getMerchandiseForCurrentSong: () => number[];
}

interface Album {
  id: number;
  title: string;
  artistName: string;
  coverArtUrl?: string;
  songs: Song[];
  price?: number;
  isFree: boolean;
  merchandiseIds?: number[];
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export const useMediaPlayer = () => {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
};

interface MediaPlayerProviderProps {
  children: ReactNode;
}

export const MediaPlayerProvider: React.FC<MediaPlayerProviderProps> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isAlbumMode, setIsAlbumMode] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playbackMode, setPlaybackMode] = useState<'single' | 'album' | 'playlist'>('single');
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleEnabled, setShuffleEnabled] = useState(false);

  const addToPlaylist = (song: Song) => {
    setPlaylist(prev => {
      const exists = prev.find(s => s.id === song.id);
      if (exists) return prev;
      return [...prev, song];
    });
  };

  const removeFromPlaylist = (songId: number) => {
    setPlaylist(prev => prev.filter(song => song.id !== songId));
  };

  const clearPlaylist = () => {
    setPlaylist([]);
  };

  const showPlayer = () => {
    setIsVisible(true);
  };

  const hidePlayer = () => {
    setIsVisible(false);
  };

  const togglePlayerVisibility = () => {
    setIsVisible(prev => !prev);
  };

  const toggleShuffle = () => {
    setShuffleEnabled(prev => !prev);
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'none') return 'all';
      if (prev === 'all') return 'one';
      return 'none';
    });
  };

  const playAlbum = (album: Album, startTrackIndex: number = 0) => {
    setCurrentAlbum(album);
    setPlaylist(album.songs);
    setCurrentTrackIndex(startTrackIndex);
    setCurrentSong(album.songs[startTrackIndex] || null);
    setIsAlbumMode(true);
    setPlaybackMode('album');
    showPlayer();
  };

  const nextTrack = () => {
    if (!currentAlbum || !isAlbumMode) return;
    
    const nextIndex = currentTrackIndex + 1;
    if (nextIndex < currentAlbum.songs.length) {
      setCurrentTrackIndex(nextIndex);
      setCurrentSong(currentAlbum.songs[nextIndex]);
    } else if (repeatMode === 'all') {
      setCurrentTrackIndex(0);
      setCurrentSong(currentAlbum.songs[0]);
    }
  };

  const previousTrack = () => {
    if (!currentAlbum || !isAlbumMode) return;
    
    const prevIndex = currentTrackIndex - 1;
    if (prevIndex >= 0) {
      setCurrentTrackIndex(prevIndex);
      setCurrentSong(currentAlbum.songs[prevIndex]);
    } else if (repeatMode === 'all') {
      const lastIndex = currentAlbum.songs.length - 1;
      setCurrentTrackIndex(lastIndex);
      setCurrentSong(currentAlbum.songs[lastIndex]);
    }
  };

  const getMerchandiseForCurrentSong = (): number[] => {
    if (!currentSong) return [];
    
    // Combine song-specific and album-wide merchandise
    const songMerch = currentSong.merchandiseIds || [];
    const albumMerch = currentAlbum?.merchandiseIds || [];
    
    return [...new Set([...songMerch, ...albumMerch])];
  };

  // Auto-show player when a song is set
  const handleSetCurrentSong = (song: Song | null) => {
    setCurrentSong(song);
    if (song) {
      showPlayer();
      if (!isAlbumMode) {
        addToPlaylist(song);
        setPlaybackMode('single');
      }
    }
  };

  const value: MediaPlayerContextType = {
    currentSong,
    playlist,
    currentAlbum,
    isVisible,
    isAlbumMode,
    currentTrackIndex,
    playbackMode,
    repeatMode,
    shuffleEnabled,
    setCurrentSong: handleSetCurrentSong,
    setPlaylist,
    setCurrentAlbum,
    playAlbum,
    nextTrack,
    previousTrack,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    showPlayer,
    hidePlayer,
    togglePlayerVisibility,
    toggleShuffle,
    toggleRepeat,
    getMerchandiseForCurrentSong,
  };

  return (
    <MediaPlayerContext.Provider value={value}>
      {children}
    </MediaPlayerContext.Provider>
  );
};