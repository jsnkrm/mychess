#!/bin/bash
mkdir -p frontend/public

# White Pieces
curl -L -o frontend/public/K.png https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Chess_klt45.svg/320px-Chess_klt45.svg.png
curl -L -o frontend/public/Q.png https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Chess_qlt45.svg/320px-Chess_qlt45.svg.png
curl -L -o frontend/public/R.png https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Chess_rlt45.svg/320px-Chess_rlt45.svg.png
curl -L -o frontend/public/B.png https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Chess_blt45.svg/320px-Chess_blt45.svg.png
curl -L -o frontend/public/N.png https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Chess_nlt45.svg/320px-Chess_nlt45.svg.png
curl -L -o frontend/public/P.png https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Chess_plt45.svg/320px-Chess_plt45.svg.png

# Black Pieces
curl -L -o frontend/public/k.png https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Chess_kdt45.svg/320px-Chess_kdt45.svg.png
curl -L -o frontend/public/q.png https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Chess_qdt45.svg/320px-Chess_qdt45.svg.png
curl -L -o frontend/public/r.png https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Chess_rdt45.svg/320px-Chess_rdt45.svg.png
curl -L -o frontend/public/b.png https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Chess_bdt45.svg/320px-Chess_bdt45.svg.png
curl -L -o frontend/public/n.png https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Chess_ndt45.svg/320px-Chess_ndt45.svg.png
curl -L -o frontend/public/p.png https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Chess_pdt45.svg/320px-Chess_pdt45.svg.png

echo "Download complete."
