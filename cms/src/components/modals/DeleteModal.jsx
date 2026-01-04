import { Modal, Button } from "react-bootstrap";
import axiosInstance from "../../axiosConfig";
import { toast } from "react-toastify";
import { useState } from "react";

const DeleteModal = ({
  show,
  handleClose,
  item, // The object to delete (must contain _id)
  itemType, // String: 'product', 'admin', 'user', etc.
  fetchData, // Function to refresh the list
}) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/${itemType}/${item._id}`);
      toast.success(`${capitalize(itemType)} deleted successfully`);
      fetchData();
      handleClose();
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);

      // Check if backend sent a custom message
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";

      toast.error(`Failed to delete ${itemType}: ${errMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h5">Delete {capitalize(itemType)}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-center">
          Are you sure you want to delete{" "}
          <strong>
            {item?.name || item?.title || item?.userId?.name || "this item"}
          </strong>
          ?
          <br />
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          variant="secondary"
          onClick={handleClose}
          style={{ width: "120px" }}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          style={{ width: "120px" }}
        >
          {loading === true ? `Deleting...` : `Delete`}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteModal;
