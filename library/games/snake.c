/*
 * title: Snake as a linked list on the heap
 * level: 3
 * about: Moves a snake around an 8x8 grid from a string of w/a/s/d steps; the body is a linked list where each step adds a new head node and frees the tail unless food was eaten.
 * input: waassdddwdddssssaaaawds\n
 */
#include <stdio.h>
#include <stdlib.h>

#define W 8
#define H 8

struct seg {
    int x, y;
    struct seg *next;       /* towards the tail */
};

static struct seg *head = NULL;
static int food_x, food_y;

static int on_snake(int x, int y)
{
    struct seg *s;

    for (s = head; s != NULL; s = s->next)
        if (s->x == x && s->y == y)
            return 1;
    return 0;
}

static void place_food(void)
{
    do {
        food_x = rand() % W;
        food_y = rand() % H;
    } while (on_snake(food_x, food_y));
}

static void push_head(int x, int y)
{
    struct seg *s = malloc(sizeof *s);

    if (s == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    s->x = x;
    s->y = y;
    s->next = head;         /* the old head becomes the second segment */
    head = s;
}

/* Remove the last node. With a singly linked list we have to walk to the
   one before it - fine for a short snake. */
static void drop_tail(void)
{
    struct seg **pp = &head;

    while ((*pp)->next != NULL)
        pp = &(*pp)->next;
    free(*pp);
    *pp = NULL;
}

static void show(void)
{
    int x, y;
    struct seg *s;
    char grid[H][W];

    for (y = 0; y < H; y++)
        for (x = 0; x < W; x++)
            grid[y][x] = '.';
    grid[food_y][food_x] = '*';
    for (s = head; s != NULL; s = s->next)
        grid[s->y][s->x] = 'o';
    grid[head->y][head->x] = '@';
    for (y = 0; y < H; y++) {
        for (x = 0; x < W; x++)
            putchar(grid[y][x]);
        putchar('\n');
    }
}

int main(void)
{
    char moves[128];
    int i, nx, ny, length = 3, eaten = 0;
    struct seg *s;

    srand(8);
    /* Start as three segments in a row, head on the right. */
    push_head(1, 1);
    push_head(2, 1);
    push_head(3, 1);
    place_food();
    show();

    if (scanf("%127s", moves) != 1)
        moves[0] = '\0';

    for (i = 0; moves[i] != '\0'; i++) {
        nx = head->x;
        ny = head->y;
        switch (moves[i]) {
        case 'w': ny--; break;
        case 's': ny++; break;
        case 'a': nx--; break;
        case 'd': nx++; break;
        default: continue;
        }
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) {
            printf("step %d: crashed into the wall\n", i + 1);
            break;
        }
        /* Moving onto the tail square is allowed (it moves away), so
           drop the tail first unless we are about to eat. */
        if (!(nx == food_x && ny == food_y))
            drop_tail();
        if (on_snake(nx, ny)) {
            printf("step %d: bit its own tail\n", i + 1);
            break;
        }
        push_head(nx, ny);
        if (nx == food_x && ny == food_y) {
            length++;
            eaten++;
            printf("step %d: yum! length %d\n", i + 1, length);
            place_food();
            show();
        }
    }
    printf("final position after %d steps, ate %d:\n", i, eaten);
    show();

    /* Free the whole list. In the heap view, the blocks disappear one by
       one from head to tail. */
    while (head != NULL) {
        s = head->next;
        free(head);
        head = s;
    }
    return 0;
}
