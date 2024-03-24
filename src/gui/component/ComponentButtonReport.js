// Sand Game JS; Patrik Harag, https://harag.cz; all rights reserved

import ComponentButton from "./ComponentButton";
import ActionReportProblem from "../action/ActionReportProblem";
import DomBuilder from "../DomBuilder";

/**
 *
 * @author Patrik Harag
 * @version 2024-03-23
 */
export default class ComponentButtonReport extends ComponentButton {

    constructor(cssClass, errorReporter) {
        const label = [
            'Report',
            DomBuilder.span(' a\xa0problem', { class: 'visible-on-big-screen-only' })
        ];
        super(label, cssClass, new ActionReportProblem(errorReporter));
    }
}
