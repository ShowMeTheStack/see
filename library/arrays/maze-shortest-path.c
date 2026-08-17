/*
 * title: Shortest path through a maze
 * level: 4
 * about: Solves a text maze with breadth-first search, using plain arrays as the queue and the distance map, then traces the path back.
 */
#include <stdio.h>
#include <string.h>

#define H 9
#define W 15

int main(void)
{
    const char *start[H] = {
        "###############",
        "#S..#.........#",
        "#.#.#.#####.#.#",
        "#.#...#...#.#.#",
        "#.#####.#.#.#.#",
        "#.....#.#...#.#",
        "#####.#.#####.#",
        "#.......#....E#",
        "###############"
    };
    char maze[H][W + 1];
    int dist[H][W];        /* steps from S, or -1 if not reached yet */
    int qr[H * W], qc[H * W];   /* the queue: a row array and a column array */
    int head = 0, tail = 0;
    int dr[4] = { -1, 1, 0, 0 };
    int dc[4] = { 0, 0, -1, 1 };
    int r, c, k, nr, nc, sr = 0, sc = 0, er = 0, ec = 0;

    for (r = 0; r < H; r++) {
        strcpy(maze[r], start[r]);
        for (c = 0; c < W; c++) {
            dist[r][c] = -1;
            if (maze[r][c] == 'S') { sr = r; sc = c; }
            if (maze[r][c] == 'E') { er = r; ec = c; }
        }
    }

    /* Breadth-first: cells leave the queue in order of distance, so the
       first time a cell is reached is by a shortest route. Every cell is
       queued at most once, so H*W slots are always enough. */
    dist[sr][sc] = 0;
    qr[tail] = sr; qc[tail] = sc; tail++;
    while (head < tail) {
        r = qr[head]; c = qc[head]; head++;
        if (r == er && c == ec)
            break;
        for (k = 0; k < 4; k++) {
            nr = r + dr[k];
            nc = c + dc[k];
            /* The outer wall of # keeps nr and nc inside the array. */
            if (maze[nr][nc] != '#' && dist[nr][nc] < 0) {
                dist[nr][nc] = dist[r][c] + 1;
                qr[tail] = nr; qc[tail] = nc; tail++;
            }
        }
    }

    if (dist[er][ec] < 0) {
        printf("no way out\n");
        return 0;
    }
    printf("shortest path: %d steps (%d cells explored)\n", dist[er][ec], head);

    /* Walk back from E: from any cell at distance d, some neighbour has
       distance d-1. Following those downhill always leads to S. */
    r = er; c = ec;
    while (dist[r][c] > 1) {
        for (k = 0; k < 4; k++) {
            nr = r + dr[k];
            nc = c + dc[k];
            if (dist[nr][nc] == dist[r][c] - 1)
                break;
        }
        r = nr; c = nc;
        maze[r][c] = '*';
    }
    for (r = 0; r < H; r++)
        printf("%s\n", maze[r]);
    return 0;
}
