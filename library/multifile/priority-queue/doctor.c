/* doctor.c - the second user of the queue: it only ever pops. Neither this
 * file nor reception.c knows how the heap works inside. */
#include <stdio.h>
#include "doctor.h"

int doctor_treat_next(struct pq *waiting, const char *doctor)
{
    struct patient p;

    if (!pq_pop(waiting, &p)) {
        printf("%s: nobody waiting\n", doctor);
        return 0;
    }
    printf("treat  #%d %-8s priority %d by %s\n", p.arrival, p.name, p.priority, doctor);
    return 1;
}
