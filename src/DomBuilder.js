
/**
 *
 * @version 2023-04-28
 * @author Patrik Harag
 */
export class DomBuilder {

    /**
     *
     * @param html {string}
     * @return {JQuery<HTMLElement>}
     */
    static create(html) {
        return $(html);
    }

    /**
     *
     * @param name {string}
     * @param attributes {object|null}
     * @param content {null|string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @return {jQuery<HTMLElement>}
     */
    static element(name, attributes = null, content = null) {
        let element = $(`<${name}>`);
        if (attributes !== null) {
            for (let key in attributes) {
                element.attr(key, attributes[key]);
            }
        }
        if (content === null) {
            // nothing
        } else if (typeof content === 'string') {
            element.text(content);
        } else {
            element.append(content);
        }
        return element;
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @return {jQuery<HTMLElement>}
     */
    static div(attributes = null, content = null) {
        return DomBuilder.element('div', attributes, content);
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @return {jQuery<HTMLElement>}
     */
    static par(attributes = null, content = null) {
        return DomBuilder.element('p', attributes, content);
    }

    /**
     *
     * @param text {string|null}
     * @param attributes {object|null}
     * @return {jQuery<HTMLElement>}
     */
    static span(text = null, attributes = null) {
        return DomBuilder.element('span', attributes, text);
    }

    /**
     *
     * @param text {string}
     * @param attributes {object|null}
     * @param handler {function(e)}
     * @return {jQuery<HTMLElement>}
     */
    static link(text, attributes = null, handler = null) {
        let link = DomBuilder.element('a', attributes, text);
        if (handler !== null) {
            link.attr('href', 'javascript:void(0)');
            link.on("click", handler);
        }
        return link;
    }

    /**
     *
     * @param text {string}
     * @param attributes {object|null}
     * @param handler {function(e)}
     * @return {jQuery<HTMLElement>}
     */
    static button(text, attributes = null, handler = null) {
        if (attributes === null) {
            attributes = {};
        }
        attributes['type'] = 'button';

        let button = DomBuilder.element('button', attributes, text);
        if (handler !== null) {
            button.on("click", handler);
        }
        return button;
    }
}

/**
 *
 * @version 2022-10-02
 * @author Patrik Harag
 */
DomBuilder.Bootstrap = class {

    /**
     *
     * @param headerContent {string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @param bodyContent {string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @param attributes {object|null}
     * @return {jQuery<HTMLElement>}
     */
    static card(headerContent, bodyContent, attributes = null) {
        if (attributes === null) {
            attributes = {};
        }
        if (attributes.class === undefined) {
            attributes.class = 'card';
        }

        let card = DomBuilder.div(attributes);

        if (headerContent) {
            card.append(DomBuilder.div({ class: 'card-header' }, headerContent));
        }

        card.append(DomBuilder.div({ class: 'card-body' }, bodyContent));
        return card;
    }

    /**
     *
     * @param title {string}
     * @param collapsed {boolean}
     * @param bodyContent {string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @return {jQuery<HTMLElement>}
     */
    static cardCollapsable(title, collapsed, bodyContent) {
        let id = 'collapsable_' + Math.floor(Math.random() * 999_999_999);

        return DomBuilder.div({ class: 'card' }, [
            DomBuilder.div({ class: 'card-header' }, [
                DomBuilder.element('a', { class: 'card-link', 'data-toggle': 'collapse', href: '#' + id}, title)
            ]),
            DomBuilder.div({ id: id, class: (collapsed ? 'collapse' : 'collapse show') }, [
                DomBuilder.div({ class: 'card-body' }, bodyContent)
            ])
        ]);
    }

    /**
     *
     * @param node {jQuery<HTMLElement>}
     * @param content {string|jQuery<HTMLElement>}
     * @return {jQuery<HTMLElement>}
     */
    static initTooltip(content, node) {
        node.tooltip('dispose');  // remove old one if present

        node.attr('data-toggle', 'tooltip');
        node.attr('data-placement', 'top');
        if (typeof content === 'object') {
            node.attr('data-html', 'true');
            node.attr('title', content.html());
        } else {
            node.attr('title', content);
        }
        node.tooltip();
        return node;
    }

    /**
     *
     * @param text {string}
     * @param checked {boolean}
     * @param handler {function(boolean)}
     * @return {jQuery<HTMLElement>}
     */
    static switchButton(text, checked, handler = null) {
        let id = 'switch-button_' + Math.floor(Math.random() * 999_999_999);

        let switchInput = DomBuilder.element('input', {
            type: 'checkbox',
            id: id,
            class: 'custom-control-input',
            style: 'width: min-content;'
        });
        if (checked) {
            switchInput.attr('checked', 'true');
        }

        let control = DomBuilder.div({ class: 'custom-control custom-switch' }, [
            switchInput,
            DomBuilder.element('label', { class: 'custom-control-label', for: id }, text)
        ]);

        if (handler !== null) {
            switchInput.on('click', () => {
                let checked = switchInput.prop('checked');
                handler(checked);
            });
        }
        return control;
    }
}

/**
 *
 * @version 2022-03-18
 * @author Patrik Harag
 */
DomBuilder.BootstrapTable = class {

    #tableBody = DomBuilder.element('tbody');

    addRow(row) {
        this.#tableBody.append(row);
    }

    createNode() {
        return DomBuilder.div({ class: 'table-responsive' })
            .append(DomBuilder.element('table', { class: 'table table-striped' })
                .append(this.#tableBody))
    }
}

/**
 *
 * @version 2023-02-20
 * @author Patrik Harag
 */
DomBuilder.BootstrapDialog = class {

    // will be removed after close
    #persistent = false;

    #headerNode = null;
    #bodyNode = null;
    #footerNodeChildren = [];

    #dialog = null;


    setPersistent(persistent) {
        this.#persistent = persistent;
    }

    setHeaderContent(headerNode) {
        if (typeof headerNode === 'string') {
            this.#headerNode = DomBuilder.element('strong', null, headerNode);
        } else {
            this.#headerNode = headerNode;
        }
    }

    setBodyContent(bodyNode) {
        this.#bodyNode = bodyNode;
    }

    addCloseButton(buttonText) {
        let button = $(`<button type="button" class="btn btn-secondary" data-dismiss="modal"></button>`)
            .text(buttonText);
        this.#footerNodeChildren.push(button)
    }

    addSubmitButton(buttonText, handler) {
        let button = $(`<button type="button" class="btn btn-primary" data-dismiss="modal"></button>`)
            .text(buttonText)
            .on("click", handler);

        this.#footerNodeChildren.push(button)
    }

    addButton(button) {
        this.#footerNodeChildren.push(button);
    }

    show(dialogAnchor) {
        if (this.#dialog === null) {
            this.#dialog = $(`<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>`)
                .append($(`<div class="modal-dialog modal-dialog-centered"></div>`)
                    .append($(`<div class="modal-content"></div>`)
                        .append($(`<div class="modal-header"></div>`).append(this.#headerNode))
                        .append($(`<div class="modal-body"></div>`).append(this.#bodyNode))
                        .append($(`<div class="modal-footer"></div>`).append(this.#footerNodeChildren))
                    )
                );

            // add into DOM
            dialogAnchor.append(this.#dialog);
        }

        if (!this.#persistent) {
            // remove from DOM after hide
            this.#dialog.on('hidden.bs.modal', () => {
                this.#dialog.remove();
            });
        }

        this.#dialog.modal('show');
    }

    hide() {
        if (this.#dialog !== null) {
            this.#dialog.modal('hide');
        }
    }
}

/**
 *
 * @version 2022-09-24
 * @author Patrik Harag
 */
DomBuilder.BootstrapSimpleForm = class {

    #formFields = [];
    #submitButton = null;

    addTextArea(label, key, initialValue = '', rows = 8) {
        let input = DomBuilder.element('textarea', { class: 'form-control', rows: rows }, initialValue);
        this.#formFields.push({
            key: key,
            label: label,
            input: input
        });
        return input;
    }

    addInput(label, key, initialValue = '') {
        let input = DomBuilder.element('input', { class: 'form-control' });
        if (initialValue) {
            input.val(initialValue);
        }
        this.#formFields.push({
            key: key,
            label: label,
            input: input
        });
        return input;
    }

    addSubmitButton(text, handler) {
        this.#submitButton = DomBuilder.button(text, { class: 'btn btn-primary' }, e => {
            handler(this.getData());
        });
    }

    createNode() {
        let form = DomBuilder.element('form', { action: 'javascript:void(0);' });

        for (let formField of this.#formFields) {
            form.append(DomBuilder.div({ class: 'form-group' }, [
                DomBuilder.element('label', null, formField.label),
                formField.input
            ]));
        }

        if (this.#submitButton) {
            form.append(this.#submitButton);
        }

        return form;
    }

    getData() {
        let data = {};
        for (let formField of this.#formFields) {
            data[formField.key] = formField.input.val();
        }
        return data;
    }
}
