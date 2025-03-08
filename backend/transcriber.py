import os
import subprocess
# import ssl
# ssl._create_default_https_context = ssl._create_unverified_context
whisper_directory = "/Users/adiprabs/Coding/theliedetector/backend/whisper.cpp"
whisper_cli_shorcut = "/Users/adiprabs/Coding/theliedetector/backend/whisper.cpp/build/bin/whisper-cli"

def transcribe_to_srt(audio_file_path: str, output_dir: str, model_label: str = "base"):
  # Verify if the audio file exists
  if not os.path.isfile(audio_file_path):
    print(f"Error: Audio file '{audio_file_path}' does not exist.")
    return
  
  # Verify if the output directory exists
  if not os.path.isdir(output_dir):
    print(f"Error: Output directory '{output_dir}' does not exist.")
    return
  
  base_filename = os.path.basename(audio_file_path)
  srt_filename = os.path.splitext(base_filename)[0]
  output_filename = f"{output_dir}/{srt_filename}"
  print(f"saving at {output_filename}")
  # Using the provided parameters instead of hardcoded paths
  # Run the transcription command as a subprocess
  transcription_command = f"{whisper_cli_shorcut} -m /Users/adiprabs/Coding/theliedetector/backend/whisper.cpp/models/ggml-{model_label}.bin -f {audio_file_path} -osrt -of {output_filename}"
  try:
    result = subprocess.run(transcription_command, shell=True, check=True, text=True, capture_output=True)
    print("Subprocess stdout:")
    print(result.stdout)
    print("successfully created srt file")
    # Get the base filename from the audio file path and replace extension with .srt
    base_filename = os.path.basename(audio_file_path)
    # Combine output directory with the srt filename
    srt_path = os.path.join(output_dir, srt_filename)
    return srt_path
  except subprocess.CalledProcessError as e:
    print(f"Error during transcription: {e}")
    print(f"Command output: {e.stderr}")

print(transcribe_to_srt("/Users/adiprabs/Coding/theliedetector/backend/testfiles_audio/Trash.mp3", "/Users/adiprabs/Coding/theliedetector/backend/testfiles_srt"))

  

