#!/bin/bash
mkdir -p frontend/public
rm -f frontend/public/*.svg frontend/public/*.png

# Base URL for Lichess 'cburnett' set (standard Wikimedia style)
BASE_URL="https://raw.githubusercontent.com/ornicar/lila/master/public/piece/cburnett"

# White Pieces
curl -L -o frontend/public/wK.svg "$BASE_URL/wK.svg"
curl -L -o frontend/public/wQ.svg "$BASE_URL/wQ.svg"
curl -L -o frontend/public/wR.svg "$BASE_URL/wR.svg"
curl -L -o frontend/public/wB.svg "$BASE_URL/wB.svg"
curl -L -o frontend/public/wN.svg "$BASE_URL/wN.svg"
curl -L -o frontend/public/wP.svg "$BASE_URL/wP.svg"

# Black Pieces
curl -L -o frontend/public/bK.svg "$BASE_URL/bK.svg"
curl -L -o frontend/public/bQ.svg "$BASE_URL/bQ.svg"
curl -L -o frontend/public/bR.svg "$BASE_URL/bR.svg"
curl -L -o frontend/public/bB.svg "$BASE_URL/bB.svg"
curl -L -o frontend/public/bN.svg "$BASE_URL/bN.svg"
curl -L -o frontend/public/bP.svg "$BASE_URL/bP.svg"

echo "Download complete."
