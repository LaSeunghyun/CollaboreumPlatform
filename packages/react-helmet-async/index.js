import { Children, isValidElement, useEffect } from 'react';

function extractTitle(children) {
  let resolvedTitle;

  Children.forEach(children, child => {
    if (resolvedTitle || !isValidElement(child)) {
      return;
    }

    if (child.type === 'title') {
      const value = child.props?.children;
      if (typeof value === 'string') {
        resolvedTitle = value;
      } else if (Array.isArray(value)) {
        resolvedTitle = value
          .filter(segment => typeof segment === 'string')
          .join('');
      }
    }
  });

  return resolvedTitle;
}

export function HelmetProvider({ children } = {}) {
  return children ?? null;
}

export function Helmet({ children, title } = {}) {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const nextTitle =
      typeof title === 'string' ? title : extractTitle(children);

    if (typeof nextTitle === 'string') {
      document.title = nextTitle;
    }
  }, [children, title]);

  return null;
}

export default { HelmetProvider, Helmet };
