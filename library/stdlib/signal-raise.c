/*
 * title: Catching signals raised with raise
 * level: 3
 * about: Installs handlers for SIGINT and SIGTERM, raises the signals itself, ignores one with SIG_IGN, and keeps the handler work to setting a sig_atomic_t flag.
 */
#include <stdio.h>
#include <signal.h>

/*
 * A signal is a message delivered to the program from outside its
 * normal flow: Ctrl-C sends SIGINT, a kill command SIGTERM. raise()
 * lets a program send one to itself, which is how we can test the
 * handlers here without a keyboard.
 *
 * A handler may run at an awkward moment, in the middle of anything.
 * The only thing C89 promises is safe inside it is to assign to a
 * variable of type volatile sig_atomic_t (and call signal again). So
 * the handler just records what happened; the main loop does the rest.
 */
static volatile sig_atomic_t got_int = 0;
static volatile sig_atomic_t got_term = 0;

static void on_int(int sig)
{
    got_int = 1;
    /*
     * In C89 the handler may be reset to SIG_DFL before it is called,
     * so a second SIGINT would end the program. Re-installing it here
     * keeps it in place on every system.
     */
    signal(sig, on_int);
}

static void on_term(int sig)
{
    (void)sig;
    got_term = 1;
}

int main(void)
{
    void (*old)(int);
    int step, interrupts = 0;

    if (signal(SIGINT, on_int) == SIG_ERR)
        printf("could not install the SIGINT handler\n");
    old = signal(SIGTERM, on_term);
    printf("the previous SIGTERM action was %s\n",
           old == SIG_DFL ? "SIG_DFL (the default)" : "something else");

    /* A pretend work loop that checks the flags between steps. */
    for (step = 1; step <= 6 && !got_term; step++) {
        printf("step %d\n", step);
        if (step == 2 || step == 3)
            raise(SIGINT);       /* as if the user pressed Ctrl-C */
        if (got_int) {
            got_int = 0;         /* take the message, then deal with it */
            interrupts++;
            printf("  interrupt number %d noticed, carrying on\n", interrupts);
        }
        if (step == 5)
            raise(SIGTERM);      /* as if asked to shut down */
    }
    if (got_term)
        printf("SIGTERM received: shutting down tidily after step %d\n", step - 1);

    /* SIG_IGN means "ignore this signal": raising it now does nothing. */
    signal(SIGINT, SIG_IGN);
    raise(SIGINT);
    printf("SIGINT ignored: got_int is %d, %d interrupts in all\n",
           (int)got_int, interrupts);

    /*
     * Step into raise in See (F11) and the handler appears on the call
     * stack above it, called by the library on the program's behalf.
     */
    return 0;
}
