/* vec.h - a growable array of doubles, like a list in other languages.
 * The struct is small and lives wherever the caller puts it; the elements
 * live in a heap block that is replaced by a bigger one when it fills. */
#ifndef VEC_H
#define VEC_H

typedef struct {
    double *data;
    int len;
    int cap;
} Vec;

void vec_init(Vec *v);
void vec_free(Vec *v);
int vec_push(Vec *v, double x);
double vec_pop(Vec *v);
double vec_get(const Vec *v, int i);
void vec_insert(Vec *v, int at, double x);
void vec_remove(Vec *v, int at);
int vec_grow_count(void);

#endif
