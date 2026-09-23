/* reception.c - the first user of the queue: it only ever pushes. */
#include <stdio.h>
#include <string.h>
#include "reception.h"

static int next_ticket = 1;

void reception_admit(struct pq *waiting, const char *name, int priority)
{
    struct patient p;

    strncpy(p.name, name, sizeof p.name - 1);
    p.name[sizeof p.name - 1] = '\0';
    p.priority = priority;
    p.arrival = next_ticket++;
    if (pq_push(waiting, &p)) {
        printf("admit  #%d %-8s priority %d (%d waiting)\n", p.arrival, p.name, priority, pq_size(waiting));
    } else {
        printf("waiting room full, %s sent elsewhere\n", name);
    }
}
