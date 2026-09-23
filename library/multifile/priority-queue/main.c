/*
 * title: Emergency room priority queue
 * level: 3
 * about: Admits patients from one file and treats them from another, both sharing a binary-heap priority queue module.
 * input: a Mo 4\na Lin 2\na Kofi 5\nt\na Priya 1\na Sam 2\nt\nt\na Ana 3\nt\nt\nt\nt\n
 */

/* Files: pq.c (the heap), reception.c (pushes), doctor.c (pops), main.c.
 * See compiles each .c file separately and links all four together. Notice
 * the queue itself lives in main's stack frame: reception and doctor both
 * get a pointer to the same struct pq. */
#include <stdio.h>
#include "pq.h"
#include "reception.h"
#include "doctor.h"

int main(void)
{
    struct pq waiting;
    char cmd;
    char name[12];
    int prio;
    int turn = 0;
    const char *doctors[2];

    doctors[0] = "Dr Ito";
    doctors[1] = "Dr Rao";
    pq_init(&waiting);

    /* "a name priority" admits someone, "t" treats the most urgent. */
    while (scanf(" %c", &cmd) == 1) {
        if (cmd == 'a' && scanf("%11s %d", name, &prio) == 2) {
            reception_admit(&waiting, name, prio);
        } else if (cmd == 't') {
            doctor_treat_next(&waiting, doctors[turn]);
            turn = 1 - turn;
        }
    }
    printf("%d still waiting\n", pq_size(&waiting));
    return 0;
}
