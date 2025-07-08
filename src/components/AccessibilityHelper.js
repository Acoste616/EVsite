import React, { useEffect, useState } from 'react';

const AccessibilityHelper = () => {
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState('normal');

  useEffect(() => {
    // Check for saved accessibility preferences
    const savedContrast = localStorage.getItem('highContrast') === 'true';
    const savedFontSize = localStorage.getItem('fontSize') || 'normal';

    setIsHighContrast(savedContrast);
    setFontSize(savedFontSize);

    // Apply initial settings
    if (savedContrast) {
      document.body.classList.add('high-contrast');
    }
    document.body.classList.add(`font-size-${savedFontSize}`);

    // Add keyboard navigation helpers
    const handleKeyDown = e => {
      // Skip to main content with Alt+M
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        const main =
          document.querySelector('main') ||
          document.querySelector('[role="main"]');
        if (main) {
          main.focus();
          main.scrollIntoView();
        }
      }

      // Skip to navigation with Alt+N
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        const nav =
          document.querySelector('nav') ||
          document.querySelector('[role="navigation"]');
        if (nav) {
          const firstLink = nav.querySelector('a, button');
          if (firstLink) firstLink.focus();
        }
      }

      // Toggle high contrast with Alt+C
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        toggleHighContrast();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Add focus indicators for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .high-contrast {
        filter: contrast(150%) brightness(120%);
      }
      
      .font-size-small { font-size: 14px; }
      .font-size-normal { font-size: 16px; }
      .font-size-large { font-size: 18px; }
      .font-size-xl { font-size: 20px; }

      /* Enhanced focus indicators */
      *:focus {
        outline: 3px solid #3B82F6 !important;
        outline-offset: 2px !important;
      }

      /* Skip link for screen readers */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #3B82F6;
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 1000;
      }
      
      .skip-link:focus {
        top: 6px;
      }

      /* High contrast mode adjustments */
      .high-contrast .bg-gray-900 { background-color: #000000 !important; }
      .high-contrast .bg-gray-800 { background-color: #1a1a1a !important; }
      .high-contrast .text-gray-400 { color: #ffffff !important; }
      .high-contrast .text-white { color: #ffffff !important; }
      .high-contrast .border-gray-700 { border-color: #ffffff !important; }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  const toggleHighContrast = () => {
    const newValue = !isHighContrast;
    setIsHighContrast(newValue);
    localStorage.setItem('highContrast', newValue.toString());

    if (newValue) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const changeFontSize = newSize => {
    // Remove old font size class
    document.body.classList.remove(`font-size-${fontSize}`);

    // Add new font size class
    setFontSize(newSize);
    localStorage.setItem('fontSize', newSize);
    document.body.classList.add(`font-size-${newSize}`);
  };

  return (
    <>
      {/* Skip link for screen readers */}
      <a href="#main-content" className="skip-link">
        Przejdź do głównej treści
      </a>

      {/* Accessibility controls */}
      <div
        className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg shadow-lg z-50"
        role="region"
        aria-label="Ustawienia dostępności"
      >
        <h3 className="text-white text-sm font-bold mb-2">Dostępność</h3>

        <div className="flex flex-col gap-2">
          <button
            onClick={toggleHighContrast}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
            aria-pressed={isHighContrast}
            aria-label={`${isHighContrast ? 'Wyłącz' : 'Włącz'} wysoki kontrast`}
          >
            {isHighContrast ? 'Wyłącz' : 'Włącz'} kontrast
          </button>

          <div className="flex gap-1">
            <button
              onClick={() => changeFontSize('small')}
              className={`text-xs px-2 py-1 rounded ${fontSize === 'small' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              aria-pressed={fontSize === 'small'}
              aria-label="Mała czcionka"
            >
              A-
            </button>
            <button
              onClick={() => changeFontSize('normal')}
              className={`text-xs px-2 py-1 rounded ${fontSize === 'normal' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              aria-pressed={fontSize === 'normal'}
              aria-label="Normalna czcionka"
            >
              A
            </button>
            <button
              onClick={() => changeFontSize('large')}
              className={`text-xs px-2 py-1 rounded ${fontSize === 'large' ? 'bg-blue-600' : 'bg-gray-600'} text-white`}
              aria-pressed={fontSize === 'large'}
              aria-label="Duża czcionka"
            >
              A+
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-300 mt-2">
          <p>Skróty klawiszowe:</p>
          <p>Alt+M - główna treść</p>
          <p>Alt+N - nawigacja</p>
          <p>Alt+C - kontrast</p>
        </div>
      </div>
    </>
  );
};

export default AccessibilityHelper;
