#!/bin/bash

# Remove old /home/o11 entries from /etc/fstab
sed -i '/home\/o11/d' /etc/fstab
sleep 2

# Append new tmpfs entries to /etc/fstab
cat <<EOL >> /etc/fstab

tmpfs /home/o11/hls tmpfs defaults,noatime,nosuid,nodev,noexec,mode=1777,size=70% 0 0
tmpfs /home/o11/dl tmpfs defaults,noatime,nosuid,nodev,noexec,mode=1777,size=70% 0 0
EOL

# Mount all entries in /etc/fstab
mount -av

# Infinite loop to check if o11 is running
while true; do
  if ! pgrep "o11v4" > /dev/null; then
    # Start the o11 process
    /home/o11/o11v4 -p 8484 -noramfs -f /usr/local/bin/ffmpeg -path "/home/o11/" -noautostart -plstreamname "%s [%p]" &
    
    # Wait before checking again to give the process time to start
    sleep 10
  fi
  
  # Wait before checking again
  sleep 20
done
