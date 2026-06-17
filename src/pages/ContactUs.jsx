import { useState } from 'react';
import SocialLinks from '../components/SocialLinks.jsx';
import { submitContact } from '../api/contact.js';

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-.4 4.25-7.1 5.33a.83.83 0 0 1-1 0L4.4 8.25V6.5l7.6 5.7 7.6-5.7v1.75Z" />
    </svg>
  );
}

function ContactUs() {
  const [submitState, setSubmitState] = useState({
    status: 'idle',
    message: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    setSubmitState({
      status: 'loading',
      message: '',
    });

    try {
      await submitContact({
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        phoneNumber: formData.get('phoneNumber').trim(),
        message: formData.get('message').trim(),
      });

      form.reset();
      setSubmitState({
        status: 'success',
        message: 'Thank you. Your message has been sent successfully.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error.message || 'Unable to send your message. Please try again.',
      });
    }
  };

  return (
    <>
      <section className="contactInfo">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8" data-aos="fade-up">
              <h2>Contact Info</h2>
              <p>
                For image enquiries, portfolio questions, or collaboration
                requests, send a message and we will get back to you.
              </p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9" data-aos="fade-up">
              <div className="contactInfo-card">
                <span className="contactInfo-icon">
                  <MailIcon />
                </span>
                <div>
                  <h3>Email</h3>
                  <a href="mailto:adrian.elliott55@gmail.com">
                    adrian.elliott55@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9" data-aos="fade-up">
              <div className="contactInfo-social">
                <span>Follow Adrian</span>
                <SocialLinks className="d-flex align-items-center" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contactForm">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8" data-aos="fade-up">
              <h2>Fill Out The Form</h2>
            </div>
          </div>

          <form className="row g-4" onSubmit={handleSubmit}>
            <div className="col-md-3 col-sm-6" data-aos="fade-up">
              <input
                aria-label="First Name"
                className="form-control"
                name="firstName"
                placeholder="First Name"
                required
                type="text"
              />
            </div>

            <div className="col-md-3 col-sm-6" data-aos="fade-up">
              <input
                aria-label="Last Name"
                className="form-control"
                name="lastName"
                placeholder="Last Name"
                required
                type="text"
              />
            </div>

            <div className="col-md-3 col-sm-6" data-aos="fade-up">
              <input
                aria-label="Email Address"
                className="form-control"
                name="email"
                placeholder="Email Address"
                required
                type="email"
              />
            </div>

            <div className="col-md-3 col-sm-6" data-aos="fade-up">
              <input
                aria-label="Phone Number"
                className="form-control"
                name="phoneNumber"
                placeholder="Phone Number"
                required
                type="tel"
              />
            </div>

            <div className="col-12" data-aos="fade-up">
              <textarea
                aria-label="Message"
                className="form-control"
                name="message"
                placeholder="Message"
                required
                rows="6"
              />
            </div>

            <div
              className="col-12 d-flex align-items-center justify-content-between gap-3"
              data-aos="fade-up"
            >
              <p
                aria-live="polite"
                className={`contactForm-status contactForm-status--${submitState.status}`}
                role="status"
              >
                {submitState.message}
              </p>
              <button
                className="contactForm-btn"
                disabled={submitState.status === 'loading'}
                type="submit"
              >
                {submitState.status === 'loading' ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}

export default ContactUs;
