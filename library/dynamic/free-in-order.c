/*
 * title: Freeing a nest of blocks in the right order
 * level: 2
 * about: Builds a playlist that owns a title string and an array of songs that each own a name, then takes it apart from the inside out.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct song {
    char *name;        /* owned: a heap copy of the name */
    int seconds;
};

struct playlist {
    char *title;       /* owned */
    struct song *songs; /* owned: an array of n songs */
    int n;
};

static char *copy_of(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

static struct playlist *make_playlist(const char *title, const char **names, const int *secs, int n)
{
    struct playlist *pl = malloc(sizeof *pl);
    int i;

    if (pl == NULL)
        return NULL;
    pl->title = copy_of(title);
    pl->songs = malloc(n * sizeof *pl->songs);
    pl->n = n;
    for (i = 0; i < n; i++) {
        pl->songs[i].name = copy_of(names[i]);
        pl->songs[i].seconds = secs[i];
    }
    return pl;
}

/*
 * Inside out: a block's pointers must be read before the block is freed,
 * because after free(x) even looking at x->anything is a use after free.
 * So: each song's name, then the song array, then the title, then the
 * playlist itself, last of all.
 */
static void free_playlist(struct playlist *pl)
{
    int i;
    for (i = 0; i < pl->n; i++)
        free(pl->songs[i].name);
    free(pl->songs);
    free(pl->title);
    free(pl);
}

int main(void)
{
    static const char *names[] = { "Blue in Green", "So What", "Freddie Freeloader" };
    static const int secs[] = { 337, 562, 589 };
    struct playlist *pl = make_playlist("Kind of Blue", names, secs, 3);
    int i, total = 0;

    if (pl == NULL)
        return 0;

    /*
     * Six heap blocks now hang off pl. In the heap panel: pl -> playlist,
     * which points at the title and the song array, which points at three
     * names.
     */
    printf("%s\n", pl->title);
    for (i = 0; i < pl->n; i++) {
        printf("  %-20s %d:%02d\n", pl->songs[i].name,
               pl->songs[i].seconds / 60, pl->songs[i].seconds % 60);
        total += pl->songs[i].seconds;
    }
    printf("  total %d:%02d\n", total / 60, total % 60);

    /* Step into this with F11 and watch the blocks disappear one by one. */
    free_playlist(pl);
    return 0;
}
