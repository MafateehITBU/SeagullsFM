import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import BroadcasterLayer from "../components/BroadcasterLayer";

const BroadcasterPage = () => {
  return (
    <MasterLayout>
      <Breadcrumb title="Broadcasters Management" />
      <BroadcasterLayer />
    </MasterLayout>
  );
};

export default BroadcasterPage;
