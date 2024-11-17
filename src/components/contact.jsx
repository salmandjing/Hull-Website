import { useState, useEffect } from "react";
import React from "react";

const initialState = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const initialErrors = {
  email: "",
  phone: ""
};

// Rate limiting constants
const MAX_SUBMISSIONS = 3; // Maximum submissions allowed
const TIMEOUT_DURATION = 1800000; // 30 minutes in milliseconds
const SUBMISSION_RESET = 86400000; // 24 hours in milliseconds

export const Contact = (props) => {
  const [{ name, email, phone, message }, setState] = useState(initialState);
  const [errors, setErrors] = useState(initialErrors);
  const [status, setStatus] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rateLimitInfo, setRateLimitInfo] = useState({
    remaining: MAX_SUBMISSIONS,
    nextReset: null
  });

  // Load rate limit info on component mount
  useEffect(() => {
    checkRateLimit();
  }, []);

  // Function to check rate limit status
  const checkRateLimit = () => {
    const now = Date.now();
    const savedData = JSON.parse(localStorage.getItem('formSubmissionData') || '{}');
    const submissions = savedData.submissions || [];
    const resetTime = savedData.resetTime || now;

    // Clear submissions after 24 hours
    if (now >= resetTime) {
      localStorage.setItem('formSubmissionData', JSON.stringify({
        submissions: [],
        resetTime: now + SUBMISSION_RESET
      }));
      setRateLimitInfo({
        remaining: MAX_SUBMISSIONS,
        nextReset: null
      });
      return true;
    }

    // Filter out submissions older than timeout duration
    const recentSubmissions = submissions.filter(time => now - time < TIMEOUT_DURATION);
    const remaining = MAX_SUBMISSIONS - recentSubmissions.length;

    if (remaining <= 0) {
      const oldestSubmission = Math.min(...recentSubmissions);
      const nextReset = oldestSubmission + TIMEOUT_DURATION;
      setRateLimitInfo({
        remaining: 0,
        nextReset
      });
      return false;
    }

    setRateLimitInfo({
      remaining,
      nextReset: null
    });
    return true;
  };

  // Function to update submission history
  const updateSubmissionHistory = () => {
    const now = Date.now();
    const savedData = JSON.parse(localStorage.getItem('formSubmissionData') || '{}');
    const submissions = savedData.submissions || [];
    const resetTime = savedData.resetTime || now + SUBMISSION_RESET;

    submissions.push(now);

    localStorage.setItem('formSubmissionData', JSON.stringify({
      submissions,
      resetTime
    }));

    checkRateLimit();
  };

  // Format remaining time for display
  const formatTimeRemaining = (nextReset) => {
    if (!nextReset) return '';
    const remaining = nextReset - Date.now();
    const minutes = Math.ceil(remaining / 60000);
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.ceil(minutes / 60);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Phone validation function
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!phone) {
      return "Phone number is required";
    }
    if (cleanPhone.length !== 10) {
      return "Phone number must be 10 digits";
    }
    return "";
  };

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const cleanNum = value.replace(/\D/g, '');
    if (cleanNum.length === 0) {
      return '';
    }
    if (cleanNum.length <= 3) {
      return cleanNum;
    }
    if (cleanNum.length <= 6) {
      return `${cleanNum.slice(0, 3)}-${cleanNum.slice(3)}`;
    }
    return `${cleanNum.slice(0, 3)}-${cleanNum.slice(3, 6)}-${cleanNum.slice(6, 10)}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'phone') {
      newValue = formatPhoneNumber(value);
    }

    setState((prevState) => ({ ...prevState, [name]: newValue }));

    if (name === 'email') {
      const emailError = validateEmail(value);
      setErrors(prev => ({ ...prev, email: emailError }));
    }
    if (name === 'phone') {
      const phoneError = validatePhone(value);
      setErrors(prev => ({ ...prev, phone: phoneError }));
    }
  };

  const clearState = () => {
    setState({ ...initialState });
    setErrors({ ...initialErrors });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check rate limit before proceeding
    if (!checkRateLimit()) {
      setStatus("error");
      setErrorMessage(`Too many submissions. Please try again in ${formatTimeRemaining(rateLimitInfo.nextReset)}.`);
      return;
    }

    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone);

    setErrors({
      email: emailError,
      phone: phoneError
    });

    if (emailError || phoneError) {
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const queryParams = new URLSearchParams({
      name,
      email,
      phone,
      message
    }).toString();

    const url = `https://i3ffhh2iva.execute-api.us-east-1.amazonaws.com/v1?${queryParams}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { error: text };
      }

      if (response.ok) {
        updateSubmissionHistory(); // Update rate limit tracking
        setStatus("success");
        clearState();
      } else {
        setStatus("error");
        setErrorMessage(data.message || data.error || 'An error occurred while sending the message');
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || 'Failed to send message');
    }
  };

  return (
    <div>
      <div id="contact">
        <div className="container">
          <div className="col-md-8">
            <div className="row">
              <div className="section-title">
                <h2>Get In Touch</h2>
                <p>
                  Please fill out the form below to send us an email and we will
                  get back to you as soon as possible.
                </p>
                {rateLimitInfo.remaining < MAX_SUBMISSIONS && (
                  <div className="alert alert-info">
                    You have {rateLimitInfo.remaining} submission{rateLimitInfo.remaining !== 1 ? 's' : ''} remaining.
                    {rateLimitInfo.nextReset && (
                      <span> Next submission available in {formatTimeRemaining(rateLimitInfo.nextReset)}.</span>
                    )}
                  </div>
                )}
              </div>
              <form name="sentMessage" onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        placeholder="Name"
                        required
                        onChange={handleChange}
                        value={name}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="Email"
                        required
                        onChange={handleChange}
                        value={email}
                      />
                      {errors.email && (
                        <p className="help-block text-danger">{errors.email}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="Phone Number (e.g., 123-456-7890)"
                        required
                        onChange={handleChange}
                        value={phone}
                        maxLength="12"
                      />
                      {errors.phone && (
                        <p className="help-block text-danger">{errors.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    rows="4"
                    placeholder="Message"
                    required
                    onChange={handleChange}
                    value={message}
                  ></textarea>
                  <p className="help-block text-danger"></p>
                </div>
                <div id="success">
                  {status === "success" && (
                    <div className="alert alert-success">
                      Your message has been sent successfully!
                    </div>
                  )}
                  {status === "error" && (
                    <div className="alert alert-danger">
                      {errorMessage || "Sorry, there was an error sending your message."}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn btn-custom btn-lg"
                  disabled={status === "sending" || errors.email || errors.phone || rateLimitInfo.remaining === 0}
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>

          <div className="col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>Contact Info</h3>
              <p>
                <span>
                  <i className="fa fa-phone"></i> Phone
                </span>{" "}
                {props.data ? props.data.phone : "loading"}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> Email
                </span>{" "}
                {props.data ? props.data.email : "loading"}
              </p>
            </div>
          </div>
        </div >
      </div >
      <div id="footer">
        <div className="container text-center">
          <p>
            The information provided during financial coaching sessions is for educational purposes only and should not be considered financial advice. I am not a certified financial planner or advisor, and my recommendations are based on personal experience and general financial principles.

            Before making any financial decisions, please consult with a qualified financial professional who can consider your individual circumstances. I am not liable for any actions taken based on the information provided in our sessions.

            Your financial situation is unique, and it is essential to conduct your own research and due diligence before implementing any strategies discussed.
          </p>
        </div>
      </div>
    </div >
  );
};