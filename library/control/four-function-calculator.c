/*
 * title: Four-function calculator
 * level: 2
 * about: Reads lines like 12 * 7 and switches on the operator character to compute each result.
 * input: 12 * 7\n100 / 8\n100 % 8\n3 - 10\n5 / 0\n2 ^ 8\n
 */
#include <stdio.h>

int main(void)
{
    int a, b;
    char op;

    /* scanf returns 3 only when it has read a number, an operator and a
       number. The space before %c skips the blanks around the operator. */
    while (scanf("%d %c %d", &a, &op, &b) == 3) {
        /* switch works on chars because a char is just a small integer:
           case '*' means case 42. */
        switch (op) {
        case '+': printf("%d + %d = %d\n", a, b, a + b); break;
        case '-': printf("%d - %d = %d\n", a, b, a - b); break;
        case '*': printf("%d * %d = %d\n", a, b, a * b); break;
        case '/':
        case '%':
            /* Dividing by zero would stop the program, so check first.
               Both / and % need the check, so they share it. */
            if (b == 0) {
                printf("%d %c 0: cannot divide by zero\n", a, op);
                break;
            }
            if (op == '/')
                printf("%d / %d = %d remainder %d\n", a, b, a / b, a % b);
            else
                printf("%d %% %d = %d\n", a, b, a % b);
            break;
        default:
            printf("I do not know the operator '%c' (code %d)\n", op, op);
        }
    }
    return 0;
}
