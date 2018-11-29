function* range(start, end, step, f) {
    for (var i = start; i < end; i += step) {
        yield f(i);
    }
}
