/* asm.c - the assembler. It turns lines like
 *         loop:  LOAD 0
 *                JZ done
 * into numbers in the code array. A label can be used before it is
 * defined (JZ done comes before done:), so there are two passes:
 *   pass 1 works out the address of every label,
 *   pass 2 emits the code, now that every address is known. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "asm.h"

#define MAX_LINES 64
#define MAX_LABELS 16

static char lines[MAX_LINES][48];
static int nlines;

static char label_name[MAX_LABELS][16];
static int label_addr[MAX_LABELS];
static int nlabels;

static int find_op(const char *word)
{
    int op;
    for (op = 0; op < NUM_OPS; op++) {
        if (strcmp(op_name(op), word) == 0) {
            return op;
        }
    }
    return -1;
}

static int find_label(const char *word)
{
    int i;
    for (i = 0; i < nlabels; i++) {
        if (strcmp(label_name[i], word) == 0) {
            return label_addr[i];
        }
    }
    return -1;
}

/* Splits one line into an optional label, an opcode word and an argument
 * word. Anything after ";" is a comment. Missing fields come back empty. */
static void split(char *line, char *label, char *opw, char *argw)
{
    char *semi = strchr(line, ';');
    char *colon;
    char *rest = line;

    label[0] = opw[0] = argw[0] = '\0';
    if (semi != NULL) {
        *semi = '\0';
    }
    colon = strchr(line, ':');
    if (colon != NULL) {
        *colon = '\0';
        sscanf(line, "%15s", label);
        rest = colon + 1;
    }
    sscanf(rest, "%15s %15s", opw, argw);
}

int assemble(struct vm *m)
{
    char copy[48], label[16], opw[16], argw[16];
    int i, op, addr, pass, arg;

    nlines = 0;
    while (nlines < MAX_LINES && fgets(lines[nlines], sizeof lines[0], stdin) != NULL) {
        nlines++;
    }

    nlabels = 0;
    for (pass = 1; pass <= 2; pass++) {
        addr = 0;
        for (i = 0; i < nlines; i++) {
            strcpy(copy, lines[i]);         /* split() writes into its line */
            split(copy, label, opw, argw);
            if (pass == 1 && label[0] != '\0' && nlabels < MAX_LABELS) {
                strcpy(label_name[nlabels], label);
                label_addr[nlabels] = addr;
                nlabels++;
            }
            if (opw[0] == '\0') {
                continue;
            }
            op = find_op(opw);
            if (op < 0) {
                printf("line %d: unknown instruction %s\n", i + 1, opw);
                return 0;
            }
            if (pass == 2) {
                m->code[addr] = op;
            }
            addr++;
            if (op_has_arg(op)) {
                if (pass == 2) {
                    if (isdigit((unsigned char)argw[0]) || argw[0] == '-') {
                        arg = atoi(argw);
                    } else if ((arg = find_label(argw)) < 0) {
                        printf("line %d: no label called %s\n", i + 1, argw);
                        return 0;
                    }
                    m->code[addr] = arg;
                }
                addr++;
            }
        }
        m->ncode = addr;
    }
    return 1;
}

void disassemble(const struct vm *m)
{
    int pc = 0, op;

    while (pc < m->ncode) {
        op = m->code[pc];
        if (op_has_arg(op)) {
            printf("  %3d  %-5s %d\n", pc, op_name(op), m->code[pc + 1]);
            pc += 2;
        } else {
            printf("  %3d  %s\n", pc, op_name(op));
            pc++;
        }
    }
}
