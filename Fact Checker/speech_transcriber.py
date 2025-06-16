import sys
from PyQt6.QtWidgets import (QApplication, QMainWindow, QWidget, QVBoxLayout, 
                            QHBoxLayout, QPushButton, QFileDialog, QTextEdit)
from PyQt6.QtMultimedia import QMediaPlayer
from PyQt6.QtMultimediaWidgets import QVideoWidget
from PyQt6.QtCore import Qt, QUrl, QTimer
import whisper
import datetime

class TranscriptionApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Video Transcriber")
        self.setGeometry(100, 100, 1200, 600)

        # Main widget and layout
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        layout = QHBoxLayout(main_widget)

        # Left side - Video player
        video_container = QWidget()
        video_layout = QVBoxLayout(video_container)
        
        self.video_widget = QVideoWidget()
        self.media_player = QMediaPlayer()
        self.media_player.setVideoOutput(self.video_widget)
        
        self.choose_button = QPushButton("Choose Video")
        self.choose_button.clicked.connect(self.choose_video)
        
        video_layout.addWidget(self.video_widget)
        video_layout.addWidget(self.choose_button)
        
        # Right side - Transcription
        transcription_container = QWidget()
        transcription_layout = QVBoxLayout(transcription_container)
        
        self.transcription_text = QTextEdit()
        self.transcription_text.setReadOnly(True)
        
        transcription_layout.addWidget(self.transcription_text)
        
        # Add both sides to main layout
        layout.addWidget(video_container)
        layout.addWidget(transcription_container)
        
        # Initialize Whisper model
        self.model = whisper.load_model("base")
        
        # Store transcription with timestamps
        self.transcription_segments = []
        
        # Timer for checking current playback position
        self.timer = QTimer()
        self.timer.setInterval(100)  # Check every 100ms
        self.timer.timeout.connect(self.update_highlighted_text)
        
    def choose_video(self):
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Choose Video File", "", 
            "Video Files (*.mp4 *.avi *.mkv *.mov)")
        
        if file_name:
            # Transcribe video
            result = self.model.transcribe(file_name)
            
            # Store segments with timestamps
            self.transcription_segments = result["segments"]
            
            # Display full transcription
            full_text = ""
            for segment in self.transcription_segments:
                timestamp = str(datetime.timedelta(seconds=int(segment["start"])))
                full_text += f"[{timestamp}] {segment['text']}\n"
            
            self.transcription_text.setText(full_text)
            
            # Set up video playback
            self.media_player.setSource(QUrl.fromLocalFile(file_name))
            self.media_player.play()
            self.timer.start()
    
    def update_highlighted_text(self):
        current_time = self.media_player.position() / 1000  # Convert to seconds
        
        # Find current segment
        current_segment = None
        for segment in self.transcription_segments:
            if segment["start"] <= current_time <= segment["end"]:
                current_segment = segment
                break
        
        if current_segment:
            # Create HTML with highlighted current segment
            html_text = ""
            for segment in self.transcription_segments:
                timestamp = str(datetime.timedelta(seconds=int(segment["start"])))
                if segment == current_segment:
                    html_text += f'<p style="background-color: yellow;">[{timestamp}] {segment["text"]}</p>'
                else:
                    html_text += f'<p>[{timestamp}] {segment["text"]}</p>'
            
            self.transcription_text.setHtml(html_text)

def main():
    app = QApplication(sys.argv)
    window = TranscriptionApp()
    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()