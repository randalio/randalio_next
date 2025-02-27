import { useEffect } from "react";

const FormHandler = () => {
  useEffect(() => {
    const formElement = document.querySelector("form");

    if (formElement) {
      const formSubmissionHandler = async (event) => {
        event.preventDefault();

        const { action, method } = event.target;
        const body = new FormData(event.target);

        try {
          const response = await fetch(action, {
            method,
            body,
          });

          const data = await response.json();

          if (isFormSubmissionError(data)) {
            console.error("Validation error:", data.errors);
          } else {
            console.log("Form submitted successfully!");
          }
        } catch (error) {
          console.error("Form submission failed:", error);
        }
      };

      formElement.addEventListener("submit", formSubmissionHandler);

      return () => {
        formElement.removeEventListener("submit", formSubmissionHandler);
      };
    }
  }, []);

  return null; // This component does not render anything, it just manages form handling.
};

const isFormSubmissionError = (response) => {
  return response?.errors?.length > 0;
};

export default FormHandler;