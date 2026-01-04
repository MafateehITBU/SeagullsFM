import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import AdvetisementLayer from "../components/AdvertisementLayer";

const AdvertisementPage = () => {
  return (
    <MasterLayout>
      <div className="page-wrapper">
        <div className="page-content">
          <Breadcrumb title="Advertisements" />
          <AdvetisementLayer />
        </div>
      </div>
    </MasterLayout>
  );
};

export default AdvertisementPage;
