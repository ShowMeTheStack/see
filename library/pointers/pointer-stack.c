/*
 * title: A stack with a moving top pointer
 * level: 3
 * about: Evaluates postfix arithmetic with a stack whose top is a pointer, pushing with *sp++ and popping with *--sp.
 * input: 3 4 + 2 * 7 5 - /
 */
#include <stdio.h>
#include <ctype.h>

#define DEPTH 16

/*
 * sp always points at the first FREE slot. Pushing stores there and then
 * moves up; popping moves down first and then reads. The two idioms are
 *     *sp++ = x;     (push)
 *     x = *--sp;     (pop)
 * The number of items on the stack is just sp - stack.
 */
int main(void)
{
    int stack[DEPTH];
    int *sp = stack;
    int a, b, c;

    /* Read tokens one by one; numbers go on the stack, operators combine the top two. */
    while ((c = getchar()) != EOF) {
        if (isspace(c))
            continue;
        if (isdigit(c)) {
            int v = c - '0';
            while ((c = getchar()) != EOF && isdigit(c))
                v = v * 10 + (c - '0');
            if (sp == stack + DEPTH) {
                printf("stack full\n");
                return 0;
            }
            *sp++ = v;
            printf("push %-3d depth %ld\n", v, (long)(sp - stack));
            continue;
        }
        if (sp - stack < 2) {
            printf("not enough operands for '%c'\n", c);
            return 0;
        }
        b = *--sp;       /* the right operand is on top */
        a = *--sp;
        switch (c) {
        case '+': *sp++ = a + b; break;
        case '-': *sp++ = a - b; break;
        case '*': *sp++ = a * b; break;
        case '/':
            if (b == 0) { printf("division by zero\n"); return 0; }
            *sp++ = a / b;
            break;
        default:
            printf("unknown operator '%c'\n", c);
            return 0;
        }
        printf("%d %c %d = %d\n", a, c, b, sp[-1]);
    }

    /* Watch sp in the stack frame: its arrow rises and falls inside the array. */
    if (sp - stack == 1)
        printf("result: %d\n", stack[0]);
    else
        printf("malformed expression, %ld values left\n", (long)(sp - stack));
    return 0;
}
