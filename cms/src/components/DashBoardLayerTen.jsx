import React, { useState, useEffect } from "react";
import axiosInstance from "../axiosConfig";
import UnitCountSeven from "./child/UnitCountSeven";
import ProductDetailsModal from "./modals/ProductDetailsModal";
import QuotationDetailsModal from "./modals/QuotationDetailsModal";

const DashBoardLayerTen = () => {
  const [quotations, setQuotations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productDetailsModal, setProductDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quotationDetailsModal, setQuotationDetailsModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);

  const fetchData = async () => {
    try {
      const [quotationsRes, productsRes] = await Promise.all([
        axiosInstance.get("/quotation-requests"),
        axiosInstance.get("/products"),
      ]);
      // filter the quotattion status to be only "ongoing"
      const quots = quotationsRes.data.data.quotationRequests;
      const filteredQuotations = quots.filter(
        (quotation) => quotation.status === "ongoing"
      );
      setQuotations(filteredQuotations);
      setProducts(productsRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="sr-only"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="row gy-4">
      {/* UnitCountSeven */}
      <UnitCountSeven />

      {/* Quotations & Products */}
      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Ongoing Quotations</h5>
            <a href="/quotations" className="btn btn-sm btn-primary">
              See More
            </a>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Client Name</th>
                    <th scope="col">Company Name</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {quotations.slice(0, 5).map((quotation, index) => (
                    <tr key={quotation.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{quotation.name}</td>
                      <td>{quotation.companyName}</td>
                      <td>
                        <span
                          onClick={() => {
                            setSelectedQuotation(quotation);
                            setQuotationDetailsModal(true);
                          }}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                  {quotations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No ongoing quotations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-6">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Products</h5>
            <a href="/products" className="btn btn-sm btn-primary">
              See More
            </a>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Category</th>
                    <th scope="col">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product, index) => (
                    <tr key={product.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{product.name}</td>
                      <td>{product.category?.name}</td>
                      <td>
                        <span
                          onClick={() => {
                            setSelectedProduct(product);
                            setProductDetailsModal(true);
                          }}
                          className="btn btn-sm btn-outline-primary"
                        >
                          View
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal  */}
      <ProductDetailsModal
        show={productDetailsModal}
        handleClose={() => setProductDetailsModal(false)}
        product={selectedProduct}
      />

      {/* Quotation Details Modal  */}
      <QuotationDetailsModal
        show={quotationDetailsModal}
        handleClose={() => setQuotationDetailsModal(false)}
        quotation={selectedQuotation}
      />
    </div>
  );
};

export default DashBoardLayerTen;
