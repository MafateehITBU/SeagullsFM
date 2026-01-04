import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axiosInstance from "../../axiosConfig";

const UnitCountSeven = () => {
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [contactCount, setContactCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [quotSentCount, setQuotSentCount] = useState(0);
  const [quotClosedCount, setQuotClosedCount] = useState(0);
  const [quotOnGoingCount, setQuotOnGoingCount] = useState(0);

  useEffect(() => {
    const fetchproductCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/products");
        setProductCount(response.data.data.length);
      } catch (error) {
        console.error("Error fetching products count:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchContactCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/contact-us/stats");
        setContactCount(response.data.data.total);
      } catch (error) {
        console.error("Error fetching contact-us count:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/user");
        setUserCount(response.data.data.length);
      } catch (error) {
        console.error("Error fetching users count:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchQuotCount = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/quotation-requests/stats");
        setQuotSentCount(response.data.data.byStatus.sent);
        setQuotClosedCount(response.data.data.byStatus.closed);
        setQuotOnGoingCount(response.data.data.byStatus.ongoing);
      } catch (error) {
        console.error("Error fetching quotations count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchproductCount();
    fetchContactCount();
    fetchUserCount();
    fetchQuotCount();
  }, []);

  // handle card click navigation
  const handleCardClick = (path) => {
    window.location.href = path;
  };

  return (
    <>
      <div className="col-12">
        <div className="card radius-12">
          <div className="card-body p-16">
            <div className="row gy-4">
              {/* Products */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/products")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-1 left-line line-bg-primary position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Products
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : (
                          productCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-primary-100 text-primary-600">
                      <i className="ri-user-settings-line" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total Products</p>
                </div>
              </div>

              {/* Users */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/users")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Users
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : error ? (
                          <span className="text-danger-main">Error</span>
                        ) : (
                          userCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600">
                      <i className="ri-brush-fill" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total Users</p>
                </div>
              </div>

              {/* Contact Us */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/contact-us")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Contact Us Messages
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : error ? (
                          <span className="text-danger-main">Error</span>
                        ) : (
                          contactCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600">
                      <i className="ri-tools-fill" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total Messages</p>
                </div>
              </div>

              {/* Quotations — On-going */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/quotations")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-2 left-line line-bg-lilac position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Quotation Requests
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : (
                          quotOnGoingCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-lilac-200 text-lilac-600">
                      <i className="ri-building-2-line" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total On-going Quotations</p>
                </div>
              </div>

              {/* Quotations — Sent */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/quotations")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-3 left-line line-bg-success position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Quotation Requests
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : (
                          quotSentCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-success-200 text-success-600">
                      <i className="ri-store-2-line" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total Sent Quotations</p>
                </div>
              </div>

              {/* Quotations — Closed */}
              <div
                className="col-xxl-4 col-xl-5 col-sm-6"
                onClick={() =>
                  handleCardClick("https://dashboard.sergio-ind.com/quotations")
                }
                style={{ cursor: "pointer" }}
              >
                <div className="px-20 py-16 shadow-none radius-8 h-100 gradient-deep-4 left-line line-bg-warning position-relative overflow-hidden">
                  <div className="d-flex flex-wrap align-items-center justify-content-between gap-1 mb-8">
                    <div>
                      <span className="mb-2 fw-medium text-secondary-light text-md">
                        Quotation Requests
                      </span>
                      <h6 className="fw-semibold mb-1">
                        {loading ? (
                          <div className="h-6 w-16 bg-neutral-200 rounded animate-pulse" />
                        ) : (
                          quotClosedCount
                        )}
                      </h6>
                    </div>
                    <span className="w-44-px h-44-px radius-8 d-inline-flex justify-content-center align-items-center text-2xl mb-12 bg-warning-200 text-warning-600">
                      <i className="ri-tools-line" />
                    </span>
                  </div>
                  <p className="text-sm mb-0">Total Closed Quotations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UnitCountSeven;
