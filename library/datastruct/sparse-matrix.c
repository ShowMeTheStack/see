/*
 * title: Sparse matrices as lists of non-zero entries
 * level: 3
 * about: Stores only the non-zero cells of large matrices in sorted linked lists per row, then adds and multiplies them and prints how much memory was saved.
 */
#include <stdio.h>
#include <stdlib.h>

#define ROWS 6
#define COLS 6

/* Most cells of a sparse matrix are zero, so we keep only the others. Each
   row is a linked list of (column, value) cells sorted by column. A 1000 x
   1000 matrix with 50 entries needs 50 cells, not a million numbers. */
struct cell {
    int col;
    double value;
    struct cell *next;
};

struct sparse {
    struct cell *row[ROWS];
    int nonzero;
};

void sp_init(struct sparse *m)
{
    int r;
    for (r = 0; r < ROWS; r++)
        m->row[r] = NULL;
    m->nonzero = 0;
}

/* Add v to cell (r, c), creating, updating or removing it as needed. */
void sp_add(struct sparse *m, int r, int c, double v)
{
    struct cell **pp = &m->row[r], *cell;
    while (*pp != NULL && (*pp)->col < c)
        pp = &(*pp)->next;
    if (*pp != NULL && (*pp)->col == c) {
        (*pp)->value += v;
        if ((*pp)->value == 0.0) {         /* became zero: drop the cell */
            cell = *pp;
            *pp = cell->next;
            free(cell);
            m->nonzero--;
        }
        return;
    }
    if (v == 0.0)
        return;
    cell = malloc(sizeof *cell);
    if (cell == NULL)
        exit(1);
    cell->col = c;
    cell->value = v;
    cell->next = *pp;
    *pp = cell;
    m->nonzero++;
}

double sp_get(const struct sparse *m, int r, int c)
{
    const struct cell *p;
    for (p = m->row[r]; p != NULL && p->col <= c; p = p->next)
        if (p->col == c)
            return p->value;
    return 0.0;
}

/* C = A * B. Each non-zero A[r][k] meets only the non-zero cells of row k
   of B, so zero cells never cost any work at all. */
void sp_mul(const struct sparse *a, const struct sparse *b, struct sparse *c)
{
    int r;
    const struct cell *x, *y;
    sp_init(c);
    for (r = 0; r < ROWS; r++)
        for (x = a->row[r]; x != NULL; x = x->next)
            for (y = b->row[x->col]; y != NULL; y = y->next)
                sp_add(c, r, y->col, x->value * y->value);
}

void sp_print(const char *name, const struct sparse *m)
{
    int r, c;
    printf("%s (%d non-zero):\n", name, m->nonzero);
    for (r = 0; r < ROWS; r++) {
        for (c = 0; c < COLS; c++) {
            double v = sp_get(m, r, c);
            if (v == 0.0)
                printf("    .");
            else
                printf(" %4g", v);
        }
        printf("\n");
    }
}

void sp_free(struct sparse *m)
{
    int r;
    for (r = 0; r < ROWS; r++)
        while (m->row[r] != NULL) {
            struct cell *dead = m->row[r];
            m->row[r] = dead->next;
            free(dead);
        }
    m->nonzero = 0;
}

int main(void)
{
    struct sparse a, b, c;
    int i;

    sp_init(&a);
    sp_init(&b);
    /* A: a few scattered entries. */
    sp_add(&a, 0, 0, 2);  sp_add(&a, 1, 3, 5);  sp_add(&a, 2, 1, -1);
    sp_add(&a, 4, 4, 3);  sp_add(&a, 5, 0, 1);  sp_add(&a, 5, 5, 7);
    /* B: the identity with a twist. */
    for (i = 0; i < ROWS; i++)
        sp_add(&b, i, i, 1);
    sp_add(&b, 3, 0, 4);
    sp_add(&b, 0, 5, 2);

    sp_print("A", &a);
    sp_print("B", &b);
    sp_mul(&a, &b, &c);
    sp_print("A x B", &c);

    /* Adding -A[1][3] removes that cell from the list entirely. */
    sp_add(&a, 1, 3, -5);
    sp_print("A with (1,3) cancelled", &a);

    printf("dense storage: %d bytes; these cells: %d bytes\n",
           (int)(ROWS * COLS * sizeof(double)), (int)(c.nonzero * sizeof(struct cell)));

    sp_free(&a);
    sp_free(&b);
    sp_free(&c);
    return 0;
}
