import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer bg-light py-5 mt-5 text-dark">
        <div className="container">
          <div className="row g-4">
            {/* MAROCRAFT Info */}
            <div className="col-lg-3 col-md-6">
              <h3 className="footer-title text-dark mb-4 fw-bold">MAROCRAFT</h3>
              <p className="text-secondary mb-4">
                Discover authentic Moroccan handicrafts from talented artisans.
                We connect craftspeople with customers worldwide who appreciate
                handmade quality.
              </p>
              <div className="social-links d-flex gap-3 mb-4">
                <a
                  href="#"
                  className="text-dark hover-orange"
                  title="Facebook"
                  aria-label="Facebook"
                >
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a
                  href="#"
                  className="text-dark hover-orange"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <i className="fab fa-instagram"></i>
                </a>
                <a
                  href="#"
                  className="text-dark hover-orange"
                  title="Twitter"
                  aria-label="Twitter"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-dark hover-orange"
                  title="Pinterest"
                  aria-label="Pinterest"
                >
                  <i className="fab fa-pinterest"></i>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-3 col-md-6">
              <h3 className="footer-title text-dark mb-4 fw-bold">
                Quick Links
              </h3>
              <ul className="footer-links ps-0">
                <li className="mb-2">
                  <a
                    href="/about"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    About Us
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/contact"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Contact Us
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/faq"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    FAQ
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/shipping"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Shipping Info
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/terms"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/privacy"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Shop Categories */}
            <div className="col-lg-3 col-md-6">
              <h3 className="footer-title text-dark mb-4 fw-bold">
                Shop Categories
              </h3>
              <ul className="footer-links ps-0">
                <li className="mb-2">
                  <a
                    href="/category/carpets-rugs"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Carpets & Rugs
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/category/pottery-ceramics"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Pottery & Ceramics
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/category/leather-goods"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Leather Goods
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/category/textiles"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Textiles
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/category/jewelry"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    Jewelry
                  </a>
                </li>
                <li className="mb-2">
                  <a
                    href="/categories"
                    className="text-secondary text-decoration-none hover-orange"
                  >
                    View All Categories
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="col-lg-3 col-md-6">
              <h3 className="footer-title text-dark mb-4 fw-bold">
                Newsletter
              </h3>
              <p className="text-secondary mb-3">
                Subscribe to get updates on new artisans and products.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="newsletter-form mb-4"
              >
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control bg-white border border-secondary"
                    placeholder="Your email address"
                    required
                    aria-label="Email address"
                  />
                  <button
                    className="btn btn-warning text-white"
                    type="submit"
                    aria-label="Subscribe"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </div>
              </form>
            </div>
            <div className="d-flex justify-content-center mt-4">
              <ul className="footer-links ps-0 d-flex flex-wrap gap-4 justify-content-center fs-6">
                <li className="text-secondary d-flex align-items-center">
                  <i className="fas fa-envelope me-2 text-warning fs-6"></i>
                  support@marocraft.com
                </li>
                <li className="text-secondary d-flex align-items-center">
                  <i className="fas fa-phone me-2 text-warning fs-6"></i>
                  +212 641035961
                </li>
                <li className="text-secondary d-flex align-items-center">
                  <i className="fas fa-map-marker-alt me-2 text-warning fs-6"></i>
                  27 Hay Salam Meknes
                </li>
              </ul>
            </div>
          </div>

          <hr className="my-4 border-secondary" />

          <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center">
            <p className="mb-0 text-secondary">
              &copy; {currentYear} MAROCRAFT. All rights reserved.
            </p>
            <div className="payment-methods">
              <span className="text-secondary me-2">Payment Methods:</span>
              <i className="fab fa-cc-visa text-dark me-1"></i>
              <i className="fab fa-cc-mastercard text-dark me-1"></i>
              <i className="fab fa-cc-paypal text-dark me-1"></i>
              <i className="fab fa-cc-apple-pay text-dark"></i>
            </div>
          </div>
        </div>
      </footer>

      {/* Inline styles for hover-orange and input styling */}
      <style jsx>{`
        .hover-orange:hover {
          color: #f97316 !important; /* Tailwind orange-500 */
          transition: color 0.3s ease;
        }
        .footer-links {
          list-style: none;
          padding-left: 0;
        }
        .newsletter-form .form-control::placeholder {
          color: #999;
        }
      `}</style>
    </>
  );
};

export default Footer;
