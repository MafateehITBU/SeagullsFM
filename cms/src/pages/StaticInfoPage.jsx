import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import StaticInfoLayer from "../components/StaticInfoLayer";

const StaticInfoPage = () => {
  {
    return (
      <MasterLayout>
        <Breadcrumb title="Static Info" />
        <StaticInfoLayer />
      </MasterLayout>
    );
  }
};

export default StaticInfoPage;
