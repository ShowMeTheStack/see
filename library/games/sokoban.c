/*
 * title: Sokoban, pushing boxes onto targets
 * level: 4
 * about: Pushes boxes around a warehouse from w/a/s/d moves, keeping walls and targets in one layer and boxes and the player in another, with an undo stack.
 * input: ddud\naawdwa\n
 */
#include <stdio.h>
#include <string.h>

#define ROWS 6
#define COLS 7
#define MAXUNDO 64

/* The level as printable rows: # wall, . target, $ box, @ player. */
static const char *level[ROWS] = {
    "#######",
    "#.  # #",
    "# $   #",
    "#  @$.#",
    "#     #",
    "#######"
};

/* Two layers: ground never changes (walls, targets, plain floor), while
   boxes changes as you push. Keeping them apart means a box can slide
   over a target and leave the target intact underneath. */
static char ground[ROWS][COLS];
static char boxes[ROWS][COLS];
static int pr, pc;              /* the player */

/* One saved state per move, for undo. A struct can be copied whole with
   =, arrays inside it included. */
struct snapshot {
    char boxes[ROWS][COLS];
    int pr, pc;
};
static struct snapshot history[MAXUNDO];
static int saved = 0;

static void load(void)
{
    int r, c;
    char ch;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++) {
            ch = level[r][c];
            ground[r][c] = (char)(ch == '#' ? '#' : ch == '.' ? '.' : ' ');
            boxes[r][c] = ch == '$';
            if (ch == '@') {
                pr = r;
                pc = c;
            }
        }
}

static void show(void)
{
    int r, c;

    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            if (r == pr && c == pc)
                putchar('@');
            else if (boxes[r][c])
                putchar(ground[r][c] == '.' ? '*' : '$');   /* * = box on target */
            else
                putchar(ground[r][c]);
        }
        putchar('\n');
    }
}

static int boxes_left(void)
{
    int r, c, n = 0;

    for (r = 0; r < ROWS; r++)
        for (c = 0; c < COLS; c++)
            if (boxes[r][c] && ground[r][c] != '.')
                n++;
    return n;
}

static void save(void)
{
    if (saved == MAXUNDO) {         /* full: forget the oldest */
        memmove(history, history + 1, (MAXUNDO - 1) * sizeof history[0]);
        saved--;
    }
    memcpy(history[saved].boxes, boxes, sizeof boxes);
    history[saved].pr = pr;
    history[saved].pc = pc;
    saved++;
}

/* Returns 1 if the player moved. */
static int step(int dr, int dc)
{
    int r1 = pr + dr, c1 = pc + dc;         /* where the player goes */
    int r2 = r1 + dr, c2 = c1 + dc;         /* where a pushed box goes */

    if (ground[r1][c1] == '#')
        return 0;
    if (boxes[r1][c1]) {
        /* A box moves only into free floor: not a wall, not another box. */
        if (ground[r2][c2] == '#' || boxes[r2][c2])
            return 0;
        save();
        boxes[r2][c2] = 1;
        boxes[r1][c1] = 0;
    } else {
        save();
    }
    pr = r1;
    pc = c1;
    return 1;
}

int main(void)
{
    char line[64];
    int i, moves = 0, ok;

    load();
    show();
    while (boxes_left() > 0 && fgets(line, sizeof line, stdin) != NULL) {
        for (i = 0; line[i] != '\0' && line[i] != '\n' && boxes_left() > 0; i++) {
            switch (line[i]) {
            case 'w': ok = step(-1, 0); break;
            case 's': ok = step(1, 0); break;
            case 'a': ok = step(0, -1); break;
            case 'd': ok = step(0, 1); break;
            case 'u':
                if (saved > 0) {
                    saved--;
                    memcpy(boxes, history[saved].boxes, sizeof boxes);
                    pr = history[saved].pr;
                    pc = history[saved].pc;
                    moves--;
                    printf("undo\n");
                    show();
                }
                continue;
            default:
                continue;
            }
            if (ok) {
                moves++;
                printf("%c\n", line[i]);
                show();
            } else {
                printf("%c: bump\n", line[i]);
            }
        }
    }
    if (boxes_left() == 0)
        printf("All boxes on targets in %d moves!\n", moves);
    else
        printf("%d boxes still to place.\n", boxes_left());
    return 0;
}
