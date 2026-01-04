import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import UploadedTracksLayer from "../components/UploadedTracksLayer";

const UploadedTracksPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Uploaded Tracks" />
      <UploadedTracksLayer />
    </MasterLayout>
  );
};

export default UploadedTracksPage;
