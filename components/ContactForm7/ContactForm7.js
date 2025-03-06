import { useEffect } from 'react';
import { useRouter } from 'next/router';
// Remove the direct Faust config import to avoid module issues

const ContactFormHandler = () => {
  // Access Next.js router for navigation
  const router = useRouter();
  
  useEffect(() => {
    // Flag to track if we're handling a submission
    let isSubmitting = false;
    
    // Use hardcoded URL as fallback, since we're having issues with the import
    const wpUrl = 'https://source.randal.io';
    console.log('Using WordPress URL:', wpUrl);
    
    // Function to redirect to thank you page
    const redirectToThankYou = () => {
      console.log('Redirecting to thank you page');
      // You can customize the thank you page URL here
      const thankYouPath = '/thank-you';
      
      // Use Next.js router for client-side navigation
      router.push(thankYouPath);
    };
    
    // Wait for DOM to be fully loaded
    const setupFormInterception = () => {
      // Find the Contact Form 7 form on the page
      const form = document.querySelector('.wpcf7-form');
      
      if (!form) {
        console.log('Contact Form 7 form not found, will check again later');
        return;
      }
      
      // Exit if we've already processed this form
      if (form._hasCustomHandler) {
        return;
      }
      
      console.log('Found CF7 form, setting up custom handler with redirect');
      
      // Create a custom submit handler that prevents double submissions
      const handleSubmit = async (e) => {
        // Prevent default form submission and stop propagation
        e.preventDefault();
        e.stopPropagation();
        
        // Prevent double submissions
        if (isSubmitting) {
          console.log('Already processing a submission, ignoring');
          return false;
        }
        
        console.log('Form submission intercepted by custom handler');
        isSubmitting = true;
        
        // Get form data
        const formData = new FormData(form);
        
        try {
          // Show loading state
          form.classList.add('submitting');
          
          // Get form ID (look for it in the DOM or use default)
          let formId = '3704'; // Default ID
          const formElement = form.closest('.wpcf7');
          if (formElement && formElement.dataset.id) {
            formId = formElement.dataset.id;
          }
          
          console.log(`Submitting to CF7 endpoint: ${wpUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`);
          
          // Submit via fetch
          const response = await fetch(
            `${wpUrl}/wp-json/contact-form-7/v1/contact-forms/${formId}/feedback`,
            {
              method: 'POST',
              body: formData
            }
          );
          
          const data = await response.json();
          console.log('Form submission response:', data);
          
          // Remove loading state
          form.classList.remove('submitting');
          
          if (data.status === 'mail_sent') {
            console.log('Form submitted successfully, preparing to redirect');
            form.reset();
            
            // Show brief success message before redirecting
            const statusDiv = form.querySelector('.wpcf7-response-output') || 
              document.createElement('div');
            statusDiv.textContent = 'Thank you! Redirecting...';
            statusDiv.className = 'wpcf7-response-output sent';
            
            if (!form.contains(statusDiv)) {
              form.appendChild(statusDiv);
            }
            
            // Short delay before redirect to show the message
            setTimeout(redirectToThankYou, 1000);
          } else {
            // Handle errors without redirecting
            const statusDiv = form.querySelector('.wpcf7-response-output') || 
              document.createElement('div');
            statusDiv.textContent = data.message || 'There was an error sending your message.';
            statusDiv.className = 'wpcf7-response-output failed';
            
            if (!form.contains(statusDiv)) {
              form.appendChild(statusDiv);
            }
          }
        } catch (error) {
          console.error('Form submission error:', error);
          form.classList.remove('submitting');
          
          const statusDiv = form.querySelector('.wpcf7-response-output') ||
            document.createElement('div');
            
          statusDiv.textContent = 'There was an error submitting the form.';
          statusDiv.className = 'wpcf7-response-output failed';
          
          if (!form.contains(statusDiv)) {
            form.appendChild(statusDiv);
          }
        } finally {
          // Reset submission flag
          isSubmitting = false;
        }
        
        return false;
      };

      // Disable any existing CF7 initialization
      try {
        // For CF7 version 5.4+
        if (window.wpcf7) {
          const formElement = form.closest('.wpcf7');
          if (formElement && formElement.wpcf7) {
            const originalInit = formElement.wpcf7.init;
            formElement.wpcf7.init = function() {
              console.log('Prevented CF7 re-initialization');
              return false;
            };
          }
        }
      } catch (e) {
        console.log('Error while trying to disable CF7:', e);
      }
      
      // Use capture phase to catch the event before CF7 does
      form.addEventListener('submit', handleSubmit, { capture: true });
      
      // Disable CF7's submit button event handlers by replacing it
      const submitButton = form.querySelector('input[type="submit"]');
      if (submitButton) {
        const newSubmitButton = submitButton.cloneNode(true);
        submitButton.parentNode.replaceChild(newSubmitButton, submitButton);
        
        // Add click handler to the new button
        newSubmitButton.addEventListener('click', (e) => {
          e.preventDefault();
          handleSubmit(new Event('submit', { cancelable: true }));
        });
      }
      
      // Mark the form so we don't add multiple handlers
      form._hasCustomHandler = true;
      
      console.log('Form handler with redirect attached successfully');
    };

    // Initial setup with a slight delay to ensure DOM is ready
    const initialSetupTimeout = setTimeout(setupFormInterception, 1000);
    
    // Check periodically for forms
    const checkInterval = setInterval(() => {
      const form = document.querySelector('.wpcf7-form');
      if (form && !form._hasCustomHandler) {
        setupFormInterception();
      }
    }, 2000);
    
    // Handle Faust.js route changes
    const handleRouteChange = () => {
      console.log('Route changed, will check for CF7 forms');
      isSubmitting = false; // Reset submission state on route change
      setTimeout(setupFormInterception, 1000);
    };
    
    window.addEventListener('routeChanged', handleRouteChange);
    
    // Clean up
    return () => {
      clearTimeout(initialSetupTimeout);
      clearInterval(checkInterval);
      window.removeEventListener('routeChanged', handleRouteChange);
      isSubmitting = false;
    };
  }, [router]); // Add router to dependency array
  
  return null;
};

export default ContactFormHandler;