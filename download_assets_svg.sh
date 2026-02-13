#!/bin/bash
mkdir -p frontend/public

# Remove old PNG files if they exist
rm -f frontend/public/*.png

# White Pieces
curl -L -o frontend/public/K.svg https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg
curl -L -o frontend/public/Q.svg https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg
curl -L -o frontend/public/R.svg https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg
curl -L -o frontend/public/B.svg https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg
curl -L -o frontend/public/N.svg https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg
curl -L -o frontend/public/P.svg https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg

# Black Pieces
curl -L -o frontend/public/k.svg https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg
curl -L -o frontend/public/q.svg https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg
curl -L -o frontend/public/r.svg https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg
curl -L -o frontend/public/b.svg https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg
curl -L -o frontend/public/n.svg https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg
curl -L -o frontend/public/p.svg https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg

echo "Download complete."
