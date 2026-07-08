import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function useConfirmNavigateBack(backPath, isDirty) {
  const navigate = useNavigate();

  return useCallback(async () => {
    if (isDirty) {
      const result = await Swal.fire({
        title: "Discard changes?",
        text: "You have unsaved changes. Are you sure you want to go back?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, go back",
        cancelButtonText: "Stay on page",
        reverseButtons: true,
      });

      if (!result.isConfirmed) return;
    }

    navigate(backPath);
  }, [backPath, isDirty, navigate]);
}
