/* pq.h - a priority queue of patients, kept as a binary heap.
 * The most urgent patient (lowest priority number) always comes out first;
 * ties go to whoever arrived earlier. */
#ifndef PQ_H
#define PQ_H

#define PQ_CAP 16

struct patient {
    char name[12];
    int priority;   /* 1 = critical ... 5 = minor */
    int arrival;    /* ticket number, breaks ties */
};

struct pq {
    struct patient items[PQ_CAP];
    int count;
};

void pq_init(struct pq *q);
int pq_push(struct pq *q, const struct patient *p);
int pq_pop(struct pq *q, struct patient *out);
int pq_size(const struct pq *q);

#endif
