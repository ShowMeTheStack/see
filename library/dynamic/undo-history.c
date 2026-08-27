/*
 * title: An editor with undo
 * level: 3
 * about: Runs a tiny line editor from commands, saving a heap copy of the text before every change on an undo stack so that "undo" can restore earlier versions.
 * input: add Hello\nadd , world\nadd !\nshow\nundo\nshow\nclear\nshow\nundo\nundo\nshow\nundo\nundo\nshow
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAXHIST 16

static char *history[MAXHIST];   /* saved versions, oldest at 0 */
static int depth = 0;

static char *copy_of(const char *s)
{
    char *p = malloc(strlen(s) + 1);
    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* Save the current text before changing it. */
static void remember(const char *text)
{
    if (depth == MAXHIST) {
        /* Forget the oldest version to make room: free it, slide the rest down. */
        free(history[0]);
        memmove(history, history + 1, (MAXHIST - 1) * sizeof history[0]);
        depth--;
    }
    history[depth] = copy_of(text);
    if (history[depth] != NULL)
        depth++;
}

/*
 * Replace *text with a new heap string built from it. The old string is
 * freed here: *text always owns exactly one block.
 */
static void set_text(char **text, char *fresh)
{
    if (fresh == NULL)
        return;
    free(*text);
    *text = fresh;
}

static char *concat(const char *a, const char *b)
{
    char *p = malloc(strlen(a) + strlen(b) + 1);
    if (p != NULL) {
        strcpy(p, a);
        strcat(p, b);
    }
    return p;
}

int main(void)
{
    char line[80];
    char *text = copy_of("");
    int i;

    if (text == NULL)
        return 0;
    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        if (strncmp(line, "add ", 4) == 0) {
            remember(text);
            set_text(&text, concat(text, line + 4));
        } else if (strcmp(line, "clear") == 0) {
            remember(text);
            set_text(&text, copy_of(""));
        } else if (strcmp(line, "undo") == 0) {
            if (depth == 0) {
                printf("nothing to undo\n");
                continue;
            }
            /*
             * The saved copy becomes the current text: ownership moves from
             * the history array to text, so nothing is copied or leaked.
             */
            free(text);
            text = history[--depth];
            history[depth] = NULL;
        } else if (strcmp(line, "show") == 0) {
            printf("text: \"%s\"  (versions saved: %d)\n", text, depth);
        }
    }

    /* Everything still on the stack, plus the current text. */
    for (i = 0; i < depth; i++)
        free(history[i]);
    free(text);
    return 0;
}
