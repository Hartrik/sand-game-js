
/**
 *
 * @version 2023-12-21
 * @author Patrik Harag
 */
export class DomBuilder {

    /**
     *
     * @param element {HTMLElement}
     * @param content {null|string|Node|(null|string|Node)[]}
     */
    static addContent(element, content) {
        if (content === null) {
            // ignore
        } else if (typeof content === 'string') {
            element.textContent = content;
        } else if (content instanceof Node) {
            element.appendChild(content);
        } else if (Array.isArray(content)) {
            for (const item of content) {
                if (item instanceof Node) {
                    element.appendChild(item);
                } else if (typeof item === 'string') {
                    element.insertAdjacentText('beforeend', item);
                } else if (item === null) {
                    // ignore
                } else {
                    throw 'Content type not supported: ' + (typeof item);
                }
            }
        } else {
            throw 'Content type not supported: ' + (typeof content);
        }
    }

    /**
     *
     * @param element {HTMLElement}
     * @param content {null|string|Node|(Node|null)[]}
     */
    static setContent(element, content) {
        element.innerHTML = '';
        DomBuilder.addContent(element, content);
    }

    /**
     *
     * @param element {HTMLElement}
     * @param attributes {object|null}
     */
    static putAttributes(element, attributes) {
        for (const key in attributes) {
            const value = attributes[key];
            const type = typeof value;

            if (type === 'string' || type === 'boolean' || type === 'number') {
                element.setAttribute(key, value);
            } else if (key === 'style' && type === 'object') {
                Object.assign(element.style, value);
            } else if (value === null) {
                // ignore
            } else {
                throw 'Unsupported attribute type: ' + (typeof value);
            }
        }
    }

    /**
     *
     * @param html {string}
     * @return {HTMLElement}
     */
    static create(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstElementChild;
    }

    /**
     *
     * @param name {string}
     * @param attributes {object|null}
     * @param content {null|string|HTMLElement|HTMLElement[]}
     * @return {HTMLElement}
     */
    static element(name, attributes = null, content = null) {
        const element = document.createElement(name);

        // attributes
        DomBuilder.putAttributes(element, attributes);

        // content
        DomBuilder.addContent(element, content);

        return element;
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|string|HTMLElement|HTMLElement[]}
     * @return {HTMLElement}
     */
    static div(attributes = null, content = null) {
        return DomBuilder.element('div', attributes, content);
    }

    /**
     *
     * @param attributes {object|null}
     * @param content {null|string|HTMLElement|HTMLElement[]}
     * @return {HTMLElement}
     */
    static par(attributes = null, content = null) {
        return DomBuilder.element('p', attributes, content);
    }

    /**
     *
     * @param text {string|null}
     * @param attributes {object|null}
     * @return {HTMLElement}
     */
    static span(text = null, attributes = null) {
        return DomBuilder.element('span', attributes, text);
    }

    /**
     *
     * @param text {string}
     * @param attributes {object|null}
     * @param handler {function()}
     * @return {HTMLElement}
     */
    static link(text, attributes = null, handler = null) {
        const link = DomBuilder.element('a', attributes, text);
        if (handler !== null) {
            link.href = 'javascript:void(0)';
            link.addEventListener('click', handler);
        }
        return link;
    }

    /**
     *
     * @param label {string|HTMLElement|HTMLElement[]}
     * @param attributes {object|null}
     * @param handler {function()}
     * @return {HTMLElement}
     */
    static button(label, attributes = null, handler = null) {
        if (attributes === null) {
            attributes = {};
        }
        attributes['type'] = 'button';

        const button = DomBuilder.element('button', attributes, label);
        if (handler !== null) {
            button.addEventListener('click', handler);
        }
        return button;
    }

    // bootstrap methods

    /**
     *
     * @param bodyContent {string|HTMLElement}
     * @return {HTMLElement}
     */
    static bootstrapAlertInfo(bodyContent) {
        const alertDiv = DomBuilder.div({ class: 'alert alert-info alert-dismissible fade show', role: 'alert' });
        DomBuilder.addContent(alertDiv, bodyContent);
        alertDiv.append(DomBuilder.button(null, { type: 'button', class: 'btn-close', 'data-bs-dismiss': 'alert', 'aria-label': 'Close' }));
        return alertDiv;
    }

    /**
     *
     * @param headerContent {string|HTMLElement|HTMLElement[]}
     * @param bodyContent {string|HTMLElement|HTMLElement[]}
     * @param attributes {object|null}
     * @return {HTMLElement}
     */
    static bootstrapCard(headerContent, bodyContent, attributes = null) {
        if (attributes === null) {
            attributes = {};
        }
        if (attributes.class === undefined) {
            attributes.class = 'card';
        }

        const card = DomBuilder.div(attributes);

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
     * @param bodyContent {string|HTMLElement|HTMLElement[]}
     * @return {HTMLElement}
     */
    static bootstrapCardCollapsable(title, collapsed, bodyContent) {
        const id = 'collapsable_' + Math.floor(Math.random() * 999_999_999);

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
     * @param content {string|HTMLElement}
     * @param node {HTMLElement}
     * @return {HTMLElement}
     */
    static bootstrapInitTooltip(content, node) {
        if (window.bootstrap === undefined) {
            console.error('Bootstrap library not available');
            return node;
        }

        const old = new window.bootstrap.Tooltip(node);
        if (old) {
            old.dispose();
        }

        node.setAttribute('data-bs-toggle', 'tooltip');
        node.setAttribute('data-bs-placement', 'top');
        if (typeof content === 'object') {
            node.setAttribute('data-bs-html', 'true');
            node.setAttribute('title', content.innerHTML);
        } else {
            node.setAttribute('title', content);
        }

        new window.bootstrap.Tooltip(node);
        return node;
    }

    /**
     *
     * @param text {string}
     * @param checked {boolean}
     * @param handler {function(boolean)}
     * @return {HTMLElement}
     */
    static bootstrapSwitchButton(text, checked, handler = null) {
        const id = 'switch-button_' + Math.floor(Math.random() * 999_999_999);

        const switchInput = DomBuilder.element('input', {
            type: 'checkbox',
            id: id,
            class: 'form-check-input',
            role: 'switch',
            checked: checked
        });

        const control = DomBuilder.div({ class: 'form-check form-switch' }, [
            switchInput,
            DomBuilder.element('label', { class: 'form-check-label', for: id }, text)
        ]);

        if (handler !== null) {
            switchInput.addEventListener('click', () => {
                handler(switchInput.checked);
            });
        }
        return control;
    }

    /**
     *
     * @param labelContent {string|HTMLElement}
     * @param buttonClass {string} e.g. btn-primary
     * @param checked {boolean}
     * @param handler {function(boolean)}
     * @return {HTMLElement[]}
     */
    static bootstrapToggleButton(labelContent, buttonClass, checked, handler = null) {
        const id = 'toggle-button_' + Math.floor(Math.random() * 999_999_999);

        const nodeInput = DomBuilder.element('input', {
            type: 'checkbox',
            class: 'btn-check',
            checked: checked,
            id: id
        });
        const nodeLabel = DomBuilder.element('label', {
            class: 'btn ' + buttonClass,
            for: id
        }, labelContent);

        nodeInput.addEventListener('change', (e) => {
            if (handler !== null) {
                handler(nodeInput.checked);
            }
        });

        return [nodeInput, nodeLabel];
    }

    static bootstrapTableBuilder() {
        return new BootstrapTable();
    }

    static bootstrapDialogBuilder() {
        return new BootstrapDialog();
    }

    static bootstrapToastBuilder() {
        return new BootstrapToast();
    }

    static bootstrapSimpleFormBuilder() {
        return new BootstrapSimpleForm();
    }
}

/**
 *
 * @version 2023-12-21
 * @author Patrik Harag
 */
class BootstrapTable {

    #tableBody = DomBuilder.element('tbody');

    addRow(row) {
        this.#tableBody.appendChild(row);
    }

    addRowBefore(row) {
        this.#tableBody.insertBefore(row, this.#tableBody.firstChild);
    }

    createNode() {
        const table = DomBuilder.element('table', { class: 'table table-striped' });
        table.appendChild(this.#tableBody);

        const tableResponsive = DomBuilder.div({ class: 'table-responsive' });
        tableResponsive.appendChild(table);

        return tableResponsive;
    }
}

/**
 *
 * @version 2023-12-24
 * @author Patrik Harag
 */
class BootstrapDialog {

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
        const button = DomBuilder.element('button', { type: 'button', class: 'btn btn-secondary', 'data-bs-dismiss': 'modal' }, buttonText);
        this.#footerNodeChildren.push(button);
    }

    addSubmitButton(buttonText, handler) {
        const button = DomBuilder.element('button', { type: 'button', class: 'btn btn-primary', 'data-bs-dismiss': 'modal' }, buttonText);
        button.addEventListener('click', handler);
        this.#footerNodeChildren.push(button);
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
            this.#dialog = DomBuilder.div({ class: 'modal fade', tabindex: '-1', role: 'dialog', 'aria-hidden': 'true' }, [
                DomBuilder.div({ class: `modal-dialog modal-dialog-centered ${this.#additionalStyle}` }, [
                    DomBuilder.div({ class: 'modal-content' }, [
                        DomBuilder.div({ class: 'modal-header' }, this.#headerNode),
                        DomBuilder.div({ class: 'modal-body' }, this.#bodyNode),
                        DomBuilder.div({ class: 'modal-footer' }, this.#footerNodeChildren)
                    ])
                ])
            ]);

            // add into DOM
            dialogAnchor.appendChild(this.#dialog);
        }

        this.#dialogBootstrap = new window.bootstrap.Modal(this.#dialog);

        if (!this.#persistent) {
            // remove from DOM after hide
            this.#dialog.addEventListener('hidden.bs.modal', () => {
                dialogAnchor.removeChild(this.#dialog);
            });
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
 * @version 2023-12-22
 * @author Patrik Harag
 */
class BootstrapToast {

    #headerNode = null;
    #bodyNode = null;

    #toast = null;
    #toastBootstrap = null;

    #dataDelay = 1000 * 60 * 60;  // ms

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

        const wrapperAttributes = {
            class: 'position-fixed bottom-0 right-0 p-3',
            style: 'z-index: 5; right: 0; bottom: 0;'
        };
        const toastAttributes = {
            class: 'toast hide',
            role: 'alert',
            'aria-live': 'assertive',
            'aria-atomic': 'true',
            'data-bs-delay': this.#dataDelay
        };
        const wrapper = DomBuilder.div(wrapperAttributes, [
            this.#toast = DomBuilder.div(toastAttributes, [
                DomBuilder.div({ class: 'toast-header' }, [
                    this.#headerNode,
                    DomBuilder.button('', {
                        type: 'button',
                        class: 'btn-close',
                        'data-bs-dismiss': 'toast',
                        'aria-label': 'Close'
                    })
                ]),
                DomBuilder.div({ class: 'toast-body' }, [
                    this.#bodyNode,

                ])
            ])
        ]);

        // add into DOM
        dialogAnchor.append(wrapper);

        this.#toastBootstrap = new window.bootstrap.Toast(this.#toast);

        // remove from DOM after hide
        this.#toast.addEventListener('hidden.bs.toast', () => {
            dialogAnchor.removeChild(wrapper);
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
 * @version 2023-12-22
 * @author Patrik Harag
 */
class BootstrapSimpleForm {

    /** @type {{key:string,label:string,input:HTMLElement}[]} */
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
            input.value = initialValue;
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
            data[formField.key] = formField.input.value;
        }
        return data;
    }
}
