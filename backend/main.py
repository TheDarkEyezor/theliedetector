import subprocess
import os

def get_audio_file(input_filepath: str, output_dir: str):
  
  if not os.path.isfile(input_filepath):
    print(f"Error: Audio file '{input_filepath}' does not exist.")
    return
  
  # Verify if the output directory exists
  if not os.path.isdir(output_dir):
    print(f"Error: Output directory '{output_dir}' does not exist.")
    return
  
  base_filename = os.path.basename(input_filepath)
  mp3_filename = os.path.splitext(base_filename)[0] + ".mp3"
  output_filename = os.path.join(output_dir, mp3_filename)
  
  # Fixed command - removed curly braces around output_filename
  subprocess.run(["ffmpeg", "-i", input_filepath, "-q:a", "0", "-map", "a", output_filename])
  
  return output_filename


if __name__ == "__main__":
  get_audio_file("/Users/adiprabs/Coding/theliedetector/backend/testfiles_video/Trash.mp4", "/Users/adiprabs/Coding/theliedetector/backend/testfiles_audio/")