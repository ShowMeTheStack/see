/*
 * title: A leak finder built from malloc and free macros
 * level: 4
 * about: Redefines malloc and free as macros that record the file and line of every allocation, then reports which blocks were never freed.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/*
 * The tracker keeps a small table of live blocks: address, size and
 * the source line that asked for it. The real malloc and free are
 * called from these functions, which are written BEFORE the macros
 * below exist, so they still mean the library functions.
 */
#define MAX_TRACKED 16

struct record {
    void *ptr;
    size_t size;
    const char *file;
    int line;
};

static struct record table[MAX_TRACKED];
static int live = 0;

static void *track_malloc(size_t size, const char *file, int line)
{
    void *p = malloc(size);
    if (p != NULL && live < MAX_TRACKED) {
        table[live].ptr = p;
        table[live].size = size;
        table[live].file = file;
        table[live].line = line;
        live++;
    }
    return p;
}

static void track_free(void *p, const char *file, int line)
{
    int i;
    if (p == NULL)
        return;
    for (i = 0; i < live; i++) {
        if (table[i].ptr == p) {
            table[i] = table[live - 1];   /* move the last record into the gap */
            live--;
            free(p);
            return;
        }
    }
    printf("  %s:%d: free of a pointer that was never allocated\n", file, line);
}

/* Report and then release every block still in the table. */
static void report_leaks(void)
{
    int i;
    size_t total = 0;
    if (live == 0) {
        printf("no leaks\n");
        return;
    }
    for (i = 0; i < live; i++) {
        printf("  leak: %lu bytes allocated at %s:%d\n",
               (unsigned long)table[i].size, table[i].file, table[i].line);
        total += table[i].size;
        free(table[i].ptr);
    }
    printf("%d blocks, %lu bytes leaked (now cleaned up)\n", live, (unsigned long)total);
    live = 0;
}

/*
 * From here on, every malloc(n) in this file becomes
 * track_malloc(n, __FILE__, __LINE__), with the line of the call.
 */
#define malloc(n) track_malloc((n), __FILE__, __LINE__)
#define free(p)   track_free((p), __FILE__, __LINE__)

static char *copy_string(const char *s)
{
    char *d = (char *)malloc(strlen(s) + 1);
    if (d != NULL)
        strcpy(d, s);
    return d;
}

int main(void)
{
    char *name, *city, *note;
    int *scores;
    int local = 0;

    name = copy_string("Ada");
    city = copy_string("London");
    scores = (int *)malloc(5 * sizeof(int));
    note = (char *)malloc(32);

    /*
     * Stop here in See and look at the heap: four blocks, and the table
     * in the globals pane holding a pointer to each of them, with the
     * line it came from.
     */
    printf("%d blocks live\n", live);

    free(name);
    free(scores);
    free(&local);     /* a mistake the tracker catches without crashing */

    /*
     * city and note are forgotten on purpose. The city leak is reported
     * at the malloc line inside copy_string, not in main: __LINE__ marks
     * where malloc was written. Serious leak finders record the whole
     * chain of calls for exactly this reason.
     */
    printf("before exit:\n");
    report_leaks();
    (void)city;
    (void)note;
    return 0;
}
