import React, { useState } from "react";

export const Services = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateTime: "",
  });
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false
  });

  const commonFeatures = [
    "Bi-Weekly Coaching Sessions",
    "Budgeting and Savings Tools",
    "Accountability Check-ins"
  ];

  const advancedFeatures = [
    "Personalized Financial Plan Development",
    "Credit score improvement plan",
    "Customized financial tools",
    "Exclusive Financial Resources",
    "Savings acceleration program",
    "Debt reduction strategy"
  ];

  const apexFeatures = [
    "Quarterly financial health assessments",
    "Mindset and Behavioral Finance Coaching",
    "Personalized Financial Tools & Automation Setup",
    "Personalized financial roadmap",
    "Financial education program",
    "Cash flow management"
  ];

  const handleOpenModal = (planName) => {
    setSelectedPlan(planName);
    setShowModal(true);
    document.body.style.overflow = 'hidden';
    // Reset form and status when opening modal
    setFormData({
      name: "",
      email: "",
      phone: "",
      dateTime: "",
    });
    setSubmitStatus({
      loading: false,
      error: null,
      success: false
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    document.body.style.overflow = 'unset';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({
      loading: true,
      error: null,
      success: false
    });

    try {
      // Create URL with query parameters
      const queryParams = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateTime: formData.dateTime,
        plan: selectedPlan
      }).toString();

      const response = await fetch(
        `https://pwosy4bv57.execute-api.us-east-1.amazonaws.com/v1?${queryParams}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to schedule consultation');
      }

      setSubmitStatus({
        loading: false,
        error: null,
        success: true
      });

      // Close modal after 2 seconds on success
      setTimeout(() => {
        handleCloseModal();
      }, 2000);

    } catch (error) {
      setSubmitStatus({
        loading: false,
        error: error.message || 'Failed to schedule consultation',
        success: false
      });
    }
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const renderFeatureList = (features, isIncluded = true) => {
    return features.map((feature, index) => (
      <li key={index} className={`feature-item ${isIncluded ? 'included' : 'not-included'}`}>
        {feature}
      </li>
    ));
  };

  return (
    <>
      <div id="services" className="services-container">
        <div className="service-card hover-card">
          <div className="card-content">
            <div className="card-header">
              <div className="icon-wrapper">
                <i className="fas fa-rocket"></i>
              </div>
              <h4>Pioneer</h4>
              <p>1 month</p>
              <p>Build a strong foundation</p>
              <div className="pricing">
                <h3>$49.99</h3>
              </div>
              <button
                className="btn-filled highlighted"
                onClick={() => handleOpenModal("Pioneer")}
              >
                Schedule Free Consultation
              </button>
            </div>
            <div className="features-section">
              <h5>Core Features</h5>
              <ul className="features-list">
                {renderFeatureList(commonFeatures)}
              </ul>
            </div>
          </div>
        </div>

        <div className="service-card hover-card">
          <div className="card-content">
            <div className="card-header">
              <div className="icon-wrapper">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4>Vanguard</h4>
              <p>3 Months</p>
              <p>Comprehensive support for long-term goals</p>
              <div className="pricing">
                <span className="original-price">$149.97</span>
                <h3>$124.99</h3>
              </div>
              <button
                className="btn-filled highlighted"
                onClick={() => handleOpenModal("Vanguard")}
              >
                Schedule Free Consultation
              </button>
              <span className="discount">16% off</span>
            </div>
            <div className="features-section">
              <h5>Core Features</h5>
              <ul className="features-list">
                {renderFeatureList(commonFeatures)}
                {renderFeatureList(advancedFeatures)}
              </ul>
            </div>
          </div>
        </div>

        <div className="service-card hover-card">
          <div className="card-content">
            <div className="card-header">
              <div className="icon-wrapper">
                <i className="fas fa-crown"></i>
              </div>
              <h4>Apex</h4>
              <p>6 Months</p>
              <p>Most Popular plan</p>
              <div className="pricing">
                <span className="original-price">$299.94</span>
                <h3>$229.99</h3>
              </div>
              <button
                className="btn-filled"
                onClick={() => handleOpenModal("Apex")}
              >
                Schedule Free Consultation
              </button>
              <span className="discount">23% off</span>
            </div>
            <div className="features-section">
              <h5>Core Features</h5>
              <ul className="features-list">
                {renderFeatureList(commonFeatures)}
                {renderFeatureList(advancedFeatures)}
                {renderFeatureList(apexFeatures)}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Consultation Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <h2>Schedule Free Consultation</h2>
            <p>Selected Plan: {selectedPlan}</p>

            <form onSubmit={handleSubmit} className="consultation-form">
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  disabled={submitStatus.loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  disabled={submitStatus.loading}
                />
              </div>

              <div className="form-group">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                  disabled={submitStatus.loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateTime">Select Preferred Date and Time</label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="dateTime"
                  value={formData.dateTime}
                  onChange={handleInputChange}
                  className="form-control"
                  min={today}
                  required
                  disabled={submitStatus.loading}
                />
              </div>

              {submitStatus.error && (
                <div className="alert alert-error">
                  {submitStatus.error}
                </div>
              )}

              {submitStatus.success && (
                <div className="alert alert-success">
                  Consultation scheduled successfully! We'll be in touch soon.
                </div>
              )}

              <button
                type="submit"
                className={`btn-filled ${submitStatus.loading ? 'btn-loading' : ''}`}
                disabled={submitStatus.loading || submitStatus.success}
              >
                {submitStatus.loading ? 'Scheduling...' : 'Schedule Consultation'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Services;