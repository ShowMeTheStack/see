/*
 * title: Checking brackets with an array stack
 * level: 1
 * about: Uses a stack held in an array to check that (), [] and {} are properly nested in each input line, and says where the first mistake is.
 * input: (a + b) * [c - {d / e}]\nint main(void) { return a[(1)]; }\n(]\n((x)\nf(x)) + 1\n
 */
#include <stdio.h>
#include <string.h>

#define MAX 100

/* A stack: push puts a value on top, pop takes the top one off. With an
   array it is just the array and the index of the next free slot. */
struct stack {
    char items[MAX];
    int top;
};

void push(struct stack *s, char c)
{
    if (s->top < MAX)
        s->items[s->top++] = c;
}

char pop(struct stack *s)
{
    return s->top > 0 ? s->items[--s->top] : '\0';
}

char matching(char close)
{
    return close == ')' ? '(' : close == ']' ? '[' : '{';
}

void check(const char *line)
{
    struct stack s;
    int i;

    s.top = 0;
    for (i = 0; line[i] != '\0'; i++) {
        char c = line[i];
        if (c == '(' || c == '[' || c == '{') {
            /* Every opener waits on the stack until its closer arrives.
               Watch items[] fill up as the nesting gets deeper. */
            push(&s, c);
        } else if (c == ')' || c == ']' || c == '}') {
            char open = pop(&s);
            if (open == '\0') {
                printf("  column %d: '%c' has nothing to close\n", i + 1, c);
                return;
            }
            if (open != matching(c)) {
                printf("  column %d: '%c' does not match '%c'\n", i + 1, c, open);
                return;
            }
        }
    }
    if (s.top > 0)
        printf("  %d bracket%s never closed, innermost '%c'\n", s.top,
               s.top == 1 ? "" : "s", s.items[s.top - 1]);
    else
        printf("  balanced\n");
}

int main(void)
{
    char line[MAX];
    while (fgets(line, sizeof line, stdin) != NULL) {
        line[strcspn(line, "\n")] = '\0';
        printf("%s\n", line);
        check(line);
    }
    return 0;
}
