/*
 * title: Reading a key = value config file
 * level: 3
 * about: Parses an INI-style settings file with comments, blank lines, sections and stray spaces into a linked list of heap-allocated entries.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

struct entry {
    char *key;              /* "section.key", on the heap */
    char *value;            /* also on the heap */
    struct entry *next;
};

/* C89 has no strdup, so here is one. */
static char *copy_of(const char *s)
{
    char *p = malloc(strlen(s) + 1);

    if (p != NULL)
        strcpy(p, s);
    return p;
}

/* Trim spaces at both ends, in place. Returns a pointer into s. */
static char *trim(char *s)
{
    char *end;

    while (isspace((unsigned char)*s))
        s++;
    end = s + strlen(s);
    while (end > s && isspace((unsigned char)end[-1]))
        end--;
    *end = '\0';
    return s;
}

static const char *lookup(const struct entry *list, const char *key, const char *fallback)
{
    for (; list != NULL; list = list->next)
        if (strcmp(list->key, key) == 0)
            return list->value;
    return fallback;
}

int main(void)
{
    FILE *fp;
    char buf[100], section[32], full[80];
    char *line, *eq, *key, *value;
    struct entry *head = NULL, *e, **tail = &head;
    int lineno = 0;

    fp = fopen("/tmp/game.ini", "w");
    if (fp == NULL) {
        perror("/tmp/game.ini");
        return 1;
    }
    fputs("# settings for the game\n", fp);
    fputs("[screen]\n", fp);
    fputs("  width  = 640\n", fp);
    fputs("height=480\n", fp);
    fputs("\n", fp);
    fputs("[player]\n", fp);
    fputs("name = Ada Lovelace   \n", fp);
    fputs("lives= 3\n", fp);
    fputs("this line is broken\n", fp);
    fclose(fp);

    fp = fopen("/tmp/game.ini", "r");
    if (fp == NULL) {
        perror("/tmp/game.ini");
        return 1;
    }
    section[0] = '\0';
    while (fgets(buf, sizeof buf, fp) != NULL) {
        lineno++;
        line = trim(buf);
        if (line[0] == '\0' || line[0] == '#')
            continue;
        if (line[0] == '[') {
            /* sscanf with a scanset reads up to the closing bracket */
            if (sscanf(line, "[%31[^]]", section) != 1)
                section[0] = '\0';
            continue;
        }
        eq = strchr(line, '=');
        if (eq == NULL) {
            printf("line %d ignored: %s\n", lineno, line);
            continue;
        }
        /* Cut the line in two at the '=' and trim both halves. */
        *eq = '\0';
        key = trim(line);
        value = trim(eq + 1);
        sprintf(full, "%.31s.%.40s", section, key);

        e = malloc(sizeof *e);
        if (e == NULL)
            break;
        e->key = copy_of(full);
        e->value = copy_of(value);
        e->next = NULL;
        /* tail points at the last next field, so appending is O(1).
           In the memory picture the list grows to the right. */
        *tail = e;
        tail = &e->next;
    }
    fclose(fp);

    for (e = head; e != NULL; e = e->next)
        printf("%-14s = '%s'\n", e->key, e->value);

    printf("screen is %d x %d\n", atoi(lookup(head, "screen.width", "0")),
           atoi(lookup(head, "screen.height", "0")));
    printf("sound: %s\n", lookup(head, "audio.sound", "on (default)"));

    while (head != NULL) {
        e = head->next;
        free(head->key);
        free(head->value);
        free(head);
        head = e;
    }
    return 0;
}
