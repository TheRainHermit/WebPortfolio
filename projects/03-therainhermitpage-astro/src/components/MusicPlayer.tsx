import React, { useState, useRef, useEffect } from 'react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
  src: string;
}

const tracks: Track[] = [
  { id: 1, title: "Rainy Night Reverie", artist: "Artist", duration: "3:45", src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
  { id: 2, title: "Storm Code Symphony", artist: "Artist", duration: "4:12", src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
  { id: 3, title: "Midnight Pixel Waltz", artist: "Artist", duration: "3:28", src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
  { id: 4, title: "Thunderous Binary Blues", artist: "Artist", duration: "5:01", src: "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" },
];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', () => nextTrack());

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', nextTrack);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
  };

  const previousTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const selectTrack = (index: number) => {
    setCurrentTrack(index);
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value) / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="music-player">
      <audio
        ref={audioRef}
        src={tracks[currentTrack].src}
        preload="metadata"
      />
      
      <div className="player-main">
        <div className="now-playing">
          <div className="track-info">
            <h3 className="track-title">{tracks[currentTrack].title}</h3>
            <p className="track-artist">{tracks[currentTrack].artist}</p>
          </div>
          <div className="album-art">
            <div className="art-placeholder">🎵</div>
          </div>
        </div>

        <div className="player-controls">
          <div className="control-buttons">
            <button onClick={previousTrack} className="control-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19,20 9,12 19,4 19,20"></polygon>
                <line x1="5" y1="19" x2="5" y2="5"></line>
              </svg>
            </button>
            <button onClick={togglePlay} className="play-btn">
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5,3 19,12 5,21 5,3"></polygon>
                </svg>
              )}
            </button>
            <button onClick={nextTrack} className="control-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5,4 15,12 5,20 5,4"></polygon>
                <line x1="19" y1="5" x2="19" y2="19"></line>
              </svg>
            </button>
          </div>

          <div className="progress-section">
            <span className="time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="progress-bar"
            />
            <span className="time">{formatTime(duration)}</span>
          </div>

          <div className="volume-section">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="volume-bar"
            />
          </div>
        </div>
      </div>

      <div className="playlist">
        <h4 className="playlist-title">Rainy Night Playlist</h4>
        <div className="track-list">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              className={`track-item ${index === currentTrack ? 'active' : ''}`}
              onClick={() => selectTrack(index)}
            >
              <div className="track-number">{index + 1}</div>
              <div className="track-details">
                <div className="track-name">{track.title}</div>
                <div className="track-duration">{track.duration}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .music-player {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid var(--glass-border);
        }

        .player-main {
          margin-bottom: 32px;
        }

        .now-playing {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .track-info {
          flex: 1;
        }

        .track-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 4px;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .track-artist {
          color: #cbd5e1;
          font-size: 1rem;
        }

        .album-art {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .player-controls {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .control-buttons {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .control-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(148, 163, 184, 0.1);
          color: #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .control-btn:hover {
          background: rgba(148, 163, 184, 0.2);
          color: #f1f5f9;
          transform: scale(1.05);
        }

        .play-btn {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .play-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 30px rgba(0, 0, 0, 0.4);
        }

        .progress-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .time {
          font-size: 0.875rem;
          color: #94a3b8;
          font-weight: 500;
          min-width: 40px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          appearance: none;
          cursor: pointer;
        }

        .progress-bar::-webkit-slider-thumb {
          width: 16px;
          height: 16px;
          background: var(--color-accent);
          border-radius: 50%;
          appearance: none;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(148, 163, 184, 0.3);
        }

        .volume-section {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          color: #94a3b8;
        }

        .volume-bar {
          width: 100px;
          height: 4px;
          background: rgba(148, 163, 184, 0.2);
          border-radius: 2px;
          appearance: none;
          cursor: pointer;
        }

        .volume-bar::-webkit-slider-thumb {
          width: 12px;
          height: 12px;
          background: var(--color-accent);
          border-radius: 50%;
          appearance: none;
          cursor: pointer;
        }

        .playlist {
          border-top: 1px solid var(--glass-border);
          padding-top: 24px;
        }

        .playlist-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #f1f5f9;
          margin-bottom: 16px;
        }

        .track-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .track-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid transparent;
        }

        .track-item:hover {
          background: rgba(148, 163, 184, 0.1);
          border-color: rgba(148, 163, 184, 0.2);
        }

        .track-item.active {
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          color: white;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .track-number {
          width: 24px;
          text-align: center;
          font-weight: 500;
          color: #94a3b8;
        }

        .track-item.active .track-number {
          color: white;
        }

        .track-details {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .track-name {
          font-weight: 500;
          color: #e2e8f0;
        }

        .track-item.active .track-name {
          color: white;
        }

        .track-duration {
          font-size: 0.875rem;
          opacity: 0.7;
          color: #94a3b8;
        }

        .track-item.active .track-duration {
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .music-player {
            padding: 16px;
          }

          .now-playing {
            flex-direction: column;
            text-align: center;
          }

          .volume-section {
            display: none;
          }

          .progress-section {
            flex-direction: column;
            gap: 8px;
          }

          .progress-bar {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}