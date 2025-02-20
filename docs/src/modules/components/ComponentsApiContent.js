/* eslint-disable react/no-danger */
import * as React from 'react';
import PropTypes from 'prop-types';
import kebabCase from 'lodash/kebabCase';
import { exactProp } from '@mui/utils';
import { useTranslate, useUserLanguage } from 'docs/src/modules/utils/i18n';
import Divider from 'docs/src/modules/components/ApiDivider';
import PropsTable from 'docs/src/modules/components/PropretiesTable';
import HighlightedCode from 'docs/src/modules/components/HighlightedCode';
import MarkdownElement from 'docs/src/modules/components/MarkdownElement';

function ClassesTable(props) {
  const { componentStyles, classDescriptions } = props;
  const t = useTranslate();

  return (
    <table>
      <thead>
        <tr>
          <th align="left">{t('api-docs.ruleName')}</th>
          <th align="left">{t('api-docs.globalClass')}</th>
          <th align="left">{t('api-docs.description')}</th>
        </tr>
      </thead>
      <tbody>
        {componentStyles.classes.map((className) => (
          <tr key={className}>
            <td align="left">
              <span className="prop-name">{className}</span>
            </td>
            <td align="left">
              <span className="prop-name">
                .
                {componentStyles.globalClasses[className] || `${componentStyles.name}-${className}`}
              </span>
            </td>
            <td
              align="left"
              dangerouslySetInnerHTML={{
                __html:
                  classDescriptions[className] &&
                  classDescriptions[className].description
                    .replace(/{{conditions}}/, classDescriptions[className].conditions)
                    .replace(/{{nodeName}}/, classDescriptions[className].nodeName),
              }}
            />
          </tr>
        ))}
      </tbody>
    </table>
  );
}

ClassesTable.propTypes = {
  classDescriptions: PropTypes.object.isRequired,
  componentStyles: PropTypes.object.isRequired,
};

function getTranslatedHeader(t, header, text) {
  const translations = {
    demos: t('api-docs.demos'),
    import: t('api-docs.import'),
    'component-name': t('api-docs.componentName'),
    props: t('api-docs.props'),
    inheritance: t('api-docs.inheritance'),
    css: 'CSS',
  };

  return translations[header] || translations[text] || text || header;
}

function Heading(props) {
  const { hash, text, level: Level = 'h2' } = props;
  const t = useTranslate();

  return (
    <Level id={hash}>
      {getTranslatedHeader(t, hash, text)}
      <a aria-labelledby={hash} className="anchor-link" href={`#${hash}`} tabIndex={-1}>
        <svg>
          <use xlinkHref="#anchor-link-icon" />
        </svg>
      </a>
    </Level>
  );
}

Heading.propTypes = {
  hash: PropTypes.string.isRequired,
  level: PropTypes.string,
  text: PropTypes.string,
};

export default function ComponentsApiContent(props) {
  const { descriptions, pageContents } = props;
  const t = useTranslate();
  const userLanguage = useUserLanguage();

  const components = Object.keys(pageContents);
  const numberOfComponents = components.length;

  return components.map((key, idx) => {
    const {
      cssComponent,
      filename,
      forwardsRefTo,
      inheritance,
      name: componentName,
      props: componentProps,
      spread,
      styles: componentStyles,
    } = pageContents[key];

    const { classDescriptions, propDescriptions } = descriptions[key][userLanguage];

    const source = filename
      .replace(/\/packages\/mui(-(.+?))?\/src/, (match, dash, pkg) => `@mui/${pkg}`)
      // convert things like `/Table/Table.js` to ``
      .replace(/\/([^/]+)\/\1\.(js|tsx)$/, '');

    // The `ref` is forwarded to the root element.
    let refHint = t('api-docs.refRootElement');
    if (forwardsRefTo == null) {
      // The component cannot hold a ref.
      refHint = t('api-docs.refNotHeld');
    }

    let spreadHint = '';
    if (spread) {
      // Any other props supplied will be provided to the root element ({{spreadHintElement}}).
      spreadHint = t('api-docs.spreadHint').replace(
        /{{spreadHintElement}}/,
        inheritance
          ? `<a href="${inheritance.pathname}">${inheritance.component}</a>`
          : t('api-docs.nativeElement'),
      );
    }

    let inheritanceSuffix = '';
    if (inheritance && inheritance.component === 'Transition') {
      inheritanceSuffix = t('api-docs.inheritanceSuffixTransition');
    }

    const componentNameKebabCase = kebabCase(componentName);

    return (
      <React.Fragment key={`component-api-${key}`}>
        <MarkdownElement>
          <Heading hash={componentNameKebabCase} text={`${componentName} API`} />
          <Heading text="import" hash={`${componentNameKebabCase}-import`} level="h3" />
          <HighlightedCode
            code={`
import ${componentName} from '${source}/${componentName}';
// ${t('or')}
import { ${componentName} } from '${source}';`}
            language="jsx"
          />
          <span dangerouslySetInnerHTML={{ __html: t('api-docs.importDifference') }} />
          {componentStyles.name && (
            <React.Fragment>
              <Heading
                text="component-name"
                hash={`${componentNameKebabCase}-component-name`}
                level="h3"
              />
              <span
                dangerouslySetInnerHTML={{
                  __html: t('api-docs.styleOverrides').replace(
                    /{{componentStyles\.name}}/,
                    componentStyles.name,
                  ),
                }}
              />
            </React.Fragment>
          )}
          <Heading text="props" hash={`${componentNameKebabCase}-props`} level="h3" />
          <p dangerouslySetInnerHTML={{ __html: spreadHint }} />
          <PropsTable properties={componentProps} propertiesDescriptions={propDescriptions} />
          <br />
          {cssComponent && (
            <React.Fragment>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('api-docs.cssComponent').replace(/{{name}}/, componentName),
                }}
              />
              <br />
              <br />
            </React.Fragment>
          )}
          <span dangerouslySetInnerHTML={{ __html: refHint }} />
          {inheritance && (
            <React.Fragment>
              <Heading
                text="inheritance"
                hash={`${componentNameKebabCase}-inheritance`}
                level="h3"
              />
              <span
                dangerouslySetInnerHTML={{
                  __html: t('api-docs.inheritanceDescription')
                    .replace(/{{component}}/, inheritance.component)
                    .replace(/{{pathname}}/, inheritance.pathname)
                    .replace(/{{suffix}}/, inheritanceSuffix)
                    .replace(/{{componentName}}/, componentName),
                }}
              />
            </React.Fragment>
          )}
          {Object.keys(componentStyles.classes).length ? (
            <React.Fragment>
              <Heading text="css" hash={`${componentNameKebabCase}-css`} level="h3" />
              <ClassesTable
                componentStyles={componentStyles}
                classDescriptions={classDescriptions}
              />
              <br />
              <span dangerouslySetInnerHTML={{ __html: t('api-docs.overrideStyles') }} />
              <span
                dangerouslySetInnerHTML={{ __html: t('api-docs.overrideStylesStyledComponent') }}
              />
            </React.Fragment>
          ) : null}
        </MarkdownElement>
        <svg style={{ display: 'none' }} xmlns="http://www.w3.org/2000/svg">
          <symbol id="anchor-link-icon" viewBox="0 0 16 16">
            <path d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z" />
          </symbol>
        </svg>
        {idx < numberOfComponents - 1 && <Divider />}
      </React.Fragment>
    );
  });
}

ComponentsApiContent.propTypes = {
  descriptions: PropTypes.object.isRequired,
  pageContents: PropTypes.object.isRequired,
};

if (process.env.NODE_ENV !== 'production') {
  ComponentsApiContent.propTypes = exactProp(ComponentsApiContent.propTypes);
}
