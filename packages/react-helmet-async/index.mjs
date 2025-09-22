import React, { useEffect, useLayoutEffect } from 'react';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const useIsomorphicEffect = isBrowser ? useLayoutEffect : useEffect;

const toText = value => {
  if (value == null) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(item => toText(item)).join('');
  }

  return String(value);
};

function HelmetProvider({ children }) {
  return React.createElement(React.Fragment, null, children);
}

function Helmet({ children }) {
  useIsomorphicEffect(() => {
    if (!isBrowser) {
      return undefined;
    }

    const managedMeta = [];
    let previousTitle;

    React.Children.forEach(children, child => {
      if (!React.isValidElement(child)) {
        return;
      }

      if (child.type === 'title') {
        previousTitle = document.title;
        document.title = toText(child.props.children);
        return;
      }

      if (child.type === 'meta') {
        const { name, property, content } = child.props || {};
        if (!name && !property) {
          return;
        }

        const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;

        let element = document.head.querySelector(selector);
        const created = !element;
        if (!element) {
          element = document.createElement('meta');
          if (name) {
            element.setAttribute('name', name);
          }
          if (property) {
            element.setAttribute('property', property);
          }
          element.setAttribute('data-helmet-managed', 'true');
          document.head.appendChild(element);
        }

        const previousContent = element.getAttribute('content');
        if (typeof content === 'string') {
          element.setAttribute('content', content);
        } else if (content == null) {
          element.removeAttribute('content');
        } else {
          element.setAttribute('content', String(content));
        }

        managedMeta.push({ element, created, previousContent });
      }
    });

    return () => {
      if (!isBrowser) {
        return;
      }

      managedMeta.forEach(({ element, created, previousContent }) => {
        if (!element) {
          return;
        }

        if (created && element.parentNode) {
          element.parentNode.removeChild(element);
          return;
        }

        if (previousContent == null) {
          element.removeAttribute('content');
        } else {
          element.setAttribute('content', previousContent);
        }
      });

      if (previousTitle !== undefined) {
        document.title = previousTitle;
      }
    };
  }, [children]);

  return null;
}

const helmetExports = {
  HelmetProvider,
  Helmet,
};

export { HelmetProvider, Helmet };
export default helmetExports;
