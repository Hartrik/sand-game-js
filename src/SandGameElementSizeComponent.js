import {DomBuilder} from "./DomBuilder.js";

/**
 *
 * @author Patrik Harag
 * @version 2022-11-06
 */
export class SandGameElementSizeComponent {

    /** @type function(scale) */
    #selectFunction;

    #initialScale;
    #assetsContextPath;

    #selected = null;

    constructor(selectFunction, initialScale, assetsContextPath) {
        this.#selectFunction = selectFunction;
        this.#initialScale = initialScale;
        this.#assetsContextPath = assetsContextPath;
    }

    createNode() {
        let content = DomBuilder.div({class: 'element-size-options'}, []);
        for (let sizeDef of SandGameElementSizes.SIZES) {
            let node = this.#createSizeCard(sizeDef.scale, sizeDef.image);

            if (sizeDef.scale === this.#initialScale) {
                this.#selected = node;
                node.addClass('selected-size');
            }

            node.on('click', e => {
                if (this.#selected) {
                    this.#selected.removeClass('selected-size');
                }
                node.addClass('selected-size');
                this.#selected = node;
                this.#selectFunction(sizeDef.scale);
            })
            content.append(node);
        }

        return content;
    }

    /**
     *
     * @param scale {number}
     * @param image {string}
     */
    #createSizeCard(scale, image) {
        return DomBuilder.div({class: 'card'}, [
            DomBuilder.element('img', {src: image})
        ]);
    }
}

/**
 *
 * @author Patrik Harag
 * @version 2022-11-04
 */
class SandGameElementSizes {
    static SIZES = [
        {
            scale: 0.75,
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAACXBIWXMAAA7DAAAOwwHHb6hkAAACHUlEQVR4Xu3WQW6EMBBEUSJx3jkMF55s4ogQG2zTxeDi/10ijdxTb5HME1k3b39BXgFsHsDmAWwewOYBbB7A5gFsHsDmAWwewOYBbB7A5gFsHsDmAWwewOYBbB7A5gFsHsCrlmV5r39+vV5f659HDOCftrjpd6MjAzzlcVOjIz8eeA83NTLyo4FrcFOjIj8WuAU3NSLyI4F7cFOjIT8O+AxuaiTkRwFH4KZGQX4McCRuagTkjwGvB1ePpMBN3R35I8DbwZUjbd9SpLz/bJcDlwZXjFR6S5Hi/oguBT4aPHKko7cURd4f1WXAtYNHjFT7lqKI+yO7BLh18DMjtb6l6Mz90cmBewfvGan3LUU99yuSAp8dvGWks28parlflQw4avCakaLeUlRzvzIJcPTgeyNFv6Vo73514cCqwXMjqd5SlLu/1Pp71X6mVCiwevD1SOq3FNUgb79XzWf2CgPeHqbqqndU7YGVvtveZ44KAS4dRvlyYEcb5j5T02ngo8MoX8+fmx7kU8C1h1G+nv1akbuBe46jmFqQu4DB/Xy1yM3A4N6nGuQmYHDv1xFyNTC4920PuQoY3PtXQj4EBneccsi7wOCO1xa5CAzuuK2Rs8Dgjl9C/gcMrk/Lsrz/AIPr1y8wuJ7N0wSuczO43v37J4u8Atg8gM0D2DyAzQPYPIDNA9g8gM0D2DyAzQPYPIDNA9g8gM0D2DyAzQPYvG9K/XJS29iPWwAAAABJRU5ErkJggg=='
        },
        {
            scale: 0.5,
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABSElEQVR4Xu3WQQ6EIBAFUUw8L4fxwjN78xedQBDLeksiYbAysc8mtPO+IBYDwxkYzsBwBoYzMJyB4QwMZ2A4A8MZGM7AcAaGMzCcgeEMDGdgOAPDGRjOwK2167p+97Wk937c13ZnYDgDwxkYzsBwnwtcHaiStHf3wetzgb/GwHAGhjMw3JLAaThJZg8s1XNHpDNm32PEksB6joHhDAxnYLjpgdPQUZX2VgeWtPcp6bdU7zHb9MDai4HhDAxnYLihwGmYmG3FGSuke6TBq/pc1VBg7c/AcAaGMzBcOXD6+GtM9Z2m56qDVzmw3snAcAaGMzBcDJw+6tpLapQGrxhYHAaGMzCcgeHO9LHWO6WW/oPhDAxnYDgDwxkYzsBwBoYzMJyB4QwMZ2A4A8MZGM7AcAaGMzCcgeEMDGdgOAPDGRjOwHAGhjMw3B/1T0cI5HMokgAAAABJRU5ErkJggg=='
        },
        {
            scale: 0.375,
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAACXBIWXMAAA7DAAAOwwHHb6hkAAABGklEQVR4Xu3YMU7EMBQAUZBy3hwmF4Y+BforGcNO3itdOFZGLvyPD9KO+wItAscJHCdwnMBxAscJHCdwnMBxAscJHCdwnMBxAscJHCdwnMBxjw58XdfXfe3uPM/P+9o7eXTgJxA4TuA4geMEjhM4TuA4geO2Bt45WJh8a2Kyz6oz/4atgdlP4DiB4wSOEzhO4DiB4wSOWxZ4MhCYWLXPTpMz/9UwZFlg/ieB4wSOEzhO4DiB4wSOEzhuFHjykOdnq/7hqwOTUWDel8BxAscJHCdwnMBxAscJHHeseoCzx6u93OA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuA4geMEjhM4TuC4b6YQJX8pLssnAAAAAElFTkSuQmCC'
        },
        {
            scale: 0.25,
            image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAABQCAYAAADSm7GJAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAA+ElEQVR4Xu3ZsQ3DMAwAwRjwvBpGCye9KgMq7LzvSnbiQxXPD2nnOqBF4DiB4wSOEzhO4DiB4wSOEzhO4DiB4wSOEzhO4LjXBZ5zftfZVWOMY5093esCv43AcQLHCRwncJzAcQLHCRwncJzAcQLHCRwncJzAcVuBd05v/2jnvXedGrcC83wCxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECx507JzCuu2vPfnCcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHECxwkcJ3CcwHE/D68RYAgtpF0AAAAASUVORK5CYII='
        },
    ];
}