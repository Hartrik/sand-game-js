Brushes.join([
    Brushes.color(155, 155, 155, BrushDefs.WALL),
    Brushes.colorNoise([
        { seed: 40, factor: 60, threshold: 0.4, force: 0.9 },
        { seed: 41, factor: 30, threshold: 0.4, force: 0.9 },
        { seed: 42, factor: 15, threshold: 0.4, force: 0.5 },
        { seed: 43, factor: 3, threshold: 0.1, force: 0.1 },
    ], 79, 69, 63),
    Brushes.colorNoise([
        { seed: 51, factor: 30, threshold: 0.4, force: 0.9 },
        { seed: 52, factor: 15, threshold: 0.4, force: 0.5 },
        { seed: 53, factor: 3, threshold: 0.1, force: 0.1 },
    ], 55, 48, 46),
    Brushes.colorNoise([
        { seed: 61, factor: 30, threshold: 0.4, force: 0.9 },
        { seed: 62, factor: 15, threshold: 0.4, force: 0.5 },
        { seed: 63, factor: 3, threshold: 0.1, force: 0.1 },
    ], 33, 29, 28)
]);