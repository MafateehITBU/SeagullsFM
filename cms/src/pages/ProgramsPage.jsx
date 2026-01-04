import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import ProgramsLayer from "../components/ProgramsLayer";

const ProgramsPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Programs Management" />
      <ProgramsLayer />
    </MasterLayout>
  );
};

export default ProgramsPage;
