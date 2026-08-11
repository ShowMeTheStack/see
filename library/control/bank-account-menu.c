/*
 * title: Bank account menu
 * level: 3
 * about: Runs a deposit, withdraw and statement menu from canned keystrokes, keeping a short history of transactions.
 * input: d 500\nw 120\nw 900\nd 75\nb\nx\ns\nq
 */
#include <stdio.h>

#define MAXT 10

int main(void)
{
    long balance = 0;          /* in whole pounds */
    long history[MAXT];        /* + for deposits, - for withdrawals */
    int nhist = 0;
    char cmd;
    long amount;
    int i;
    int running = 1;

    printf("Commands: d N deposit, w N withdraw, b balance, s statement, q quit\n");

    while (running) {
        /* The space before %c tells scanf to skip whitespace first,
           including the newline left over from the previous line. Without
           it, cmd would often be '\n'. */
        if (scanf(" %c", &cmd) != 1)
            break;

        switch (cmd) {
        case 'd':
        case 'w':
            /* Both commands read an amount, so they share these lines.
               The sign is the only difference. */
            if (scanf("%ld", &amount) != 1 || amount <= 0) {
                printf("bad amount\n");
                break;
            }
            if (cmd == 'w') {
                if (amount > balance) {
                    printf("refused: withdraw %ld, balance only %ld\n", amount, balance);
                    break;   /* leaves the switch, not the while */
                }
                amount = -amount;
            }
            balance += amount;
            if (nhist < MAXT)
                history[nhist++] = amount;
            printf("%s %ld, balance %ld\n", amount > 0 ? "deposited" : "withdrew",
                   amount > 0 ? amount : -amount, balance);
            break;
        case 'b':
            printf("balance %ld\n", balance);
            break;
        case 's':
            /* Only the first nhist entries of history were ever written.
               Reading past them would be an uninitialised read, which See
               would flag. */
            printf("statement:\n");
            for (i = 0; i < nhist; i++)
                printf("  %2d  %+6ld\n", i + 1, history[i]);
            printf("  closing balance %ld\n", balance);
            break;
        case 'q':
            running = 0;   /* a flag, because break here would only leave the switch */
            break;
        default:
            printf("unknown command '%c'\n", cmd);
        }
    }
    printf("goodbye\n");
    return 0;
}
