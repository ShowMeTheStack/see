/*
 * title: A signal handler as a callback
 * level: 2
 * about: Installs a handler for SIGINT, raises the signal itself, and shows the handler setting a flag that the main loop checks.
 */
#include <stdio.h>
#include <signal.h>

/*
 * A handler may run at any moment, in the middle of other code, so the
 * only safe thing for it to touch is a volatile sig_atomic_t variable.
 * Printing from a real asynchronous handler is not safe; here the
 * signal comes from raise(), which makes it run like an ordinary call.
 */
static volatile sig_atomic_t stop_requested = 0;
static volatile sig_atomic_t times_called = 0;

void on_interrupt(int sig)
{
    stop_requested = 1;
    times_called++;
    /*
     * In C89 the handler may be reset to SIG_DFL when it runs, so it
     * installs itself again to catch the next signal too.
     */
    signal(sig, on_interrupt);
}

int main(void)
{
    void (*previous)(int);
    int work = 0;

    /*
     * signal() takes a pointer to the handler and returns the handler
     * that was there before (here SIG_DFL, the default action).
     */
    previous = signal(SIGINT, on_interrupt);
    if (previous == SIG_ERR) {
        printf("could not install the handler\n");
        return 0;
    }
    printf("handler installed; the previous one was %s\n",
           previous == SIG_DFL ? "SIG_DFL" : "something else");

    /* A "long job" that pretends the user presses Ctrl-C at step 5. */
    while (!stop_requested) {
        work++;
        printf("working, step %d\n", work);
        if (work == 5) {
            printf("raise(SIGINT)\n");
            raise(SIGINT);      /* step into this (F11) to watch the handler run */
        }
    }
    printf("stopped cleanly after %d steps\n", work);

    /* A second signal is caught too, because the handler re-installed itself. */
    raise(SIGINT);
    printf("handler ran %d times\n", (int)times_called);

    /* Ignore it from now on: SIG_IGN is a special "do nothing" handler. */
    signal(SIGINT, SIG_IGN);
    raise(SIGINT);
    printf("with SIG_IGN the third signal did nothing; still %d\n", (int)times_called);
    return 0;
}
