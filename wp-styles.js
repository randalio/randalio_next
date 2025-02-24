// Transform the style objects into CSS
function processStyleObjects(stylesData) {
  if (!stylesData || typeof stylesData !== 'object') {
    console.error('Invalid style data provided:', stylesData);
    return {};
  }

  return Object.entries(stylesData).reduce((acc, [sectionName, sectionData]) => {
    const cssRules = [];
    const className = `.is-style-${sectionName}`;

    // Process main section styles
    if (sectionData.color) {
      const mainStyles = [];
      if (sectionData.color.background) {
        mainStyles.push(`background-color: ${sectionData.color.background};`);
      }
      if (sectionData.color.text) {
        mainStyles.push(`color: ${sectionData.color.text};`);
      }
      if (sectionData.color.gradient) {
        mainStyles.push(`background-image: ${sectionData.color.gradient};`);
      }
      if (mainStyles.length > 0) {
        cssRules.push(`${className} {
  ${mainStyles.join('\n  ')}
}`);
      }
    }

    // Process block styles
    if (sectionData.blocks) {
      Object.entries(sectionData.blocks).forEach(([blockName, blockStyles]) => {
        const sanitizedBlockName = blockName.replace('core/', 'core-');
        
        // Process block color styles
        if (blockStyles.color) {
          const blockColorStyles = [];
          if (blockStyles.color.text) {
            blockColorStyles.push(`color: ${blockStyles.color.text};`);
          }
          if (blockStyles.color.background) {
            blockColorStyles.push(`background-color: ${blockStyles.color.background};`);
          }
          if (blockColorStyles.length > 0) {
            cssRules.push(`${className} .wp-block-${sanitizedBlockName} {
              ${blockColorStyles.join('\n  ')}
            }`);
          }
        }

        // Process block elements
        if (blockStyles.elements) {
          Object.entries(blockStyles.elements).forEach(([elementName, elementStyles]) => {
            if (elementStyles.color) {
              const elementColorStyles = [];
              if (elementStyles.color.text) {
                elementColorStyles.push(`color: ${elementStyles.color.text};`);
              }
              if (elementStyles.color.background) {
                elementColorStyles.push(`background-color: ${elementStyles.color.background};`);
              }
              if (elementColorStyles.length > 0) {
                cssRules.push(`${className} .wp-block-${sanitizedBlockName} ${elementName} {
                  ${elementColorStyles.join('\n  ')}
                }`);
              }
            }
          });
        }
      });
    }

    // Process elements styles
    if (sectionData.elements) {
      Object.entries(sectionData.elements).forEach(([elementName, elementStyles]) => {
        // Base element styles
        if (elementStyles.color) {
          const elementColorStyles = [];
          if (elementStyles.color.text) {
            elementColorStyles.push(`color: ${elementStyles.color.text};`);
          }
          if (elementStyles.color.background) {
            elementColorStyles.push(`background-color: ${elementStyles.color.background};`);
          }
          if (elementColorStyles.length > 0) {
            cssRules.push(`${className} ${elementName} {
              ${elementColorStyles.join('\n  ')}
            }`);
          }
        }

        // Handle pseudo-classes (like :hover)
        Object.entries(elementStyles).forEach(([key, styles]) => {
          if (key.startsWith(':') && styles.color) {
            const pseudoColorStyles = [];
            if (styles.color.text) {
              pseudoColorStyles.push(`color: ${styles.color.text};`);
            }
            if (styles.color.background) {
              pseudoColorStyles.push(`background-color: ${styles.color.background};`);
            }
            if (pseudoColorStyles.length > 0) {
              cssRules.push(`${className} ${elementName}${key} {
                ${pseudoColorStyles.join('\n  ')}
              }`);
            }
          }
        });
      });
    }

    acc[sectionName] = cssRules.join('\n\n');
    return acc;
  }, {});
}

// Apply the styles from WordPress
export async function applyWPGlobalStyles() {
  try {
    // Get the styles from WordPress
    let response;
    try {
      response = await fetch('/wp-json/wp/v2/global-styles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (fetchError) {
      //console.warn('Could not fetch from relative path, trying with full URL');
      response = await fetch('https://source.randal.io/wp-json/wp/v2/global-styles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();
    //console.log('Fetched WordPress data:', data);

    // Get the variations directly from the correct path
    const variations = data?.styles?.blocks?.['core/group']?.variations;
    //console.log('Found group variations:', variations);

    if (!variations) {
      //console.warn('No group variations found in styles.blocks[core/group].variations');
      return {};
    }

    // Process the variations into CSS
    const processedStyles = processStyleObjects(variations);
    
    // Create style element
    const styleElement = document.createElement('style');
    styleElement.setAttribute('id', 'wp-global-styles');
    
    // Combine all processed styles
    const cssContent = Object.values(processedStyles).join('\n\n');
    styleElement.textContent = cssContent;
    
    // Remove existing styles if present
    const existingStyles = document.getElementById('wp-global-styles');
    if (existingStyles) {
      existingStyles.remove();
    }
    
    // Add styles to document head
    document.head.appendChild(styleElement);
    
    return processedStyles;
  } catch (error) {
    console.error('Error applying global styles:', error);
    throw error;
  }
}