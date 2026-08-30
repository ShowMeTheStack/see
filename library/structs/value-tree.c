/*
 * title: A JSON-like value tree with tagged unions
 * level: 4
 * about: Parses a small JSON-like text into a tree of heap-allocated tagged-union values, prints it back indented, sums its numbers and frees every node.
 * input: {"name": "probe", "mass": 721.9, "parts": [1, 2, [3, 4]], "live": true, "notes": [], "orbit": {"apoapsis": 410, "periapsis": 402}}
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

enum vtype { V_NUMBER, V_STRING, V_BOOL, V_LIST, V_OBJECT };

/* One struct type describes every kind of value. The union holds whatever
   the tag says: a number, a heap string, a truth value, or a list of
   children. Lists and objects share the same layout; an object simply also
   has a key on each child. */
struct value {
    enum vtype type;
    char *key;                     /* set when this value sits inside an object */
    union {
        double number;
        char *string;
        int boolean;
        struct {
            struct value **items;  /* heap array of pointers to children */
            int count;
        } list;
    } as;
};

static const char *src;            /* parse position in the input text */

static void skip_space(void)
{
    while (isspace((unsigned char)*src))
        src++;
}

static struct value *new_value(enum vtype t)
{
    struct value *v = malloc(sizeof *v);
    if (v == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    memset(v, 0, sizeof *v);
    v->type = t;
    return v;
}

/* Reads "..." and returns a fresh heap copy of the characters between. */
static char *parse_string(void)
{
    const char *start = ++src;     /* step past the opening quote */
    char *s;
    size_t n;
    while (*src && *src != '"')
        src++;
    n = (size_t)(src - start);
    s = malloc(n + 1);
    memcpy(s, start, n);
    s[n] = '\0';
    if (*src == '"')
        src++;
    return s;
}

static void append(struct value *parent, struct value *child)
{
    struct value **grown = realloc(parent->as.list.items,
                                   (parent->as.list.count + 1) * sizeof *grown);
    if (grown == NULL) {
        printf("out of memory\n");
        exit(1);
    }
    parent->as.list.items = grown;
    parent->as.list.items[parent->as.list.count++] = child;
}

/* Recursive descent: each call reads one value and returns a tree for it.
   Lists and objects call parse_value again for their children, so the C call
   stack mirrors the nesting of the text. Pause inside the innermost list and
   look at how many parse_value frames are stacked up. */
static struct value *parse_value(void)
{
    struct value *v;
    skip_space();
    if (*src == '"') {
        v = new_value(V_STRING);
        v->as.string = parse_string();
    } else if (*src == '[' || *src == '{') {
        int is_object = (*src == '{');
        char close = is_object ? '}' : ']';
        v = new_value(is_object ? V_OBJECT : V_LIST);
        src++;
        skip_space();
        while (*src && *src != close) {
            char *key = NULL;
            struct value *child;
            if (is_object) {
                key = parse_string();
                skip_space();
                if (*src == ':')
                    src++;
            }
            child = parse_value();
            child->key = key;
            append(v, child);
            skip_space();
            if (*src == ',')
                src++;
            skip_space();
        }
        if (*src == close)
            src++;
    } else if (strncmp(src, "true", 4) == 0 || strncmp(src, "false", 5) == 0) {
        v = new_value(V_BOOL);
        v->as.boolean = (*src == 't');
        src += v->as.boolean ? 4 : 5;
    } else {
        char *end;
        v = new_value(V_NUMBER);
        v->as.number = strtod(src, &end);
        if (end == src)            /* not a number: skip the bad character */
            end++;
        src = end;
    }
    return v;
}

static void print_value(const struct value *v, int depth)
{
    int i;
    printf("%*s", depth * 2, "");
    if (v->key)
        printf("%s: ", v->key);
    switch (v->type) {
    case V_NUMBER: printf("%g\n", v->as.number); break;
    case V_STRING: printf("\"%s\"\n", v->as.string); break;
    case V_BOOL:   printf("%s\n", v->as.boolean ? "true" : "false"); break;
    case V_LIST:
    case V_OBJECT:
        printf("%s %d item%s\n", v->type == V_LIST ? "list of" : "object with",
               v->as.list.count, v->as.list.count == 1 ? "" : "s");
        for (i = 0; i < v->as.list.count; i++)
            print_value(v->as.list.items[i], depth + 1);
        break;
    }
}

static double sum_numbers(const struct value *v)
{
    double s = 0.0;
    int i;
    if (v->type == V_NUMBER)
        return v->as.number;
    if (v->type == V_LIST || v->type == V_OBJECT)
        for (i = 0; i < v->as.list.count; i++)
            s += sum_numbers(v->as.list.items[i]);
    return s;
}

/* Free children before the parent: once the parent is gone, the pointers to
   its children are gone too. Watch the heap shrink node by node. */
static void free_value(struct value *v)
{
    int i;
    if (v->type == V_STRING)
        free(v->as.string);
    if (v->type == V_LIST || v->type == V_OBJECT) {
        for (i = 0; i < v->as.list.count; i++)
            free_value(v->as.list.items[i]);
        free(v->as.list.items);
    }
    free(v->key);                  /* free(NULL) is allowed and does nothing */
    free(v);
}

int main(void)
{
    char text[512];
    struct value *root;

    if (fgets(text, sizeof text, stdin) == NULL) {
        printf("no input\n");
        return 0;
    }
    src = text;
    root = parse_value();
    print_value(root, 0);
    printf("sum of all numbers: %g\n", sum_numbers(root));
    printf("sizeof(struct value) = %d bytes per node\n", (int)sizeof(struct value));
    free_value(root);
    return 0;
}
