/*
 * title: A tiny command shell
 * level: 3
 * about: Reads commands like "push 5" or "sum" and runs them through a table that maps command names to handler functions with their argument counts.
 * input: push 5\npush 12\npush 7\nshow\nsum\npop\nmax\nhelp\nreverse\nshow\nfly away\npush\nquit\nshow
 */
#include <stdio.h>
#include <string.h>

#define STACKMAX 16

static long stack[STACKMAX];
static int top = 0;            /* number of items on the stack */
static int running = 1;

/* Every handler has the same signature: an argument count and values. */
typedef void (*command_fn)(int argc, const long argv[]);

void c_push(int argc, const long argv[])
{
    if (top == STACKMAX) { printf("stack full\n"); return; }
    stack[top++] = argv[0];
    (void)argc;
}
void c_pop(int argc, const long argv[])
{
    if (top == 0) { printf("stack empty\n"); return; }
    printf("popped %ld\n", stack[--top]);
    (void)argc; (void)argv;
}
void c_show(int argc, const long argv[])
{
    int i;
    printf("stack:");
    for (i = 0; i < top; i++) printf(" %ld", stack[i]);
    printf("\n");
    (void)argc; (void)argv;
}
void c_sum(int argc, const long argv[])
{
    long s = 0;
    int i;
    for (i = 0; i < top; i++) s += stack[i];
    printf("sum = %ld\n", s);
    (void)argc; (void)argv;
}
void c_max(int argc, const long argv[])
{
    int i;
    long m;
    if (top == 0) { printf("stack empty\n"); return; }
    m = stack[0];
    for (i = 1; i < top; i++) if (stack[i] > m) m = stack[i];
    printf("max = %ld\n", m);
    (void)argc; (void)argv;
}
void c_reverse(int argc, const long argv[])
{
    int i;
    long t;
    for (i = 0; i < top / 2; i++) {
        t = stack[i]; stack[i] = stack[top - 1 - i]; stack[top - 1 - i] = t;
    }
    (void)argc; (void)argv;
}
void c_quit(int argc, const long argv[])
{
    running = 0;
    (void)argc; (void)argv;
}
void c_help(int argc, const long argv[]);

struct command {
    const char *name;
    int nargs;              /* how many numbers the command expects */
    command_fn run;
    const char *help;
};

const struct command commands[] = {
    { "push",    1, c_push,    "push N   put N on the stack" },
    { "pop",     0, c_pop,     "pop      remove the top item" },
    { "show",    0, c_show,    "show     print the stack" },
    { "sum",     0, c_sum,     "sum      add up the stack" },
    { "max",     0, c_max,     "max      largest item" },
    { "reverse", 0, c_reverse, "reverse  turn the stack upside down" },
    { "help",    0, c_help,    "help     this list" },
    { "quit",    0, c_quit,    "quit     stop" }
};
#define NCOMMANDS ((int)(sizeof commands / sizeof commands[0]))

/* help walks the same table that dispatches, so it is never out of date. */
void c_help(int argc, const long argv[])
{
    int i;
    for (i = 0; i < NCOMMANDS; i++)
        printf("  %s\n", commands[i].help);
    (void)argc; (void)argv;
}

/* Read one line (keeping the newline, like fgets). Returns 0 at end of input. */
int read_line(char *buf, int size)
{
    int c, n = 0;
    while (n < size - 2 && (c = getchar()) != EOF) {
        buf[n++] = (char)c;
        if (c == '\n')
            break;
    }
    buf[n] = '\0';
    return n > 0;
}

int main(void)
{
    char line[80], word[16];
    long args[2];
    int i, got;

    while (running && read_line(line, sizeof line)) {
        /* sscanf pulls the name and up to two numbers out of the line. */
        got = sscanf(line, "%15s %ld %ld", word, &args[0], &args[1]);
        if (got < 1)
            continue;
        for (i = 0; i < NCOMMANDS; i++)
            if (strcmp(word, commands[i].name) == 0)
                break;
        printf("> %s", line);
        if (i == NCOMMANDS) {
            printf("unknown command '%s', try help\n", word);
            continue;
        }
        if (got - 1 < commands[i].nargs) {
            printf("%s needs %d number%s\n", word, commands[i].nargs,
                   commands[i].nargs == 1 ? "" : "s");
            continue;
        }
        commands[i].run(got - 1, args);
    }
    printf("bye\n");
    return 0;
}
