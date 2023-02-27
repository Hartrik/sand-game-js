/**
 *
 * @author Patrik Harag
 * @version 2023-02-27
 */
export class CircleIterator {

    // This may look ugly but it's all I need

    static BLUEPRINT_4 = [
        '   444   ',
        '  43334',
        ' 4322234',
        '432111234',
        '432101234',
        '432111234',
        ' 4322234',
        '  43334',
        '   444'
    ];

    static BLUEPRINT_9 = [
        '       99999       ',
        '     998888899',
        '   9988777778899',
        '  998776666677899',
        '  987665555566789',
        ' 98766554445566789',
        ' 98765543334556789',
        '9876554322234556789',
        '9876543211123456789',
        '9876543210123456789',
        '9876543211123456789',
        '9876554322234556789',
        ' 98765543334556789',
        ' 98766554445566789',
        '  987665555566789',
        '  998776666677899',
        '   9988777778899',
        '     998888899',
        '       99999'
    ];

    /**
     *
     * @param blueprint {string[]}
     * @param handler {function(dx: number, dy: number, level: number)}
     */
    static iterate(blueprint, handler) {
        const w = blueprint[0].length;
        const h = blueprint.length;
        const offsetX = Math.trunc(w / 2);
        const offsetY = Math.trunc(h / 2);

        for (let i = 0; i < blueprint.length; i++) {
            const row = blueprint[i];
            for (let j = 0; j < row.length; j++) {
                const char = row.charAt(j);
                if (char !== ' ') {
                    handler(j - offsetX, i - offsetY, +char);
                }
            }
        }
    }
}