/*
 * title: Sharing a block with a reference count
 * level: 4
 * about: Lets several documents share one heap-allocated string by counting references, freeing the string only when the last owner lets go, and copying it before a change if it is shared.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

struct shared {
    int refs;          /* how many owners hold this block */
    char text[40];
};

struct doc {
    const char *name;
    struct shared *body;
};

static struct shared *shared_new(const char *s)
{
    struct shared *p = calloc(1, sizeof *p);
    if (p != NULL) {
        p->refs = 1;
        strncpy(p->text, s, sizeof p->text - 1);   /* calloc already zeroed the rest */
    }
    return p;
}

static struct shared *retain(struct shared *p)
{
    p->refs++;
    return p;
}

/* Drop one reference; the last one out frees the block. */
static void release(struct shared *p)
{
    if (--p->refs == 0) {
        printf("    (last reference to \"%s\" gone: freed)\n", p->text);
        free(p);
    }
}

/*
 * Copy on write: before changing a body that others also hold, take a
 * private copy so the change does not leak into their documents.
 */
static void doc_append(struct doc *d, const char *more)
{
    struct shared *mine;
    if (d->body->refs > 1) {
        mine = shared_new(d->body->text);
        if (mine == NULL)
            return;
        release(d->body);
        d->body = mine;
        printf("    (%s made its own copy before writing)\n", d->name);
    }
    strncat(d->body->text, more, sizeof d->body->text - 1 - strlen(d->body->text));
}

static void show(const struct doc *docs, int n)
{
    int i;
    for (i = 0; i < n; i++)
        printf("  %-6s -> %p refs=%d \"%s\"\n", docs[i].name, (void *)docs[i].body,
               docs[i].body->refs, docs[i].body->text);
}

int main(void)
{
    struct doc docs[3];
    int i;

    docs[0].name = "draft";
    docs[0].body = shared_new("Dear reader,");
    if (docs[0].body == NULL)
        return 0;

    /* Two more documents share the same body: no copying, just a bigger count. */
    docs[1].name = "copy1";
    docs[1].body = retain(docs[0].body);
    docs[2].name = "copy2";
    docs[2].body = retain(docs[0].body);
    printf("three docs, one body:\n");
    show(docs, 3);

    /* In the heap panel: one block, three arrows into it. */
    doc_append(&docs[1], " hello!");
    printf("after copy1 writes:\n");
    show(docs, 3);

    printf("releasing all docs:\n");
    for (i = 0; i < 3; i++) {
        printf("  release %s\n", docs[i].name);
        release(docs[i].body);
        docs[i].body = NULL;
    }
    return 0;
}
