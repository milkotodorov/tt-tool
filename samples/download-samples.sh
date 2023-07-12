#!/bin/bash

echo "Downloading samples..."
wget --quiet --show-progress -O gb0.ogg https://upload.wikimedia.org/wikipedia/commons/2/22/George_W._Bush%27s_weekly_radio_address_%28November_1%2C_2008%29.oga
wget --quiet --show-progress -O gb1.ogg https://upload.wikimedia.org/wikipedia/commons/1/1f/George_W_Bush_Columbia_FINAL.ogg
wget --quiet --show-progress -O hp0.ogg https://upload.wikimedia.org/wikipedia/en/d/d4/En.henryfphillips.ogg
wget --quiet --show-progress -O mm1.wav https://cdn.openai.com/whisper/draft-20220913a/micro-machines.wav
echo "Converting to 16-bit WAV ..."
ffmpeg -loglevel -0 -y -i gb0.ogg -ar 16000 -ac 1 -c:a pcm_s16le gb0.wav
ffmpeg -loglevel -0 -y -i gb1.ogg -ar 16000 -ac 1 -c:a pcm_s16le gb1.wav
ffmpeg -loglevel -0 -y -i hp0.ogg -ar 16000 -ac 1 -c:a pcm_s16le hp0.wav
ffmpeg -loglevel -0 -y -i mm1.wav -ar 16000 -ac 1 -c:a pcm_s16le mm0.wav
rm mm1.wav gb0.ogg gb1.ogg hp0.ogg