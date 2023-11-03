import $ from "jquery";

/**
 *
 * @version 2023-04-28
 * @author Patrik Harag
 */
export class DomBuilder {

    /**
     *
     * @param html {string}
     * @return {jQuery<HTMLElement>}
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
     * @param label {string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @param attributes {object|null}
     * @param handler {function(e)}
     * @return {jQuery<HTMLElement>}
     */
    static button(label, attributes = null, handler = null) {
        if (attributes === null) {
            attributes = {};
        }
        attributes['type'] = 'button';

        let button = DomBuilder.element('button', attributes, label);
        if (handler !== null) {
            button.on("click", handler);
        }
        return button;
    }
}

/**
 *
 * @version 2023-10-27
 * @author Patrik Harag
 */
DomBuilder.Bootstrap = class {

    /**
     *
     * @param bodyContent {string|jQuery<HTMLElement>|jQuery<HTMLElement>[]}
     * @return {jQuery<HTMLElement>}
     */
    static alertInfo(bodyContent) {
        return $(`<div class="alert alert-info alert-dismissible fade show" role="alert"></div>`)
            .append(bodyContent)
            .append($(`<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`));
    }

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
                DomBuilder.element('a', { class: 'card-link', 'data-bs-toggle': 'collapse', href: '#' + id}, title)
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
        if (window.bootstrap === undefined) {
            console.error('Bootstrap library not available');
        }

        if (window.bootstrap !== undefined) {
            let old = window.bootstrap.Tooltip.getInstance(node[0]);
            if (old) {
                old.dispose();
            }
        }

        node.attr('data-bs-toggle', 'tooltip');
        node.attr('data-bs-placement', 'top');
        if (typeof content === 'object') {
            node.attr('data-bs-html', 'true');
            node.attr('title', content.html());
        } else {
            node.attr('title', content);
        }

        if (window.bootstrap !== undefined) {
            new window.bootstrap.Tooltip(node[0]);
        }
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
            class: 'form-check-input',
            role: 'switch'
        });
        if (checked) {
            switchInput.attr('checked', 'true');
        }

        let control = DomBuilder.div({ class: 'form-check form-switch' }, [
            switchInput,
            DomBuilder.element('label', { class: 'form-check-label', for: id }, text)
        ]);

        if (handler !== null) {
            switchInput.on('click', () => {
                let checked = switchInput.prop('checked');
                handler(checked);
            });
        }
        return control;
    }

    /**
     *
     * @param labelContent {string|jQuery<HTMLElement>}
     * @param buttonClass {string} e.g. btn-primary
     * @param checked {boolean}
     * @param handler {function(boolean)}
     * @return {jQuery<HTMLElement>[]}
     */
    static toggleButton(labelContent, buttonClass, checked, handler = null) {
        let id = 'toggle-button_' + Math.floor(Math.random() * 999_999_999);

        let nodeInput = DomBuilder.element('input', {
            type: 'checkbox',
            class: 'btn-check',
            checked: checked,
            id: id
        });
        let nodeLabel = DomBuilder.element('label', {
            class: 'btn ' + buttonClass,
            for: id
        }, labelContent)

        nodeInput.change((e) => {
            handler(nodeInput.prop('checked'));
        });

        return [nodeInput, nodeLabel];
    }
}

/**
 *
 * @version 2023-04-02
 * @author Patrik Harag
 */
DomBuilder.BootstrapTable = class {

    #tableBody = DomBuilder.element('tbody');

    addRow(row) {
        this.#tableBody.append(row);
    }

    addRowBefore(row) {
        this.#tableBody.prepend(row);
    }

    createNode() {
        return DomBuilder.div({ class: 'table-responsive' })
            .append(DomBuilder.element('table', { class: 'table table-striped' })
                .append(this.#tableBody))
    }
}

/**
 *
 * @version 2023-10-29
 * @author Patrik Harag
 */
DomBuilder.BootstrapDialog = class {

    // will be removed after close
    #persistent = false;

    #additionalStyle = '';

    #headerNode = null;
    #bodyNode = null;
    #footerNodeChildren = [];

    #dialog = null;
    #dialogBootstrap = null;


    setPersistent(persistent) {
        this.#persistent = persistent;
    }

    setSizeLarge() {
        this.#additionalStyle = 'modal-lg';
    }

    setSizeExtraLarge() {
        this.#additionalStyle = 'modal-xl';
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
        let button = $(`<button type="button" class="btn btn-secondary" data-bs-dismiss="modal"></button>`)
            .text(buttonText);
        this.#footerNodeChildren.push(button)
    }

    addSubmitButton(buttonText, handler) {
        let button = $(`<button type="button" class="btn btn-primary" data-bs-dismiss="modal"></button>`)
            .text(buttonText)
            .on("click", handler);

        this.#footerNodeChildren.push(button)
    }

    addButton(button) {
        this.#footerNodeChildren.push(button);
    }

    show(dialogAnchor) {
        if (window.bootstrap === undefined) {
            console.error('Bootstrap library not available');
            return;
        }

        if (this.#dialog === null) {
            this.#dialog = $(`<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true"></div>`)
                .append($(`<div class="modal-dialog modal-dialog-centered ${this.#additionalStyle}"></div>`)
                    .append($(`<div class="modal-content"></div>`)
                        .append($(`<div class="modal-header"></div>`).append(this.#headerNode))
                        .append($(`<div class="modal-body"></div>`).append(this.#bodyNode))
                        .append($(`<div class="modal-footer"></div>`).append(this.#footerNodeChildren))
                    )
                );

            // add into DOM
            dialogAnchor.append(this.#dialog);
        }

        this.#dialogBootstrap = new window.bootstrap.Modal(this.#dialog[0]);

        if (!this.#persistent) {
            // remove from DOM after hide
            this.#dialog[0].addEventListener('hidden.bs.modal', e => {
                this.#dialog.remove();
            })
        }

        this.#dialogBootstrap.show();
    }

    hide() {
        if (this.#dialog !== null) {
            this.#dialogBootstrap.hide();
        }
    }
}

/**
 *
 * @version 2023-11-03
 * @author Patrik Harag
 */
DomBuilder.BootstrapToast = class {

    #headerNode = null;
    #bodyNode = null;

    #toast = null;
    #toastBootstrap = null;

    #dataDelay = 20000;  // ms

    setHeaderContent(headerNode) {
        if (typeof headerNode === 'string') {
            headerNode = DomBuilder.element('strong', headerNode);
        }
        this.#headerNode = DomBuilder.span(headerNode, { class: 'me-auto' });
    }

    setBodyContent(bodyNode) {
        this.#bodyNode = bodyNode;
    }

    setDelay(milliseconds) {
        this.#dataDelay = milliseconds;
    }

    show(dialogAnchor) {
        if (window.bootstrap === undefined) {
            console.error('Bootstrap library not available');
            return;
        }

        const wrapper = $(`<div class="position-fixed bottom-0 right-0 p-3" style="z-index: 5; right: 0; bottom: 0;"></div>`)
            .append(this.#toast = $(`<div class="toast hide" role="alert" aria-live="assertive" aria-atomic="true" data-delay="${this.#dataDelay}">`)
                .append($(`<div class="toast-header"></div>`)
                    .append(this.#headerNode)
                    .append($(`<button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>`))
                )
                .append($(`<div class="toast-body"></div>`)
                    .append(this.#bodyNode)
                )
            );

        // add into DOM
        dialogAnchor.append(wrapper);

        this.#toastBootstrap = new window.bootstrap.Toast(this.#toast[0]);

        // remove from DOM after hide
        this.#toast.on('hidden.bs.toast', () => {
            wrapper.remove();
        });

        this.#toastBootstrap.show();
    }

    hide() {
        if (this.#toast !== null) {
            this.#toastBootstrap.hide();
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
            form.append(DomBuilder.div({ class: 'mb-3' }, [
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
