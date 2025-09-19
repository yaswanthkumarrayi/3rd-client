// Utility function to scroll to top of page
export const scrollToTop = (behavior = 'smooth') => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: behavior
  });
};

// Utility function to scroll to element with offset for fixed headers
export const scrollToElement = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Hook for automatic scroll to top on route changes
export const useScrollToTop = () => {
  const scrollToTopOnMount = () => {
    scrollToTop('instant');
  };

  return scrollToTopOnMount;
};