"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Format time to MM:SS
  const formatTime = (timeInSeconds: number): string => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Handle drag events
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        setVideoSrc(url);
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Skip backwards 15 seconds
  const skipBackward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(videoRef.current.currentTime - 15, 0);
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Skip forward 15 seconds
  const skipForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(
        videoRef.current.currentTime + 15,
        videoRef.current.duration
      );
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const seekTime = parseFloat(e.target.value);
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Handle metadata loaded
  const handleMetadataLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Video Upload & Player</h1>
      
      <div 
        className={`w-full max-w-3xl mb-8 ${isDragging ? 'border-2 border-blue-500 border-dashed rounded-lg' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className={`flex flex-col items-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDragging ? 'bg-blue-50 dark:bg-blue-900' : ''}`}>
          <span className="mb-2 text-lg">Upload Video</span>
          <span className="text-sm text-gray-500">{isDragging ? 'Drop video here' : 'Click to browse or drag and drop'}</span>
          <input 
            type="file" 
            className="hidden" 
            accept="video/*" 
            onChange={handleFileUpload} 
          />
        </label>
      </div>

      {videoSrc ? (
        <div className="w-full max-w-3xl">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              src={videoSrc}
              className="w-full h-full"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleMetadataLoaded}
            ></video>
          </div>

          {/* Video controls */}
          <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex flex-col mb-3">
              {/* Seek bar */}
              <input
                type="range"
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-300 dark:bg-gray-600"
                min="0"
                max={duration || 100}
                step="0.01"
                value={currentTime}
                onChange={handleSeek}
              />
              
              {/* Duration counter */}
              <div className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-4">
              {/* Skip backward button */}
              <button 
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={skipBackward}
              >
                -15s
              </button>
              
              {/* Play/Pause button */}
              <button 
                className="p-4 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                onClick={togglePlayPause}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              
              {/* Skip forward button */}
              <button 
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                onClick={skipForward}
              >
                +15s
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p>Upload a video to start playback</p>
        </div>
      )}
    </div>
  );
}