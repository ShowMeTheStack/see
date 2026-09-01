/*
 * title: A skip list with express lanes
 * level: 4
 * about: Builds a skip list, a sorted linked list with randomly promoted express levels, and shows how searches skip ahead and how few nodes they touch.
 */
#include <stdio.h>
#include <stdlib.h>

#define MAXLEVEL 5

/* Every node is on level 0, a normal sorted linked list. About half the
   nodes are also on level 1, a quarter on level 2, and so on. A search starts
   on the top level, runs right while the next key is still too small, then
   drops down a level. Like taking the express train and changing to the
   local one near your stop. Each node owns an array of forward pointers, one
   per level it is on, so tall nodes have more arrows in the memory picture. */
struct node {
    int key;
    int height;
    struct node **forward;   /* forward[0..height-1] */
};

struct skiplist {
    struct node head;        /* a sentinel with MAXLEVEL forward pointers */
    int level;               /* how many levels are in use */
};

int random_height(void)
{
    int h = 1;
    while (h < MAXLEVEL && rand() % 2 == 0)
        h++;
    return h;
}

struct node *make_node(int key, int height)
{
    struct node *n = malloc(sizeof *n);
    int i;
    if (n == NULL)
        exit(1);
    n->forward = malloc(height * sizeof *n->forward);
    if (n->forward == NULL)
        exit(1);
    n->key = key;
    n->height = height;
    for (i = 0; i < height; i++)
        n->forward[i] = NULL;
    return n;
}

void insert(struct skiplist *s, int key)
{
    struct node *update[MAXLEVEL];   /* last node before key on each level */
    struct node *x = &s->head, *n;
    int i, h;

    for (i = s->level - 1; i >= 0; i--) {
        while (x->forward[i] != NULL && x->forward[i]->key < key)
            x = x->forward[i];
        update[i] = x;
    }
    if (x->forward[0] != NULL && x->forward[0]->key == key)
        return;                       /* already present */

    h = random_height();
    for (i = s->level; i < h; i++)
        update[i] = &s->head;         /* new levels start at the head */
    if (h > s->level)
        s->level = h;

    n = make_node(key, h);
    for (i = 0; i < h; i++) {         /* splice in on every level it reaches */
        n->forward[i] = update[i]->forward[i];
        update[i]->forward[i] = n;
    }
}

int search(const struct skiplist *s, int key, int *visited)
{
    const struct node *x = &s->head;
    int i;
    *visited = 0;
    for (i = s->level - 1; i >= 0; i--)
        while (x->forward[i] != NULL && x->forward[i]->key < key) {
            x = x->forward[i];
            (*visited)++;
        }
    x = x->forward[0];
    return x != NULL && x->key == key;
}

/* Draw the levels as rows: a key appears on every level its node reaches. */
void draw(const struct skiplist *s)
{
    int i;
    const struct node *x, *bottom;
    for (i = s->level - 1; i >= 0; i--) {
        printf("L%d: head", i);
        x = s->head.forward[i];
        for (bottom = s->head.forward[0]; bottom != NULL; bottom = bottom->forward[0]) {
            if (bottom == x) {
                printf("-%3d", x->key);
                x = x->forward[i];
            } else {
                printf("----");
            }
        }
        printf("-NULL\n");
    }
}

int main(void)
{
    struct node *heads[MAXLEVEL];
    struct skiplist s;
    struct node *x;
    int keys[] = { 30, 7, 61, 19, 3, 44, 12, 88, 25, 70, 52, 9, 36, 95, 15 };
    int probes[] = { 52, 95, 3, 40 };
    int i, visited;

    srand(7);
    s.head.key = 0;
    s.head.height = MAXLEVEL;
    s.head.forward = heads;           /* the sentinel's array is on the stack */
    for (i = 0; i < MAXLEVEL; i++)
        heads[i] = NULL;
    s.level = 1;

    for (i = 0; i < 15; i++)
        insert(&s, keys[i]);
    draw(&s);

    for (i = 0; i < 4; i++) {
        int found = search(&s, probes[i], &visited);
        printf("search %2d: %-7s after moving along %d links (a plain list would need up to 15)\n",
               probes[i], found ? "found" : "missing", visited);
    }

    /* Each node has two blocks: the node and its forward array. */
    x = s.head.forward[0];
    while (x != NULL) {
        struct node *next = x->forward[0];
        free(x->forward);
        free(x);
        x = next;
    }
    return 0;
}
