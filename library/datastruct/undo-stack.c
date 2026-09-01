/*
 * title: Undo and redo with two linked stacks
 * level: 2
 * about: Edits a line of text with type and delete commands, recording each edit on a linked-list stack so that undo and redo can replay them.
 * input: type Hello\ntype ,_world\ndel 6\ntype _there\nundo\nundo\nredo\ntype !\nredo\nundo\nundo\nundo\nundo\nundo\n
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* A stack built from linked nodes has no fixed size. Push links a new node
   in front of the top, pop unlinks the top. Each node records one edit:
   the text that was typed or deleted, and which it was. */
struct edit {
    int is_insert;
    char *text;               /* heap copy */
    struct edit *below;
};

void push(struct edit **top, int is_insert, const char *text)
{
    struct edit *e = malloc(sizeof *e);
    if (e == NULL)
        exit(1);
    e->is_insert = is_insert;
    e->text = malloc(strlen(text) + 1);
    if (e->text == NULL)
        exit(1);
    strcpy(e->text, text);
    e->below = *top;
    *top = e;
}

/* Pop hands the node to the caller, who now owns it and must free it. */
struct edit *pop(struct edit **top)
{
    struct edit *e = *top;
    if (e != NULL)
        *top = e->below;
    return e;
}

void free_edit(struct edit *e)
{
    free(e->text);
    free(e);
}

void clear(struct edit **top)
{
    struct edit *e;
    while ((e = pop(top)) != NULL)
        free_edit(e);
}

/* Apply an edit forwards (do) or backwards (undo) to the document. */
void apply(char *doc, const struct edit *e, int forwards)
{
    if (e->is_insert == forwards)
        strcat(doc, e->text);
    else
        doc[strlen(doc) - strlen(e->text)] = '\0';
}

int depth(const struct edit *e)
{
    int n = 0;
    for (; e != NULL; e = e->below)
        n++;
    return n;
}

int main(void)
{
    char doc[200] = "";
    char cmd[8], arg[64];
    struct edit *undo = NULL, *redo = NULL, *e;
    int k, len;

    while (scanf("%7s", cmd) == 1) {
        if (strcmp(cmd, "type") == 0 && scanf("%63s", arg) == 1) {
            for (k = 0; arg[k]; k++)       /* '_' stands for a space */
                if (arg[k] == '_') arg[k] = ' ';
            push(&undo, 1, arg);
            apply(doc, undo, 1);
            clear(&redo);                  /* a new edit wipes the redo history */
        } else if (strcmp(cmd, "del") == 0 && scanf("%d", &k) == 1) {
            len = (int)strlen(doc);
            if (k > len) k = len;
            push(&undo, 0, doc + len - k); /* remember what is being deleted */
            apply(doc, undo, 1);
            clear(&redo);
        } else if (strcmp(cmd, "undo") == 0) {
            /* Move the top edit from one stack to the other: no copying,
               just one node relinked. Watch it hop between the stacks. */
            if ((e = pop(&undo)) == NULL) {
                printf("nothing to undo\n");
                continue;
            }
            apply(doc, e, 0);
            e->below = redo;
            redo = e;
        } else if (strcmp(cmd, "redo") == 0) {
            if ((e = pop(&redo)) == NULL) {
                printf("nothing to redo\n");
                continue;
            }
            apply(doc, e, 1);
            e->below = undo;
            undo = e;
        }
        printf("%-5s \"%s\"   undo:%d redo:%d\n", cmd, doc, depth(undo), depth(redo));
    }
    clear(&undo);
    clear(&redo);
    return 0;
}
