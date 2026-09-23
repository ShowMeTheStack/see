#ifndef DOCTOR_H
#define DOCTOR_H
#include "pq.h"
int doctor_treat_next(struct pq *waiting, const char *doctor);
#endif
