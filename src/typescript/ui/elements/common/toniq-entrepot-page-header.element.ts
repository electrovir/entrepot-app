import {css, defineElement, html} from 'element-vir';
import {toniqFontStyles} from '@toniq-labs/design-system';

export const EntrepotPageHeaderElement = defineElement<{headerText: string}>()({
    tagName: 'toniq-entrepot-page-header',
    styles: css`
        h1 {
            ${toniqFontStyles.h1Font}
            ${toniqFontStyles.extraBoldFont}
            margin: 0 32px;
        }

        @media (max-width: 1200px) {
            h1 {
                ${toniqFontStyles.h2Font}
                ${toniqFontStyles.extraBoldFont}
            }
        }
    `,
    renderCallback: ({inputs}) => {
        return html`
            <h1>${inputs.headerText}</h1>
        `;
    },
});
