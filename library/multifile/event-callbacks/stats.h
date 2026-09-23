#ifndef STATS_H
#define STATS_H

struct stats {
    int events_seen;
    int best_gain;
    int levels;
};

void stats_install(struct stats *s);
void stats_print(const struct stats *s);
#endif
